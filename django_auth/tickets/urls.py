from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    dashboard,
    CategoryViewSet,
    TicketViewSet,
    create_admin_safe,
)

router = DefaultRouter()
router.register(
    "categories",
    CategoryViewSet,
    basename="categories"
)

router.register(
    "tickets",
    TicketViewSet,
    basename="tickets"
)

urlpatterns = [
    path("", dashboard, name="dashboard"),
    path("api/", include(router.urls)),
    path("create-admin/", create_admin_safe),
]