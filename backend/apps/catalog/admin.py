from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'level', 'products_count')
    list_filter = ('level',)
    search_fields = ('name', 'path')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'xml_id', 'price', 'brand', 'in_stock', 'created_at')
    list_filter = ('in_stock', 'brand', 'currency')
    search_fields = ('name', 'xml_id', 'barcode', 'brand')
    readonly_fields = ('xml_id', 'created_at', 'updated_at')
    filter_horizontal = ('categories',)
    date_hierarchy = 'created_at'
    list_per_page = 50
