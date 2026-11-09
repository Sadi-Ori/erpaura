import uuid
from decimal import Decimal
from django.db.models import Sum, F, Q, Count
from django.utils import timezone
from rest_framework import generics, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Warehouse, BinLocation, StockItem, StockMovement
from .serializers import (
    WarehouseSerializer,
    BinLocationSerializer,
    StockItemSerializer,
    StockMovementSerializer,
)


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.filter(is_active=True).prefetch_related('bins', 'stocks')
    serializer_class = WarehouseSerializer

    @action(detail=True, methods=['get'])
    def stocks(self, request, pk=None):
        warehouse = self.get_object()
        stocks = warehouse.stocks.all().select_related('product', 'bin_location')
        serializer = StockItemSerializer(stocks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def bins(self, request, pk=None):
        warehouse = self.get_object()
        bins = warehouse.bins.all()
        serializer = BinLocationSerializer(bins, many=True)
        return Response(serializer.data)


class BinLocationViewSet(viewsets.ModelViewSet):
    queryset = BinLocation.objects.all().select_related('warehouse')
    serializer_class = BinLocationSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        warehouse_param = self.request.query_params.get('warehouse')
        if warehouse_param:
            qs = qs.filter(warehouse_id=warehouse_param)
        return qs


class StockItemViewSet(viewsets.ModelViewSet):
    queryset = StockItem.objects.all().select_related('product', 'warehouse', 'bin_location')
    serializer_class = StockItemSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        warehouse_param = self.request.query_params.get('warehouse')
        low_stock_param = self.request.query_params.get('low_stock')
        search_param = self.request.query_params.get('search')

        if warehouse_param:
            qs = qs.filter(warehouse_id=warehouse_param)
        if low_stock_param == 'true':
            qs = qs.filter(quantity_on_hand__lte=F('reorder_level'))
        if search_param:
            qs = qs.filter(
                Q(product__name__icontains=search_param) |
                Q(product__sku__icontains=search_param) |
                Q(warehouse__name__icontains=search_param)
            )
        return qs

    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        item = self.get_object()
        new_quantity = int(request.data.get('new_quantity', item.quantity_on_hand))
        reason = request.data.get('reason', 'Cycle count physical audit adjustment')
        performed_by = request.data.get('performed_by', 'Inventory Manager')

        diff = new_quantity - item.quantity_on_hand
        item.quantity_on_hand = new_quantity
        item.last_counted_at = timezone.now()
        item.save()

        # Log movement
        ref = f"ADJ-{uuid.uuid4().hex[:8].upper()}"
        StockMovement.objects.create(
            reference_number=ref,
            product=item.product,
            from_warehouse=item.warehouse if diff < 0 else None,
            to_warehouse=item.warehouse if diff > 0 else None,
            movement_type='adjustment',
            quantity=abs(diff),
            unit_cost=item.unit_cost,
            performed_by=performed_by,
            notes=f"Audit adjustment: {diff:+d} units. Reason: {reason}",
        )

        return Response({
            'message': f'Inventory quantity updated to {new_quantity} units',
            'stock_item': StockItemSerializer(item).data,
        })


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all().select_related('product', 'from_warehouse', 'to_warehouse')
    serializer_class = StockMovementSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        warehouse_param = self.request.query_params.get('warehouse')
        type_param = self.request.query_params.get('type')
        if warehouse_param:
            qs = qs.filter(Q(from_warehouse_id=warehouse_param) | Q(to_warehouse_id=warehouse_param))
        if type_param:
            qs = qs.filter(movement_type=type_param)
        return qs

    @action(detail=False, methods=['post'])
    def transfer(self, request):
        product_id = request.data.get('product')
        from_wh_id = request.data.get('from_warehouse')
        to_wh_id = request.data.get('to_warehouse')
        quantity = int(request.data.get('quantity', 1))
        notes = request.data.get('notes', 'Internal transfer')
        performed_by = request.data.get('performed_by', 'Operations Lead')

        if not product_id or not from_wh_id or not to_wh_id:
            return Response({'error': 'product, from_warehouse, and to_warehouse are required'}, status=status.HTTP_400_BAD_REQUEST)

        if str(from_wh_id) == str(to_wh_id):
            return Response({'error': 'Source and destination warehouses cannot be the same'}, status=status.HTTP_400_BAD_REQUEST)

        # Check source inventory
        source_stock = StockItem.objects.filter(product_id=product_id, warehouse_id=from_wh_id).first()
        if not source_stock or source_stock.available_quantity < quantity:
            avail = source_stock.available_quantity if source_stock else 0
            return Response({'error': f'Insufficient available stock. Available: {avail}'}, status=status.HTTP_400_BAD_REQUEST)

        # Deduct from source
        source_stock.quantity_on_hand -= quantity
        source_stock.save()

        # Add to target
        target_stock, _ = StockItem.objects.get_or_create(
            product_id=product_id,
            warehouse_id=to_wh_id,
            defaults={'quantity_on_hand': 0, 'unit_cost': source_stock.unit_cost}
        )
        target_stock.quantity_on_hand += quantity
        target_stock.save()

        ref = f"TRF-{uuid.uuid4().hex[:8].upper()}"
        movement = StockMovement.objects.create(
            reference_number=ref,
            product_id=product_id,
            from_warehouse_id=from_wh_id,
            to_warehouse_id=to_wh_id,
            movement_type='transfer',
            quantity=quantity,
            unit_cost=source_stock.unit_cost,
            performed_by=performed_by,
            notes=notes,
        )

        return Response({
            'message': f'Transferred {quantity} units to {target_stock.warehouse.name}',
            'movement': StockMovementSerializer(movement).data,
        })


class InventoryStatsAPIView(APIView):
    def get(self, request):
        stocks = StockItem.objects.all().select_related('warehouse', 'product')
        total_units = sum(s.quantity_on_hand for s in stocks)
        total_valuation = sum(s.total_inventory_value for s in stocks)
        low_stock_count = sum(1 for s in stocks if s.is_low_stock)
        total_warehouses = Warehouse.objects.filter(is_active=True).count()
        recent_movements = StockMovement.objects.count()

        warehouses_breakdown = []
        for wh in Warehouse.objects.filter(is_active=True):
            wh_stocks = wh.stocks.all()
            wh_units = sum(s.quantity_on_hand for s in wh_stocks)
            wh_val = sum(s.total_inventory_value for s in wh_stocks)
            warehouses_breakdown.append({
                'id': wh.id,
                'name': wh.name,
                'code': wh.code,
                'location': wh.location,
                'capacity_sqft': wh.capacity_sqft,
                'occupancy_pct': wh.current_occupancy_pct,
                'total_units': wh_units,
                'total_valuation': wh_val,
                'sku_count': wh_stocks.count(),
            })

        return Response({
            'total_units': total_units,
            'total_valuation': round(total_valuation, 2),
            'low_stock_count': low_stock_count,
            'total_warehouses': total_warehouses,
            'total_movements': recent_movements,
            'warehouses': warehouses_breakdown,
        })


# Legacy Class-based views
class WarehouseListAPIView(generics.ListAPIView):
    queryset = Warehouse.objects.filter(is_active=True)
    serializer_class = WarehouseSerializer


class StockItemListAPIView(generics.ListCreateAPIView):
    queryset = StockItem.objects.all()
    serializer_class = StockItemSerializer


class StockItemDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StockItem.objects.all()
    serializer_class = StockItemSerializer


class StockMovementListCreateAPIView(generics.ListCreateAPIView):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
