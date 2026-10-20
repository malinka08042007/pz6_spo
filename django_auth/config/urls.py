from django.contrib import admin
from django.urls import include, path
from django.contrib.auth.models import User
from django.http import JsonResponse

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')), 
    path('', include('accounts.urls')), 
    path('tickets/', include('tickets.urls')), 
]

def create_admin(request):
    if not User.objects.filter(username='Katirish').exists():
        User.objects.create_superuser('Katirish', 'katirish@example.com', 'malina')
        return JsonResponse({'status': 'admin created'})
    return JsonResponse({'status': 'admin already exists'})

urlpatterns += [
    path('create-admin/', create_admin),
]