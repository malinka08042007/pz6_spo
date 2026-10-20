from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Для входа/выхода (используется в обоих проектах)
    path('accounts/', include('django.contrib.auth.urls')), 
    
    # Старые страницы (Курсы, Факультеты, Профиль, Дашборды)
    path('', include('accounts.urls')), 
    
    # Новые страницы (Заявки из ПЗ №7) - будут доступны по адресу /tickets/
    path('tickets/', include('tickets.urls')), 
]