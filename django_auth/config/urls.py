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

def check_db(request):
    users = list(User.objects.values_list('username', flat=True))
    db_name = request.META.get('HTTP_HOST')
    return JsonResponse({'users_in_db': users, 'host': db_name})

urlpatterns += [
    path('check-db/', check_db),
]
