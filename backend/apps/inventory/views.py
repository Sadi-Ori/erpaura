from rest_framework import generics
from .models import Warehouse, StockItem, StockMovement
from .serializers import WarehouseSerializer, StockItemSerializer, StockMovementSerializer


class WarehouseListAPIView(generics.ListAPIView):
    queryset = Warehouse.objects.filter(is_active=True)
    serializer_class = WarehouseSerializer


class StockItemListAPIView(generics.ListCreateAPIView):
    serializer_class = StockItemSerializer

    def get_queryset(self):
        queryset = StockItem.objects.all().select_related('product', 'warehouse')
        warehouse_id = self.request.query_params.get('warehouse')
        if warehouse_id:
            queryset = queryset.filter(warehouse_id=warehouse_id)
        return queryset


class StockItemDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StockItem.objects.all()
    serializer_class = StockItemSerializer


class StockMovementListCreateAPIView(generics.ListCreateAPIView):
    queryset = StockMovement.objects.all().select_related('product', 'from_warehouse', 'to_warehouse')[:50]
    serializer_class = StockMovementSerializer
