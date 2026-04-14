from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.postgres.search import SearchVectorField
from django.contrib.postgres.indexes import GinIndex
from django.utils.text import slugify
import uuid


class Category(models.Model):
    """Дерево категорий"""
    xml_id = models.CharField('XML ID', max_length=50, unique=True, db_index=True)
    name = models.CharField('Название', max_length=200)
    slug = models.SlugField('URL', max_length=200, unique=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children', verbose_name='Родительская категория')
    level = models.PositiveSmallIntegerField('Уровень', default=0)
    path = ArrayField(models.CharField(max_length=200), default=list, verbose_name='Путь')

    # SEO
    meta_title = models.CharField('Meta Title', max_length=300, blank=True)
    meta_description = models.TextField('Meta Description', blank=True)

    # Метрики
    products_count = models.PositiveIntegerField('Кол-во товаров', default=0)

    class Meta:
        ordering = ['path']
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        indexes = [
            models.Index(fields=['parent', 'level']),
            models.Index(fields=['slug']),
        ]

    def __str__(self):
        return ' → '.join(self.path) if self.path else self.name


class Product(models.Model):
    """Товары"""
    # Идентификаторы
    xml_id = models.CharField('XML ID', max_length=100, unique=True, db_index=True)
    barcode = models.CharField('Штрихкод', max_length=100, blank=True, db_index=True)
    url = models.URLField('URL товара', max_length=500)

    # Основные данные
    name = models.CharField('Название', max_length=300)
    slug = models.SlugField('URL', max_length=300, unique=True, blank=True)
    description = models.TextField('Описание', blank=True, default='')
    description_raw = models.TextField('Исходное описание', blank=True, default='')

    # Категории
    categories = models.ManyToManyField(Category, related_name='products', verbose_name='Категории')

    # Цена и наличие
    price = models.DecimalField('Цена', max_digits=10, decimal_places=2)
    currency = models.CharField('Валюта', max_length=3, default='RUR')
    in_stock = models.BooleanField('В наличии', default=True)
    pickup_available = models.BooleanField('Самовывоз', default=True)
    delivery_available = models.BooleanField('Доставка', default=True)

    # Медиа
    images = ArrayField(models.URLField(max_length=500), default=list, verbose_name='Изображения')

    # Параметры из <param> (JSONB для гибкости)
    params = models.JSONField('Параметры', default=dict, blank=True)

    # Бренд и производитель
    brand = models.CharField('Бренд', max_length=200, blank=True)
    vendor = models.CharField('Производитель', max_length=200, blank=True)
    model = models.CharField('Модель', max_length=200, blank=True)
    country_of_origin = models.CharField('Страна происхождения', max_length=100, blank=True)

    # Габариты
    weight = models.DecimalField('Вес (кг)', max_digits=8, decimal_places=3, null=True, blank=True)
    dimensions = models.CharField('Габариты', max_length=50, blank=True)

    # Метрики вовлеченности
    likes_count = models.PositiveIntegerField('Лайки', default=0)
    views_count = models.PositiveIntegerField('Просмотры', default=0)
    reviews_count = models.PositiveIntegerField('Отзывы', default=0)
    avg_rating = models.DecimalField('Рейтинг', max_digits=3, decimal_places=2, null=True, blank=True)

    # SEO
    search_vector = SearchVectorField('Поиск', null=True)

    # Системные
    is_active = models.BooleanField('Активен', default=True)
    created_at = models.DateTimeField('Создан', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлен', auto_now=True)

    class Meta:
        ordering = ['-price']
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        indexes = [
            GinIndex(fields=['params']),
            GinIndex(fields=['search_vector']),
            models.Index(fields=['slug']),
            models.Index(fields=['price']),
            models.Index(fields=['brand']),
            models.Index(fields=['-likes_count']),
            models.Index(fields=['-views_count']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name, allow_unicode=True)
            if not base_slug:
                base_slug = str(uuid.uuid4())[:8]
            # Уникальность slug
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{counter}'
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

