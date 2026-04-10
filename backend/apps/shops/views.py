from urllib.parse import urlparse, urlencode
import re

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from django.db.models import F, Count, Q
from django.core.cache import cache
from django.shortcuts import redirect
from django.http import HttpResponseRedirect
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import Shop, Like, Comment
from .serializers import (
    ShopListSerializer,
    ShopDetailSerializer,
    CommentSerializer,
)
import logging

logger = logging.getLogger(__name__)


class CommentThrottle(AnonRateThrottle):
    rate = '5/hour'
    scope = 'comment'


def get_client_ip(request):
    """Получение реального IP-адреса клиента"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class ShopViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для магазинов"""
    queryset = Shop.objects.filter(is_active=True)
    lookup_field = 'slug'  # 🔥 Используем slug вместо pk в URL
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['district']
    ordering_fields = ['likes_count', 'views_count', 'rating', 'created_at']
    ordering = ['-rating', '-likes_count']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ShopDetailSerializer
        return ShopListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # Аннотируем количество одобренных комментариев
        qs = qs.annotate(
            approved_comments_count=Count(
                'comments',
                filter=Q(comments__is_approved=True)
            )
        )
        sort_by = self.request.query_params.get('sort_by', '')
        if sort_by == 'comments':
            qs = qs.order_by('-approved_comments_count')
        return qs

    def retrieve(self, request, *args, **kwargs):
        """Переопределяем retrieve для подсчёта просмотров"""
        instance = self.get_object()
        ip = get_client_ip(request)
        cache_key = f'view_{instance.pk}_{ip}'
        
        if not cache.get(cache_key):
            Shop.objects.filter(pk=instance.pk).update(
                views_count=F('views_count') + 1
            )
            cache.set(cache_key, True, 60 * 60)  # Кэш на 1 час
            instance.refresh_from_db()

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='like', permission_classes=[])
    def like(self, request, slug=None):
        """Обработка лайка/дизлайка магазина"""
        shop = self.get_object()
        ip = get_client_ip(request)

        like, created = Like.objects.get_or_create(
            shop=shop,
            ip_address=ip,
        )

        if not created:
            # Если лайк уже был — удаляем (дизлайк)
            like.delete()
            Shop.objects.filter(pk=shop.pk).update(
                likes_count=F('likes_count') - 1
            )
            shop.refresh_from_db()
            return Response({
                'liked': False,
                'likes_count': shop.likes_count,
            })

        # Новый лайк — увеличиваем счётчик
        Shop.objects.filter(pk=shop.pk).update(
            likes_count=F('likes_count') + 1
        )
        shop.refresh_from_db()
        return Response({
            'liked': True,
            'likes_count': shop.likes_count,
        })

    @action(
        detail=True,
        methods=['post'],
        url_path='comment',
        throttle_classes=[CommentThrottle],
        permission_classes=[]
    )
    def add_comment(self, request, slug=None):
        """Добавление комментария к магазину"""
        shop = self.get_object()
        serializer = CommentSerializer(data=request.data)
        
        if serializer.is_valid():
            # Анти-бот: проверка времени заполнения формы
            form_time = request.data.get('form_time', 0)
            try:
                if int(form_time) < 3:
                    return Response(
                        {'error': 'Заполнено слишком быстро. Пожалуйста, попробуйте снова.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except (ValueError, TypeError):
                pass

            serializer.save(
                shop=shop,
                ip_address=get_client_ip(request),
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='similar', permission_classes=[])
    def similar(self, request, slug=None):
        """Возвращает 8 похожих магазинов (по умолчанию — самые просматриваемые)"""
        shop = self.get_object()

        similar_qs = Shop.objects.filter(
            is_active=True
        ).exclude(
            pk=shop.pk
        ).annotate(
            approved_comments_count=Count('comments', filter=Q(comments__is_approved=True))
        )

        # Сортировка по запросу (по умолчанию — самые просматриваемые)
        sort_by = request.query_params.get('sort_by', '')
        ordering = request.query_params.get('ordering', '')

        if sort_by == 'comments':
            similar_qs = similar_qs.order_by('-approved_comments_count')
        elif ordering:
            similar_qs = similar_qs.order_by(ordering)
        else:
            # По умолчанию — самые просматриваемые
            similar_qs = similar_qs.order_by('-views_count')

        # Ограничиваем 8 результатами
        similar_qs = similar_qs[:8]

        serializer = ShopListSerializer(similar_qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='external-redirect', permission_classes=[])
    def external_redirect(self, request, slug=None):
        """Редирект на внешний сайт магазина (для SEO)"""
        shop = self.get_object()
        if not shop.website:
            return Response(
                {'error': 'Сайт магазина не указан'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Валидация URL — разрешаем только http/https
        target_url = shop.website
        parsed = urlparse(target_url)
        if parsed.scheme not in ('http', 'https'):
            return Response(
                {'error': 'Недопустимый протокол'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Опционально: можно добавить ?next= для редиректа на произвольный URL
        next_url = request.query_params.get('next')
        if next_url:
            next_parsed = urlparse(next_url)
            # next_url должен быть относительным (на наш сайт)
            if next_parsed.scheme or next_parsed.netloc:
                return Response(
                    {'error': 'Параметр next должен быть относительным URL'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Логирование перехода (опционально — можно добавить счётчик кликов)
        return HttpResponseRedirect(target_url)