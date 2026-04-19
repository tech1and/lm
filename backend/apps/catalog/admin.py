from django.contrib import admin
from .models import Category, Product
from import_export.admin import ImportExportModelAdmin


@admin.register(Category)
class CategoryAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    list_display = ('name', 'slug', 'level', 'products_count')
    list_filter = ('level',)
    search_fields = ('name', 'path')
    save_on_top = True
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('products_count',)
    fieldsets = (
        ('Основное', {
            'fields': ('xml_id', 'name', 'slug', 'parent', 'level', 'path')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description'),
            'classes': ('collapse',),
        }),
        ('Статистика', {
            'fields': ('products_count',),
        }),
    )

    def view_on_site(self, obj):
        return f'/catalog/categories/{obj.slug}/'


@admin.register(Product)
class ProductAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    list_display = ('name', 'xml_id', 'price', 'brand', 'in_stock', 'created_at')
    list_filter = ('in_stock', 'brand', 'currency', 'pickup_available', 'delivery_available')
    search_fields = ('name', 'xml_id', 'barcode', 'brand', 'description')
    save_on_top = True
    readonly_fields = ('xml_id', 'created_at', 'updated_at', 'views_count', 'likes_count', 'reviews_count', 'avg_rating')
    filter_horizontal = ('categories',)
    date_hierarchy = 'created_at'
    list_per_page = 50
    fieldsets = (
        ('Основное', {
            'fields': ('xml_id', 'name', 'slug', 'description', 'description_raw', 'categories', 'is_active')
        }),
        ('Цена и наличие', {
            'fields': ('price', 'currency', 'in_stock', 'pickup_available', 'delivery_available'),
        }),
        ('Бренд и производитель', {
            'fields': ('brand', 'vendor', 'model', 'country_of_origin'),
            'classes': ('collapse',),
        }),
        ('Идентификаторы', {
            'fields': ('barcode', 'url'),
            'classes': ('collapse',),
        }),
        ('Медиа', {
            'fields': ('images',),
            'classes': ('collapse',),
        }),
        ('Габариты', {
            'fields': ('weight', 'dimensions'),
            'classes': ('collapse',),
        }),
        ('Параметры', {
            'fields': ('params',),
            'classes': ('collapse',),
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
            'classes': ('collapse',),
        }),
        ('Статистика', {
            'fields': ('likes_count', 'views_count', 'reviews_count', 'avg_rating', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def view_on_site(self, obj):
        return f'/catalog/products/{obj.slug}/'
