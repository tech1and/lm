from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='catalog-category')
router.register('', ProductViewSet, basename='catalog-product')

urlpatterns = [
    path('', include(router.urls)),
]
