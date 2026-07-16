from rest_framework import serializers
from .models import Category, Page

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'title', 'slug']

class PageListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ['title', 'slug', 'shortdescription', 'image', 'updated_at']

class PageDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Page
        fields = [
            'title', 'slug', 'category', 'metatitle', 'metadescription',
            'shortdescription', 'description', 'image', 'updated_at'
        ]