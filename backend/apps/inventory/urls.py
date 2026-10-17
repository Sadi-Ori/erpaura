from django.urls import path
from .views import (
    WarehouseListAPIView,
    StockItemListAPIView,
    StockItemDetailAPIView,
    StockMovementListCreateAPIView,
)

app_name = 'inventory'

urlpatterns = [
    path('warehouses/', WarehouseListAPIView.as_view(), name='warehouse-list'),
    path('stock/', StockItemListAPIView.as_view(), name='stock-list'),
    path('stock/<int:pk>/', StockItemDetailAPIView.as_view(), name='stock-detail'),
    path('movements/', StockMovementListCreateAPIView.as_view(), name='movement-list'),
]
