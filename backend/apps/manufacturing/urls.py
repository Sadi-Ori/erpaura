from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BillOfMaterialsViewSet,
    BOMItemViewSet,
    ProductionOrderViewSet,
    WorkCenterViewSet,
    ManufacturingStatsAPIView,
)

app_name = 'manufacturing'

router = DefaultRouter()
router.register(r'boms', BillOfMaterialsViewSet, basename='bom')
router.register(r'bom-items', BOMItemViewSet, basename='bom-item')
router.register(r'orders', ProductionOrderViewSet, basename='production-order')
router.register(r'workcenters', WorkCenterViewSet, basename='workcenter')

urlpatterns = [
    path('stats/', ManufacturingStatsAPIView.as_view(), name='manufacturing-stats'),
    path('', include(router.urls)),
]
