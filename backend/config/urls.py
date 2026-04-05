from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_health_check(request):
    """Health-check endpoint для API."""
    return JsonResponse({
        'status': 'ok',
        'service': 'lemana-api',
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('tinymce/', include('tinymce.urls')),
    path('api/', api_health_check, name='api-health-check'),
    path('api/shops/', include('apps.shops.urls')),
    path('api/blog/', include('apps.blog.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)