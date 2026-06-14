from django.core.management.base import BaseCommand
from django.contrib.postgres.search import SearchVector
from apps.catalog.models import Product


class Command(BaseCommand):
    help = 'Обновляет search_vector для полнотекстового поиска товаров'

    def handle(self, *args, **options):
        self.stdout.write('Обновление search_vector...')
        Product.objects.update(
            search_vector=SearchVector('name', weight='A', config='russian') +
                          SearchVector('brand', weight='B', config='russian') +
                          SearchVector('description', weight='C', config='russian') +
                          SearchVector('barcode', weight='D', config='russian')
        )
        self.stdout.write(self.style.SUCCESS('search_vector обновлён для всех товаров'))