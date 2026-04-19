# Generated migration for adding SEO fields to Product model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='meta_title',
            field=models.CharField('Meta Title', max_length=300, blank=True),
        ),
        migrations.AddField(
            model_name='product',
            name='meta_description',
            field=models.TextField('Meta Description', blank=True),
        ),
        migrations.AddField(
            model_name='product',
            name='meta_keywords',
            field=models.TextField('Meta Keywords', blank=True),
        ),
    ]
