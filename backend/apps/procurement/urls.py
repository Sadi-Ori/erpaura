from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PurchaseOrderViewSet, PurchaseOrderItemViewSet, ProcurementStatsAPIView

app_name = 'procurement'

router = DefaultRouter()
router.register(r'orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'items', PurchaseOrderItemViewSet, basename='purchase-order-item')

urlpatterns = [
    path('stats/', ProcurementStatsAPIView.as_view(), name='procurement-stats'),
    path('', include(router.urls)),
]
