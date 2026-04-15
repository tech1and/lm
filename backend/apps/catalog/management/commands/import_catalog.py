import xml.etree.ElementTree as ET
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from apps.catalog.models import Product, Category
import uuid
import re


class Command(BaseCommand):
    help = 'Импорт каталога Лемана Про из YML (XML)'

    def add_arguments(self, parser):
        parser.add_argument('xml_file', type=str, help='Путь к YML файлу')
        parser.add_argument('--categories-only', action='store_true', help='Импорт только категорий')
        parser.add_argument('--limit', type=int, default=0, help='Лимит товаров (0 = все)')
        parser.add_argument('--dry-run', action='store_true', help='Тест без записи в БД')

    def clean_text(self, text):
        """Очистка текста"""
        if not text:
            return ''
        return re.sub(r'\s+', ' ', text.strip())

    def get_text(self, element, tag):
        """Безопасное получение текста из элемента"""
        el = element.find(tag)
        if el is not None and el.text:
            return self.clean_text(el.text)
        return ''

    def parse_categories(self, root):
        """Парсинг дерева категорий"""
        cat_elements = root.findall('.//categories/category')
        category_map = {}

        self.stdout.write(f'📂 Найдено категорий: {len(cat_elements)}')

        for cat_el in cat_elements:
            cat_id = cat_el.get('id')
            name = self.clean_text(cat_el.text)
            parent_id = cat_el.get('parentId')

            if not name:
                continue

            # Формируем slug
            slug_base = slugify(name, allow_unicode=True)
            if not slug_base:
                slug_base = f'cat-{cat_id}'
            slug = slug_base

            # Находим родителя
            parent = category_map.get(parent_id) if parent_id else None

            # Создаём или обновляем
            cat, created = Category.objects.update_or_create(
                xml_id=cat_id,
                defaults={
                    'name': name,
                    'slug': slug,
                    'parent': parent,
                    'level': 0 if parent is None else parent.level + 1,
                }
            )

            if not created:
                # Обновляем path
                cat.path = self.build_path(cat)
                cat.save(update_fields=['path'])
            else:
                cat.path = self.build_path(cat)
                cat.save(update_fields=['path'])

            category_map[cat_id] = cat

        self.stdout.write(self.style.SUCCESS(f'✅ Категорий обработано: {len(category_map)}'))

        if options['categories_only']:
            self.stdout.write(self.style.SUCCESS('✅ Импорт категорий завершён'))
            return

        return category_map

    def build_path(self, category):
        """Построение пути категории"""
        path = [category.slug]
        parent = category.parent
        while parent:
            path.insert(0, parent.slug)
            parent = parent.parent
        return path

    @transaction.atomic
    def handle(self, *args, **options):
        xml_file = options['xml_file']
        dry_run = options['dry_run']
        limit = options['limit']

        self.stdout.write(f'📦 Импорт из {xml_file}')
        self.stdout.write(f'   dry_run={dry_run}, limit={limit or "все"}')

        tree = ET.parse(xml_file)
        root = tree.getroot()

        # Парсим категории
        category_map = self.parse_categories(root)

        # Парсим товары
        offers = root.findall('.//offers/offer')
        total_offers = len(offers)
        self.stdout.write(f'🛒 Найдено товаров: {total_offers}')

        if limit:
            offers = offers[:limit]

        created = updated = skipped = errors = 0

        for i, offer in enumerate(offers):
            try:
                offer_id = offer.get('id')
                if not offer_id:
                    skipped += 1
                    continue

                name = self.get_text(offer, 'name')
                if not name:
                    name = f'Товар {offer_id}'

                category_id = self.get_text(offer, 'categoryId')
                price_text = self.get_text(offer, 'price')
                try:
                    price = float(price_text) if price_text else 0
                except ValueError:
                    price = 0

                # Парсинг параметров
                params = {}
                brand_value = ''
                for param in offer.findall('param'):
                    param_name = param.get('name', '').strip()
                    param_value = self.clean_text(param.text)
                    if param_name:
                        params[param_name] = param_value
                        if param_name.lower() in ('бренд', 'brand'):
                            brand_value = param_value

                #vendor = self.get_text(offer, 'vendor')
                #model_name = self.get_text(offer, 'model')
                country = self.get_text(offer, 'country_of_origin')
                barcode = self.get_text(offer, 'barcode')
                weight_text = self.get_text(offer, 'weight')
                dimensions = self.get_text(offer, 'dimensions')

                try:
                    weight = float(weight_text) if weight_text else None
                except ValueError:
                    weight = None

                # Изображения
                images = [
                    self.clean_text(img.text)
                    for img in offer.findall('picture')
                    if img.text
                ]

                # Описание
                description_raw = self.get_text(offer, 'description')

                # URL
                url = self.get_text(offer, 'url')

                # Наличие
                in_stock = offer.get('available', 'true') == 'true'
                pickup = self.get_text(offer, 'pickup') == 'true'
                delivery = self.get_text(offer, 'delivery') == 'true'

                # Валюта
                currency = self.get_text(offer, 'currencyId') or 'RUR'

                if dry_run:
                    created += 1
                    continue

                # Генерация slug
                slug_base = slugify(name[:100], allow_unicode=True)
                if not slug_base:
                    slug_base = str(uuid.uuid4())[:8]

                # Создаём или обновляем товар
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

                # Генерируем slug если пустой
                if not product.slug:
                    slug = slug_base
                    counter = 1
                    while Product.objects.filter(slug=slug).exclude(pk=product.pk).exists():
                        slug = f'{slug_base}-{counter}'
                        counter += 1
                    product.slug = slug
                    product.save(update_fields=['slug'])

                # Привязка к категории
                cat_obj = category_map.get(category_id)
                if cat_obj:
                    product.categories.set([cat_obj])

                if is_new:
                    created += 1
                else:
                    updated += 1

                if (i + 1) % 1000 == 0:
                    self.stdout.write(f'  Обработано: {i + 1}/{total_offers}')

            except Exception as e:
                errors += 1
                self.stderr.write(f'✗ Ошибка на offer {offer.get("id")}: {e}')

        summary = f'✅ Готово: создано={created}, обновлено={updated}, ошибок={errors}'
        if skipped:
            summary += f', пропущено={skipped}'
        self.stdout.write(self.style.SUCCESS(summary))
