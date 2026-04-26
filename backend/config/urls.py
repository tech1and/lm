from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404
from urllib.parse import urlparse

def api_health_check(request):
    """Health-check endpoint для API."""
    return JsonResponse({
        'status': 'ok',
        'service': 'lemana-api',
    })


def external_redirect(request):
    """Редирект на внешний сайт магазина через /go/?shop=<slug> или товара через /go/?url=<url>"""
    from apps.shops.models import Shop
    from apps.catalog.models import Product

    shop_slug = request.GET.get('shop')
    product_url = request.GET.get('url')

    # Редирект для магазина
    if shop_slug:
        shop = get_object_or_404(Shop, slug=shop_slug, is_active=True)
        if not shop.website:
            return JsonResponse({'error': 'Сайт магазина не указан'}, status=404)
        target_url = shop.website

    # Редирект для товара
    elif product_url:
        target_url = product_url

    else:
        return JsonResponse({'error': 'Параметр shop или url обязателен'}, status=400)

    parsed = urlparse(target_url)
    if parsed.scheme not in ('http', 'https'):
        return JsonResponse({'error': 'Недопустимый протокол'}, status=400)

    return HttpResponseRedirect(target_url)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('tinymce/', include('tinymce.urls')),
    path('api/', api_health_check, name='api-health-check'),
    path('api/shops/', include('apps.shops.urls')),
    path('api/blog/', include('apps.blog.urls')),
    path('api/catalog/', include('apps.catalog.urls')),
    path('go/', external_redirect, name='external-redirect'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)