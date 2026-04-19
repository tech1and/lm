# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shops', '0002_rename_taxipark_to_shop'),
    ]

    operations = [
        # Add missing fields first
        migrations.AddField(
            model_name='shop',
            name='city',
            field=models.CharField(default='Москва', max_length=100, verbose_name='Город'),
        ),
        migrations.AddField(
            model_name='shop',
            name='email',
            field=models.CharField(blank=True, max_length=254, verbose_name='Email'),
        ),
        migrations.AddField(
            model_name='shop',
            name='has_delivery',
            field=models.BooleanField(default=True, verbose_name='Доставка из магазина'),
        ),
        migrations.AddField(
            model_name='shop',
            name='has_pickup',
            field=models.BooleanField(default=True, verbose_name='Самовывоз'),
        ),
        migrations.AddField(
            model_name='shop',
            name='has_credit',
            field=models.BooleanField(default=True, verbose_name='Кредиты'),
        ),
        migrations.AddField(
            model_name='shop',
            name='has_returns',
            field=models.BooleanField(default=True, verbose_name='Возврат товаров'),
        ),
        migrations.AddField(
            model_name='shop',
            name='has_tool_checking',
            field=models.BooleanField(default=True, verbose_name='Проверка техники'),
        ),
        migrations.AddField(
            model_name='shop',
            name='has_service_center',
            field=models.BooleanField(default=True, verbose_name='Сервисный центр'),
        ),
    ]
