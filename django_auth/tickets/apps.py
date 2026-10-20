from django.apps import AppConfig
from django.contrib.auth.models import User
import os

class TicketsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tickets'

    def ready(self):
        try:
            if not User.objects.filter(username='Katirish').exists():
                User.objects.create_superuser('Katirish', 'katirish@example.com', 'malina')
        except Exception as e:
            print(f"Ошибка при создании админа: {e}")
