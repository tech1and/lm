from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
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


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['brand', 'in_stock', 'categories__slug']
    search_fields = ['name', 'brand', 'description', 'barcode']
    ordering_fields = ['price', 'created_at', 'views_count', 'avg_rating']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer
