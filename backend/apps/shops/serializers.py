from rest_framework import serializers
from .models import Shop, Like, Comment
import re


def clean_html_whitespace(html: str) -> str:
    """
    Удаляет избыточные переносы, пробелы и лишние <br> теги из HTML-контента.
    """
    if not html:
        return html

    # 1. Нормализуем все переносы строк: \r\n, \r, \n → пробел
    html = re.sub(r'\r\n?|\n', ' ', html)

    # 2. Удаляем пробелы между тегами: >   <  →  ><
    html = re.sub(r'>\s+<', '><', html)

    # 3. Удаляем <br> в начале/конце блочных элементов
    html = re.sub(r'(<(div|p|header|section|article|main)[^>]*>)\s*(<br\s*/?>\s*)+', r'\1', html, flags=re.IGNORECASE)
    html = re.sub(r'(\s*<br\s*/?>\s*)+(</(div|p|header|section|article|main)>)', r'\2', html, flags=re.IGNORECASE)

    # 4. Заменяем множественные <br> подряд на максимум один
    html = re.sub(r'(<br\s*/?>\s*){2,}', '<br>', html)

    # 5. Финальная очистка: множественные пробелы → один
    html = re.sub(r'\s{2,}', ' ', html)

    return html.strip()


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'author_name', 'text', 'rating', 'created_at', 'honeypot']
        read_only_fields = ['id', 'created_at']

    def validate_honeypot(self, value):
        if value:
            raise serializers.ValidationError('Спам обнаружен.')
        return value

    def validate_text(self, value):
        url_pattern = re.compile(
            r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|'
            r'(?:%[0-9a-fA-F][0-9a-fA-F]))+'
        )
        urls = url_pattern.findall(value)
        if len(urls) > 2:
            raise serializers.ValidationError('Слишком много ссылок в комментарии.')
        if len(value) < 10:
            raise serializers.ValidationError('Комментарий слишком короткий.')
        if len(value) > 2000:
            raise serializers.ValidationError('Комментарий слишком длинный.')
        return value

    def validate_author_name(self, value):
        if len(value) < 2:
            raise serializers.ValidationError('Имя слишком короткое.')
        return value


class ShopListSerializer(serializers.ModelSerializer):
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = [
            'id', 'name', 'slug', 'short_description',
            'logo', 'rating', 'likes_count', 'views_count',
            'comments_count', 'district', 'address', 'min_price',
        ]

    def get_comments_count(self, obj):
        return getattr(obj, 'approved_comments_count', obj.comments.filter(is_approved=True).count())


class ShopDetailSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, source='approved_comments', read_only=True)
    comments_count = serializers.SerializerMethodField()
    schema_org = serializers.SerializerMethodField()
    user_liked = serializers.SerializerMethodField()
    external_link = serializers.SerializerMethodField()
    product_categories = serializers.SerializerMethodField()

    # 🔥 Ключевое: переопределяем description как метод-поле
    description = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'logo', 'meta_title', 'meta_description', 'meta_keywords',
            'address', 'city', 'district', 'latitude', 'longitude',
            'phone', 'email', 'external_link', 'working_hours',
            'views_count', 'likes_count', 'comments_count',
            'rating', 'min_price',
            'has_delivery', 'has_pickup', 'has_credit', 'has_returns',
            'has_tool_checking', 'has_service_center',
            'has_parking', 'has_toilet', 'has_available_environment',
            'has_cafe', 'has_wifi', 'has_cash_machine', 'has_cargo',
            'created_at', 'updated_at',
            'comments', 'schema_org', 'user_liked', 'product_categories',
        ]

    def get_product_categories(self, obj):
        """Возвращает список категорий товаров для магазина"""
        categories = obj.product_categories.all()
        return [
            {
                'id': cat.id,
                'name': cat.name,
                'slug': cat.slug,
            }
            for cat in categories
        ]

    def get_external_link(self, obj):
        """Возвращает короткую редирект-ссылку на внешний сайт (для SEO)"""
        if not obj.website:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(
                f'/go/?shop={obj.slug}'
            )
        return f'/go/?shop={obj.slug}'

    def get_description(self, obj):
        """Возвращает очищенное HTML-описание"""
        if not obj.description:
            return ""
        return clean_html_whitespace(obj.description)

    def get_comments_count(self, obj):
        return getattr(obj, 'approved_comments_count', obj.comments.filter(is_approved=True).count())

    def get_schema_org(self, obj):
        return obj.get_schema_org()

    def get_user_liked(self, obj):
        request = self.context.get('request')
        if request:
            ip = self._get_client_ip(request)
            return obj.likes.filter(ip_address=ip).exists()
        return False

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')