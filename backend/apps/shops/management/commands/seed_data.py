from django.core.management.base import BaseCommand
from apps.shops.models import Shop
from apps.blog.models import Post, Category
import random


SHOPS_DATA = [
    {
        "name": "Лемана Про Москва",
        "short_description": "Главный магазин Лемана Про в Москве с полным ассортиментом товаров",
        "description": """Лемана Про Москва — флагманский магазин сети с широким ассортиментом товаров для дома, ремонта и строительства.
        Более 50 000 наименований товаров от ведущих производителей.
        Профессиональные консультанты помогут с выбором материалов и инструментов.
        Удобное расположение и просторный торговый зал.""",
        "address": "ул. Профсоюзная, 126, Москва",
        "district": "Коньково",
        "phone": "+7 (495) 123-45-67",
        "email": "moscow@lemanapro.ru",
        "website": "https://lemanapro.ru",
        "working_hours": "Пн-Вс 9:00-22:00",
        "min_price": 50.00,
        "rating": 4.8,
        "likes_count": random.randint(300, 800),
        "views_count": random.randint(10000, 30000),
        "latitude": 55.6540,
        "longitude": 37.5180,
        "has_delivery": True,
        "has_pickup": True,
        "has_credit": True,
        "has_returns": True,
        "has_tool_checking": True,
        "has_service_center": True,
        "meta_keywords": "Лемана Про Москва, строительные материалы Москва, товары для дома",
    },
    {
        "name": "Лемана Про Санкт-Петербург",
        "short_description": "Крупнейший магазин Лемана Про в Санкт-Петербурге",
        "description": """Лемана Про Санкт-Петербург — один из крупнейших гипермаркетов товаров для дома и ремонта в северной столице.
        Огромный выбор строительных материалов, сантехники, электроинструментов и мебели.
        Бесплатная консультация специалистов по ремонту.""",
        "address": "пр. Энгельса, 154, Санкт-Петербург",
        "district": "Выборгский",
        "phone": "+7 (812) 987-65-43",
        "email": "spb@lemanapro.ru",
        "website": "https://lemanapro.ru",
        "working_hours": "Пн-Вс 9:00-22:00",
        "min_price": 55.00,
        "rating": 4.7,
        "likes_count": random.randint(250, 700),
        "views_count": random.randint(8000, 25000),
        "latitude": 60.0380,
        "longitude": 30.3160,
        "has_delivery": True,
        "has_pickup": True,
        "has_credit": True,
        "has_returns": True,
        "has_tool_checking": True,
        "has_service_center": True,
        "meta_keywords": "Лемана Про СПб, строительные материалы Санкт-Петербург",
    },
    {
        "name": "Лемана Про Казань",
        "short_description": "Магазин Лемана Про в Казани с доставкой по Татарстану",
        "description": """Лемана Про Казань — магазин строительных и отделочных материалов в столице Татарстана.
        Широкий ассортимент товаров для ремонта и строительства.
        Доставка по Казани и Татарстану в течение 1-2 дней.""",
        "address": "ул. Декабристов, 185, Казань",
        "district": "Московский район",
        "phone": "+7 (843) 555-12-34",
        "email": "kazan@lemanapro.ru",
        "website": "https://lemanapro.ru",
        "working_hours": "Пн-Вс 9:00-21:00",
        "min_price": 45.00,
        "rating": 4.5,
        "likes_count": random.randint(150, 500),
        "views_count": random.randint(5000, 18000),
        "latitude": 55.8180,
        "longitude": 49.1090,
        "has_delivery": True,
        "has_pickup": True,
        "has_credit": True,
        "has_returns": True,
        "has_tool_checking": False,
        "has_service_center": True,
        "meta_keywords": "Лемана Про Казань, стройматериалы Казань",
    },
    {
        "name": "Лемана Про Екатеринбург",
        "short_description": "Гипермаркет Лемана Про в Екатеринбурге",
        "description": """Лемана Про Екатеринбург — крупный гипермаркет товаров для дома и сада.
        Более 40 000 наименований товаров в наличии.
        Профессиональная команда консультантов и мастеров.""",
        "address": "ул. Халтурина, 55, Екатеринбург",
        "district": "Ленинский район",
        "phone": "+7 (343) 444-55-66",
        "email": "ekb@lemanapro.ru",
        "website": "https://lemanapro.ru",
        "working_hours": "Пн-Вс 9:00-21:00",
        "min_price": 40.00,
        "rating": 4.4,
        "likes_count": random.randint(120, 400),
        "views_count": random.randint(4000, 15000),
        "latitude": 56.8390,
        "longitude": 60.5970,
        "has_delivery": True,
        "has_pickup": True,
        "has_credit": True,
        "has_returns": True,
        "has_tool_checking": True,
        "has_service_center": True,
        "meta_keywords": "Лемана Про Екатеринбург, строительный гипермаркет",
    },
    {
        "name": "Лемана Про Новосибирск",
        "short_description": "Магазин Лемана Про в Новосибирске с широким выбором товаров",
        "description": """Лемана Про Новосибирск — крупный магазин строительных и хозяйственных товаров в Сибири.
        Большой выбор отделочных материалов, сантехники и электроинструментов.
        Удобная парковка и зона разгрузки.""",
        "address": "ул. Сибиряков-Гвардейцев, 50, Новосибирск",
        "district": "Кировский район",
        "phone": "+7 (383) 333-22-11",
        "email": "nsk@lemanapro.ru",
        "website": "https://lemanapro.ru",
        "working_hours": "Пн-Вс 9:00-21:00",
        "min_price": 42.00,
        "rating": 4.3,
        "likes_count": random.randint(100, 350),
        "views_count": random.randint(3500, 12000),
        "latitude": 55.0080,
        "longitude": 82.9350,
        "has_delivery": True,
        "has_pickup": True,
        "has_credit": True,
        "has_returns": True,
        "has_tool_checking": True,
        "has_service_center": False,
        "meta_keywords": "Лемана Про Новосибирск, стройматериалы Сибирь",
    },
    {
        "name": "Лемана Про Нижний Новгород",
        "short_description": "Магазин Лемана Про в Нижнем Новгороде",
        "description": """Лемана Про Нижний Новгород — магазин товаров для дома и ремонта.
        Широкий ассортимент строительных материалов, инструментов и мебели.
        Квалифицированная помощь специалистов при выборе.""",
        "address": "ул. Бекетова, 13, Нижний Новгород",
        "district": "Приокский район",
        "phone": "+7 (831) 222-33-44",
        "email": "nn@lemanapro.ru",
        "website": "https://lemanapro.ru",
        "working_hours": "Пн-Вс 9:00-21:00",
        "min_price": 38.00,
        "rating": 4.2,
        "likes_count": random.randint(80, 280),
        "views_count": random.randint(2500, 10000),
        "latitude": 56.2640,
        "longitude": 43.9240,
        "has_delivery": True,
        "has_pickup": True,
        "has_credit": True,
        "has_returns": True,
        "has_tool_checking": False,
        "has_service_center": True,
        "meta_keywords": "Лемана Про Нижний Новгород, стройматериалы НН",
    },
    {
        "slug": "test",
        "name": "Тестовый магазин",
        "short_description": "Тестовый магазин для проверки работы сайта",
        "description": "Это тестовый магазин, созданный для проверки корректной работы страниц магазинов на сайте.",
        "address": "Тестовая ул., 1, Москва",
        "district": "Тестовый район",
        "phone": "+7 (495) 000-00-00",
        "email": "test@example.com",
        "website": "https://example.com",
        "working_hours": "Пн-Пт 9:00-18:00",
        "min_price": 50.00,
        "rating": 4.0,
        "likes_count": 10,
        "views_count": 100,
        "latitude": 55.7558,
        "longitude": 37.6173,
        "has_delivery": False,
        "has_pickup": False,
        "has_credit": False,
        "has_returns": False,
        "has_tool_checking": False,
        "has_service_center": False,
        "is_active": True,
        "meta_keywords": "тест, тестовый магазин",
        "meta_title": "Тестовый магазин — Рейтинг и отзывы",
        "meta_description": "Тестовый магазин для проверки работы сайта. Рейтинг, отзывы, контакты.",
    },
]

BLOG_CATEGORIES = [
    {"name": "Советы", "slug": "sovety"},
    {"name": "Новости", "slug": "novosti"},
    {"name": "Рейтинги", "slug": "rejtingi"},
    {"name": "Лайфхаки", "slug": "lajfhaki"},
]

BLOG_POSTS = [
    {
        "title": "Как выбрать лучшие стройматериалы в Лемана Про в 2026 году",
        "slug": "kak-vybrat-stroymaterialy",
        "category_slug": "sovety",
        "excerpt": "Рассматриваем ключевые критерии выбора качественных стройматериалов в магазинах Лемана Про.",
        "content": """<h2>Критерии выбора стройматериалов</h2>
        <p>При выборе стройматериалов в Лемана Про важно учитывать несколько ключевых факторов:</p>
        <h3>1. Качество и сертификация</h3>
        <p>Обращайте внимание на наличие сертификатов соответствия и маркировку производителя.</p>
        <h3>2. Цена и соотношение цена/качество</h3>
        <p>Сравнивайте цены на аналогичные товары и обращайте внимание на акции.</p>
        <h3>3. Консультация специалистов</h3>
        <p>Не стесняйтесь обращаться за помощью к консультантам магазина.</p>
        <h3>4. Условия доставки</h3>
        <p>Уточняйте стоимость и сроки доставки, особенно для крупногабаритных товаров.</p>
        <h3>5. Гарантийные условия</h3>
        <p>Проверяйте условия возврата и обмена товара.</p>""",
        "meta_title": "Как выбрать стройматериалы в Лемана Про 2026 — советы экспертов",
        "meta_description": "Полное руководство по выбору стройматериалов в Лемана Про. Качество, цены, доставка.",
    },
    {
        "title": "Рейтинг магазинов Лемана Про 2026 — лучшие по отзывам покупателей",
        "slug": "rejting-lemana-pro-2026",
        "category_slug": "rejtingi",
        "excerpt": "Актуальный рейтинг лучших магазинов Лемана Про в 2026 году по отзывам покупателей.",
        "content": """<h2>Топ магазинов Лемана Про 2026</h2>
        <p>Мы проанализировали отзывы покупателей и составили объективный рейтинг.</p>
        <h3>Методология рейтинга</h3>
        <p>Оценка производилась по следующим параметрам:</p>
        <ul>
            <li>Качество обслуживания</li>
            <li>Ассортимент товаров</li>
            <li>Ценовая политика</li>
            <li>Удобство расположения</li>
            <li>Работа персонала</li>
        </ul>
        <h3>Выводы</h3>
        <p>Лидерами по соотношению цена/качество оказались магазины в крупных городах
        с развитой инфраструктурой и широким ассортиментом.</p>""",
        "meta_title": "Рейтинг магазинов Лемана Про 2026 | Лучшие магазины",
        "meta_description": "Топ-20 лучших магазинов Лемана Про 2026. Рейтинг по отзывам, ценам и качеству.",
    },
    {
        "title": "10 лайфхаков при ремонте с товарами из Лемана Про",
        "slug": "lajfhaki-remont-lemana-pro",
        "category_slug": "lajfhaki",
        "excerpt": "Полезные советы, которые помогут сэкономить время и деньги при ремонте с товарами из Лемана Про.",
        "content": """<h2>Лайфхаки для экономии при ремонте</h2>
        <ol>
            <li><strong>Составьте список</strong> — заранее определите все необходимые материалы</li>
            <li><strong>Замерьте площадь</strong> — точно рассчитайте количество материалов</li>
            <li><strong>Сравнивайте цены</strong> — изучите ассортимент и цены онлайн перед визитом</li>
            <li><strong>Используйте программы лояльности</strong> — оформите карту постоянного покупателя</li>
            <li><strong>Следите за акциями</strong> — скидки до 50% на сезонные товары</li>
            <li><strong>Заказывайте доставку</strong> — для крупногабаритных товаров это выгоднее</li>
            <li><strong>Консультируйтесь со специалистами</strong> — в магазине всегда есть эксперты</li>
            <li><strong>Проверяйте товар при получении</strong> — осматривайте упаковку и целостность</li>
            <li><strong>Сохраняйте чеки</strong> — для гарантийного обмена и возврата</li>
            <li><strong>Планируйте заранее</strong> — заказывайте материалы за 2-3 недели до начала работ</li>
        </ol>""",
        "meta_title": "10 лайфхаков при ремонте — Лемана Про",
        "meta_description": "Полезные советы для экономии при ремонте с товарами из Лемана Про.",
    },
]


class Command(BaseCommand):
    help = 'Заполняет базу данных тестовыми данными магазинов и блога'

    def handle(self, *args, **kwargs):
        # Создание категорий блога
        self.stdout.write('Создание категорий блога...')
        categories = {}
        for cat_data in BLOG_CATEGORIES:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={'name': cat_data['name']}
            )
            categories[cat_data['slug']] = category
            if created:
                self.stdout.write(f'  Создана категория: {category.name}')
            else:
                self.stdout.write(f'  Категория уже существует: {category.name}')

        # Создание магазинов
        self.stdout.write('\nСоздание магазинов...')
        for shop_data in SHOPS_DATA:
            shop, created = Shop.objects.get_or_create(
                slug=shop_data['slug'] if 'slug' in shop_data else None,
                defaults=shop_data
            )
            if created:
                self.stdout.write(f'  Создан магазин: {shop.name}')
            else:
                self.stdout.write(f'  Магазин уже существует: {shop.name}')

        # Создание статей блога
        self.stdout.write('\nСоздание статей блога...')
        for post_data in BLOG_POSTS:
            category = categories.get(post_data['category_slug'])
            post, created = Post.objects.get_or_create(
                slug=post_data['slug'],
                defaults={
                    'title': post_data['title'],
                    'category': category,
                    'excerpt': post_data['excerpt'],
                    'content': post_data['content'],
                    'meta_title': post_data.get('meta_title', ''),
                    'meta_description': post_data.get('meta_description', ''),
                }
            )
            if created:
                self.stdout.write(f'  Создана статья: {post.title}')
            else:
                self.stdout.write(f'  Статья уже существует: {post.title}')

        self.stdout.write('\nГотово! База данных заполнена.')
