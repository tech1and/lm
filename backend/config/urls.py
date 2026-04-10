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
    """Редирект на внешний сайт магазина через /go/?shop=<slug>"""
    from apps.shops.models import Shop

    slug = request.GET.get('shop')
    if not slug:
        return JsonResponse({'error': 'Параметр shop обязателен'}, status=400)

    shop = get_object_or_404(Shop, slug=slug, is_active=True)
    if not shop.website:
        return JsonResponse({'error': 'Сайт магазина не указан'}, status=404)

    target_url = shop.website
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
    path('go/', external_redirect, name='external-redirect'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)