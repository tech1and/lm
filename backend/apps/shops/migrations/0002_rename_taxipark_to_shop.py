from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('shops', '0001_initial'),  # Обновится на сервере
    ]

    operations = [
        # Переименовываем модель
        migrations.RenameModel(
            old_name='TaxiPark',
            new_name='Shop',
        ),
        # Переименовываем поля в Like и Comment
        migrations.RenameField(
            model_name='like',
            old_name='taxipark',
            new_name='shop',
        ),
        migrations.RenameField(
            model_name='comment',
            old_name='taxipark',
            new_name='shop',
        ),
    ]
