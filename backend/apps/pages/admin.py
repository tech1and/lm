from django.contrib import admin
from .models import Category, Page

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'category', 'is_active', 'updated_at')
    list_filter = ('is_active', 'category')
    search_fields = ('title', 'shortdescription')
    prepopulated_fields = {'slug': ('title',)}
    save_on_top = True
    fieldsets = (
        (None, {'fields': ('title', 'slug', 'category', 'is_active')}),
        ('SEO', {'fields': ('metatitle', 'metadescription', 'shortdescription'), 'classes': ('collapse',)}),
        ('Контент', {'fields': ('description', 'image')}),
    )