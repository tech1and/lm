from django.contrib import admin
from django.db.models import Case, When, Value, BooleanField
from .models import Shop, Like, Comment
from import_export.admin import ImportExportModelAdmin



@admin.register(Shop)
class ShopAdmin(ImportExportModelAdmin, admin.ModelAdmin):
    list_display = ['name', 'district', 'rating', 'likes_count', 'views_count', 'is_active', 'has_description']
    list_filter = ['is_active', 'district', 'has_delivery', 'has_pickup']
    search_fields = ['name', 'description', 'address']
    save_on_top = True
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['views_count', 'likes_count', 'created_at', 'updated_at']
    filter_horizontal = ('product_categories',)
    fieldsets = (
        ('Основное', {
            'fields': ('name', 'slug', 'short_description', 'description', 'logo', 'is_active')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
            'classes': ('collapse',),
        }),
        ('Геолокация', {
            'fields': ('address', 'city', 'district', 'latitude', 'longitude'),
        }),
        ('Контакты', {
            'fields': ('phone', 'email', 'website', 'working_hours'),
        }),
        ('Цены', {
            'fields': ('min_price',),
        }),
        ('Особенности', {
            'fields': (
                'has_parking', 'has_toilet', 'has_available_environment',
                'has_cafe', 'has_wifi', 'has_cash_machine', 'has_cargo',
            ),
        }),
        ('Услуги', {
            'fields': (
                'has_delivery', 'has_pickup', 'has_credit', 'has_returns',
                'has_tool_checking', 'has_service_center',
            ),
        }),
        ('Категории товаров для показа', {
            'fields': ('product_categories',),
            'description': 'Выберите категории товаров, которые будут отображаться на странице магазина',
        }),
        ('Статистика', {
            'fields': ('rating', 'views_count', 'likes_count', 'created_at', 'updated_at'),
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
        return obj.has_description_annotated
    has_description.boolean = True
    has_description.short_description = 'Описание'
    has_description.admin_order_field = 'has_description_annotated'

    def view_on_site(self, obj):
        return f'/shops/{obj.slug}/'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author_name', 'shop', 'rating', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'rating']
    search_fields = ['author_name', 'text']
    list_editable = ['is_approved']
    readonly_fields = ['ip_address', 'honeypot', 'created_at']


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['shop', 'ip_address', 'created_at']
    readonly_fields = ['shop', 'ip_address', 'created_at']
