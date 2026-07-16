from rest_framework import viewsets
from .models import Category, Page
from .serializers import CategorySerializer, PageListSerializer, PageDetailSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class PageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Page.objects.filter(is_active=True) # Отдаем только опубликованные
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PageDetailSerializer
        return PageListSerializer