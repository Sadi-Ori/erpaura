from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EquipmentViewSet, MaintenanceRequestViewSet

app_name = 'maintenance'

router = DefaultRouter()
router.register(r'equipment', EquipmentViewSet, basename='equipment')
router.register(r'requests', MaintenanceRequestViewSet, basename='maintenance-request')

urlpatterns = [
    path('', include(router.urls)),
]
