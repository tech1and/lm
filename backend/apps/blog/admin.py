from django.contrib import admin
from django.db.models import Case, When, Value, BooleanField
from .models import Post, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'has_description']

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

    prepopulated_fields = {'slug': ('name',)}

    def view_on_site(self, obj):
        return f'/blog/category/{obj.slug}/'


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_published', 'views_count', 'created_at']
    list_filter = ['is_published', 'category']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['views_count', 'created_at', 'updated_at']
    save_on_top = True

    def view_on_site(self, obj):
        return f'/blog/{obj.slug}/'
