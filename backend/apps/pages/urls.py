from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, PageViewSet

app_name = 'pages'

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'items', PageViewSet, basename='page')

urlpatterns = [
    path('', include(router.urls)),
]