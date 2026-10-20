from django.contrib import admin
from django.urls import include, path
import os
from django.contrib.auth.models import User
from django.http import JsonResponse

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')), 
    path('', include('accounts.urls')), 
    path('tickets/', include('tickets.urls')), 
]

def create_admin(request):
    username = os.environ.get('DJANGO_ADMIN_USER')
    password = os.environ.get('DJANGO_ADMIN_PASS')
    email = os.environ.get('DJANGO_ADMIN_EMAIL', 'admin@example.com')
    
    if not username or not password:
        return JsonResponse({'error': 'No admin credentials provided in env'})
        
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username, email, password)
        return JsonResponse({'status': 'admin created'})
    return JsonResponse({'status': 'admin already exists'})

urlpatterns += [
    path('create-admin/', create_admin),
]