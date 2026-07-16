from django.db import models
from django.contrib.postgres.indexes import BrinIndex
from ckeditor.fields import RichTextField

class Category(models.Model):
    """Простая категория для группировки (например: 'Юридическая информация', 'О компании')"""
    title = models.CharField("Название категории", max_length=300, db_index=True)
    slug = models.SlugField("Слаг категории", max_length=300, unique=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Категория страниц"
        verbose_name_plural = "Категории страниц"
        ordering = ['title']


class Page(models.Model):
    """Статическая страница (Flatpage)"""
    title = models.CharField("Заголовок страницы", max_length=500, db_index=True)
    slug = models.SlugField("Слаг (URL)", max_length=300, unique=True, help_text="Например: privacy-policy")
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name='Категория', related_name='pages'
    )
    metatitle = models.CharField("SEO Тайтл", max_length=500, default='', blank=True)
    metadescription = models.TextField("SEO Описание", max_length=500, default='', blank=True)
    shortdescription = models.TextField("Краткое описание", default='', blank=True)
    description = RichTextField("Содержимое страницы", default='', blank=True)
    image = models.ImageField("Изображение", upload_to="pages/", blank=True, null=True)
    is_active = models.BooleanField("Опубликовано", default=True)
    created_at = models.DateTimeField("Дата создания", auto_now_add=True)
    updated_at = models.DateTimeField("Дата обновления", auto_now=True)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return f"/pages/{self.slug}/"

    class Meta:
        verbose_name = "Статическая страница"
        verbose_name_plural = "Статические страницы"
        ordering = ['title']
        indexes = (BrinIndex(fields=['title']),)