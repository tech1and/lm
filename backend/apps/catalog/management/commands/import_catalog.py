import xml.etree.ElementTree as ET
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from apps.catalog.models import Product, Category
import uuid
import re
import gc


class Command(BaseCommand):
    help = 'Импорт каталога Лемана Про из YML (XML) — итеративный парсинг, низкое потребление памяти'

    def add_arguments(self, parser):
        parser.add_argument('xml_file', type=str, help='Путь к YML файлу')
        parser.add_argument('--categories-only', action='store_true', help='Импорт только категорий')
        parser.add_argument('--limit', type=int, default=0, help='Лимит товаров (0 = все)')
        parser.add_argument('--batch-size', type=int, default=500, help='Размер батчи для bulk_create/update')
        parser.add_argument('--dry-run', action='store_true', help='Тест без записи в БД')

    def clean_text(self, text):
        if not text:
            return ''
        return re.sub(r'\s+', ' ', text.strip())

    def get_text(self, element, tag):
        el = element.find(tag)
        if el is not None and el.text:
            return self.clean_text(el.text)
        return ''

    def parse_categories_iterative(self, xml_file):
        """Итеративный парсинг категорий — не загружает весь файл в память"""
        self.stdout.write('📂 Парсинг категорий...')
        category_map = {}
        cat_count = 0

        for event, elem in ET.iterparse(xml_file, events=('start', 'end')):
            if event == 'end' and elem.tag == 'category':
                cat_id = elem.get('id')
                name = self.clean_text(elem.text)
                parent_id = elem.get('parentId')

                if name:
                    slug_base = slugify(name, allow_unicode=True)
                    if not slug_base:
                        slug_base = f'cat-{cat_id}'

                    parent = category_map.get(parent_id) if parent_id else None

                    cat, created = Category.objects.update_or_create(
                        xml_id=cat_id,
                        defaults={
                            'name': name,
                            'slug': slug_base,
                            'parent': parent,
                            'level': 0 if parent is None else parent.level + 1,
                        }
                    )

                    if created:
                        # Обновляем path
                        path = [cat.slug]
                        p = cat.parent
                        path_parts = []
                        while p:
                            path_parts.insert(0, p.slug)
                            p = p.parent
                        path_parts.append(cat.slug)
                        cat.path = path_parts
                        cat.save(update_fields=['path'])
                        # Пересоздаём запись в map с обновлённым parent для дочерних
                        category_map[cat_id] = Category.objects.get(pk=cat.pk)
                    else:
                        category_map[cat_id] = cat

                    cat_count += 1

                # Освобождаем память
                elem.clear()

            # Очищаем корневые элементы
            if event == 'end' and elem.tag in ('categories', 'category'):
                elem.clear()

        self.stdout.write(self.style.SUCCESS(f'✅ Категорий обработано: {cat_count}'))
        return category_map

    def parse_offers_iterative(self, xml_file, category_map, limit=0, batch_size=500, dry_run=False):
        """Итеративный парсинг товаров — по одному, с батчами"""
        self.stdout.write('🛒 Парсинг товаров...')
        created = updated = skipped = errors = 0
        batch = []
        offer_count = 0

        for event, elem in ET.iterparse(xml_file, events=('start', 'end')):
            if event == 'end' and elem.tag == 'offer':
                offer_count += 1
                if limit and offer_count > limit:
                    break

                try:
                    offer_id = elem.get('id')
                    if not offer_id:
                        skipped += 1
                        elem.clear()
                        continue

                    name = self.get_text(elem, 'name')
                    if not name:
                        name = f'Товар {offer_id}'

                    category_id = self.get_text(elem, 'categoryId')
                    price_text = self.get_text(elem, 'price')
                    try:
                        price = float(price_text) if price_text else 0
                    except ValueError:
                        price = 0

                    # Параметры
                    params = {}
                    brand_value = ''
                    for param in elem.findall('param'):
                        param_name = param.get('name', '').strip()
                        param_value = self.clean_text(param.text)
                        if param_name:
                            params[param_name] = param_value
                            if param_name.lower() in ('бренд', 'brand'):
                                brand_value = param_value

                    country = self.get_text(elem, 'country_of_origin')
                    barcode = self.get_text(elem, 'barcode')
                    weight_text = self.get_text(elem, 'weight')
                    dimensions = self.get_text(elem, 'dimensions')

                    try:
                        weight = float(weight_text) if weight_text else None
                    except ValueError:
                        weight = None

                    images = [
                        self.clean_text(img.text)
                        for img in elem.findall('picture')
                        if img.text
                    ]

                    description_raw = self.get_text(elem, 'description')
                    url = self.get_text(elem, 'url')
                    in_stock = elem.get('available', 'true') == 'true'
                    pickup = self.get_text(elem, 'pickup') == 'true'
                    delivery = self.get_text(elem, 'delivery') == 'true'
                    currency = self.get_text(elem, 'currencyId') or 'RUR'

                    if dry_run:
                        created += 1
                        elem.clear()
                        continue

                    # Генерация slug
                    slug_base = slugify(name[:100], allow_unicode=True)
                    if not slug_base:
                        slug_base = str(uuid.uuid4())[:8]

                    product, is_new = Product.objects.update_or_create(
                        xml_id=offer_id,
                        defaults={
                            'name': name,
                            'description_raw': description_raw,
                            'description': description_raw,
                            'price': price,
                            'currency': currency,
                            'in_stock': in_stock,
                            'pickup_available': pickup,
                            'delivery_available': delivery,
                            'images': images,
                            'params': params,
                            'brand': brand_value or '',
                            'vendor': '',
                            'model': '',
                            'country_of_origin': country,
                            'weight': weight,
                            'dimensions': dimensions,
                            'barcode': barcode,
                            'url': url,
                        }
                    )

                    if not product.slug:
                        slug = slug_base
                        counter = 1
                        while Product.objects.filter(slug=slug).exclude(pk=product.pk).exists():
                            slug = f'{slug_base}-{counter}'
                            counter += 1
                        product.slug = slug
                        product.save(update_fields=['slug'])

                    cat_obj = category_map.get(category_id)
                    if cat_obj:
                        product.categories.set([cat_obj])

                    if is_new:
                        created += 1
                    else:
                        updated += 1

                except Exception as e:
                    errors += 1
                    self.stderr.write(f'✗ Ошибка на offer {elem.get("id")}: {e}')

                # Освобождаем память
                elem.clear()

                # Промежуточный GC и лог
                if offer_count % 5000 == 0:
                    gc.collect()
                    self.stdout.write(f'  Обработано: {offer_count} (создано={created}, обновлено={updated}, ошибок={errors})')

        summary = f'✅ Готово: создано={created}, обновлено={updated}, ошибок={errors}'
        if skipped:
            summary += f', пропущено={skipped}'
        self.stdout.write(self.style.SUCCESS(summary))

    def handle(self, *args, **options):
        xml_file = options['xml_file']
        dry_run = options['dry_run']
        limit = options['limit']
        batch_size = options['batch_size']
        categories_only = options['categories_only']

        self.stdout.write(f'📦 Импорт из {xml_file}')
        self.stdout.write(f'   dry_run={dry_run}, limit={limit or "все"}, categories_only={categories_only}')

        # Парсим категории
        category_map = self.parse_categories_iterative(xml_file)

        if categories_only:
            self.stdout.write(self.style.SUCCESS('✅ Импорт категорий завершён'))
            return

        # Парсим товары
        self.parse_offers_iterative(xml_file, category_map, limit=limit, batch_size=batch_size, dry_run=dry_run)
