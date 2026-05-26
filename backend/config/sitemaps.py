from django.contrib.sitemaps import Sitemap
from apps.blog.models import Post
from apps.catalog.models import Product, Category as ProductCategory
from apps.shops.models import Shop


class PostSitemap(Sitemap):
    changefreq = "daily"
    priority = 0.9
    protocol = 'https'

    def items(self):
        return Post.objects.filter(is_published=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f'/blog/{obj.slug}/'


class ProductSitemap(Sitemap):
    changefreq = "daily"
    priority = 0.8

    def items(self):
        return Product.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f'/product/{obj.slug}/'


class ProductCategorySitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        return ProductCategory.objects.all()

    def lastmod(self, obj):
        return obj.updated_at if hasattr(obj, 'updated_at') else None

    def location(self, obj):
        return f'/catalog/categories/{obj.slug}/'


class ShopSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.6

    def items(self):
        return Shop.objects.filter(is_active=True)

    def lastmod(self, obj):
        return obj.updated_at

    def location(self, obj):
        return f'/shop/{obj.slug}/'


# Словарь с sitemap-классами для использования в индексной карте
sitemaps = {
    'products': ProductSitemap,
    'categories': ProductCategorySitemap,
    'shops': ShopSitemap,
    'blog': PostSitemap,
}