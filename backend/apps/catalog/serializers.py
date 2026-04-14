from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'level', 'path', 'products_count']


class ProductListSerializer(serializers.ModelSerializer):
    category_names = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'xml_id', 'name', 'slug', 'price', 'currency',
            'brand', 'images', 'in_stock', 'category_names',
            'weight', 'dimensions', 'avg_rating', 'reviews_count',
        ]

    def get_category_names(self, obj):
        return list(obj.categories.values_list('name', flat=True))


class ProductDetailSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
