from django.urls import path
from .views import TaxiParkViewSet

shop_list = TaxiParkViewSet.as_view({
    'get': 'list',
})

shop_detail = TaxiParkViewSet.as_view({
    'get': 'retrieve',
})

shop_like = TaxiParkViewSet.as_view({
    'post': 'like',
})

shop_comment = TaxiParkViewSet.as_view({
    'post': 'add_comment',
})

urlpatterns = [
    path('', shop_list, name='shop-list'),
    path('<slug:slug>/', shop_detail, name='shop-detail'),
    path('<slug:slug>/like/', shop_like, name='shop-like'),
    path('<slug:slug>/comment/', shop_comment, name='shop-comment'),
]