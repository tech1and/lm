from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Product, Category
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['level', 'parent']

    @action(detail=True, methods=['get'])
    def products(self, request, slug=None):
        """Товары категории + дочерние категории"""
        category = get_object_or_404(Category, slug=slug)
        
        # Дочерние категории
        children = Category.objects.filter(parent=category)
        children_data = CategorySerializer(children, many=True).data
        
        # Собираем все категории для фильтрации (родитель + дочерние)
        cat_ids = [category.id] + list(children.values_list('id', flat=True))
        
        # Товары
        qs = Product.objects.filter(
            is_active=True,
            categories__in=cat_ids
        ).distinct()
        
        sort_by = request.query_params.get('sort_by', '')
        if sort_by == 'reviews':
            qs = qs.order_by('-reviews_count')
        else:
            ordering = request.query_params.get('ordering', '-avg_rating')
            qs = qs.order_by(ordering)
        
        # Пагинация
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            result = self.get_paginated_response(serializer.data)
        else:
            serializer = ProductListSerializer(qs, many=True)
            result = Response(serializer.data)
        
        # Добавляем мета-информацию
        result.data['category'] = CategorySerializer(category).data
        result.data['children'] = children_data
        return result


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['brand', 'in_stock', 'categories__slug']
    search_fields = ['name', 'brand', 'description', 'barcode']
    ordering_fields = ['price', 'created_at', 'views_count', 'avg_rating', 'likes_count', 'reviews_count']
    ordering = ['-avg_rating']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    @action(detail=True, methods=['get'])
    def similar(self, request, slug=None):
        """Похожие товары из той же категории"""
        product = get_object_or_404(Product, slug=slug)
        
        # Получаем категории товара
        categories = product.categories.all()
        if not categories.exists():
            return Response([])
        
        # Собираем похожие товары из тех же категорий (исключая текущий товар)
        similar_qs = Product.objects.filter(
            is_active=True,
            categories__in=categories
        ).exclude(pk=product.pk).distinct()
        
        # Ограничиваем количество
        limit = int(request.query_params.get('limit', 6))
        similar_qs = similar_qs[:limit]
        
        serializer = ProductListSerializer(similar_qs, many=True)
        return Response(serializer.data)
