from django.contrib import admin
from django.db.models import Case, When, Value, BooleanField
from django.utils.html import format_html
from .models import Category, Product
from import_export.admin import ImportExportModelAdmin


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'level', 'get_products_count')
    list_filter = ('level',)
    search_fields = ('name', 'path')
    save_on_top = True
    prepopulated_fields = {'slug': ('name',)}

    def get_products_count(self, obj):
        return obj.products_count
    get_products_count.short_description = 'Товаров'
    get_products_count.admin_order_field = 'products_count'

    def view_on_site(self, obj):
        return f'/catalog/categories/{obj.slug}/'


@admin.register(Product)
class ProductAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    list_display = ('name', 'is_active', 'price', 'has_description', 'created_at')
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
            'fields': ('images', 'video_source'),
            'classes': ('collapse',),
        }),
        ('FAQ', {
            'fields': ('faq',),
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

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.annotate(
            has_description_annotated=Case(
                When(description__isnull=True, then=Value(False)),
                When(description__exact='', then=Value(False)),
                default=Value(True),
                output_field=BooleanField()
            )
        )

    def has_description(self, obj):
        if obj.has_description_annotated:
            return format_html('<span style="color: green; font-size: 20px;">✓</span>')
        return format_html('<span style="color: red; font-size: 20px;">✗</span>')
    has_description.short_description = 'Описание'
    has_description.admin_order_field = 'has_description_annotated'

    def in_stock_display(self, obj):
        if obj.in_stock:
            return format_html('<span style="color: green; font-size: 20px;">✓</span>')
        return format_html('<span style="color: red; font-size: 20px;">✗</span>')
    in_stock_display.short_description = 'В наличии'
    in_stock_display.admin_order_field = 'in_stock'

    def view_on_site(self, obj):
        return f'/p/{obj.slug}/'
