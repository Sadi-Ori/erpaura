from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WarehouseViewSet,
    BinLocationViewSet,
    StockItemViewSet,
    StockMovementViewSet,
    InventoryStatsAPIView,
    # Legacy
    WarehouseListAPIView,
    StockItemListAPIView,
    StockItemDetailAPIView,
    StockMovementListCreateAPIView,
)

app_name = 'inventory'

router = DefaultRouter()
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')
router.register(r'bins', BinLocationViewSet, basename='bin')
router.register(r'stock', StockItemViewSet, basename='stock')
router.register(r'movements', StockMovementViewSet, basename='movement')

urlpatterns = [
    path('stats/', InventoryStatsAPIView.as_view(), name='inventory-stats'),
    # Legacy aliases
    path('legacy/warehouses/', WarehouseListAPIView.as_view(), name='legacy-warehouse-list'),
    path('legacy/stock/', StockItemListAPIView.as_view(), name='legacy-stock-list'),
    path('legacy/stock/<int:pk>/', StockItemDetailAPIView.as_view(), name='legacy-stock-detail'),
    path('legacy/movements/', StockMovementListCreateAPIView.as_view(), name='legacy-movement-list'),
    # Router
    path('', include(router.urls)),
]
