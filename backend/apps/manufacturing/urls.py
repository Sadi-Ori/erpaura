from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BillOfMaterialsViewSet, BOMItemViewSet, ProductionOrderViewSet

app_name = 'manufacturing'

router = DefaultRouter()
router.register(r'boms', BillOfMaterialsViewSet, basename='bom')
router.register(r'bom-items', BOMItemViewSet, basename='bom-item')
router.register(r'production-orders', ProductionOrderViewSet, basename='production-order')

urlpatterns = [
    path('', include(router.urls)),
]
