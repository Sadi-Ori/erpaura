import uuid
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import BillOfMaterials, BOMItem, ProductionOrder, WorkCenter
from .serializers import BillOfMaterialsSerializer, BOMItemSerializer, ProductionOrderSerializer, WorkCenterSerializer
from apps.inventory.models import StockItem, StockMovement, Warehouse


class WorkCenterViewSet(viewsets.ModelViewSet):
    queryset = WorkCenter.objects.all()
    serializer_class = WorkCenterSerializer
    search_fields = ['code', 'name', 'category']


class BillOfMaterialsViewSet(viewsets.ModelViewSet):
    queryset = BillOfMaterials.objects.all().select_related('finished_product').prefetch_related('components')
    serializer_class = BillOfMaterialsSerializer
    search_fields = ['code', 'name', 'finished_product__name']


class BOMItemViewSet(viewsets.ModelViewSet):
    queryset = BOMItem.objects.all()
    serializer_class = BOMItemSerializer


class ProductionOrderViewSet(viewsets.ModelViewSet):
    queryset = ProductionOrder.objects.all().select_related('bom', 'bom__finished_product')
    serializer_class = ProductionOrderSerializer
    filterset_fields = ['status', 'assigned_workstation']
    search_fields = ['order_number', 'bom__name', 'bom__finished_product__name']

    @action(detail=True, methods=['post'])
    def start_production(self, request, pk=None):
        order = self.get_object()
        order.status = 'in_progress'
        order.save()
        return Response({
            'message': f'Production Order {order.order_number} released to shop floor workstation: {order.assigned_workstation}.',
            'order': ProductionOrderSerializer(order).data
        })

    @action(detail=True, methods=['post'])
    def complete_qa(self, request, pk=None):
        order = self.get_object()
        order.status = 'quality_check'
        order.save()
        return Response({
            'message': f'Production Order {order.order_number} moved to QA Inspection.',
            'order': ProductionOrderSerializer(order).data
        })

    @action(detail=True, methods=['post'])
    def complete_order(self, request, pk=None):
        order = self.get_object()
        qty = int(request.data.get('completed_quantity', order.planned_quantity))
        order.completed_quantity = qty
        order.status = 'completed'
        order.save()

        # Stock finished goods into inventory
        product = order.bom.finished_product
        warehouse = Warehouse.objects.filter(is_active=True).first()
        if product and warehouse:
            stock_rec, _ = StockItem.objects.get_or_create(
                product=product,
                warehouse=warehouse,
                defaults={'quantity_on_hand': 0, 'unit_cost': order.bom.estimated_cost}
            )
            stock_rec.quantity_on_hand += qty
            stock_rec.save()

            StockMovement.objects.create(
                reference_number=f"MFG-RCPT-{uuid.uuid4().hex[:8].upper()}",
                product=product,
                to_warehouse=warehouse,
                movement_type='adjustment',
                quantity=qty,
                unit_cost=order.bom.estimated_cost,
                performed_by=request.data.get('completed_by', 'Manufacturing Production Supervisor'),
                notes=f"Production Run Completed for MO #{order.order_number}"
            )

        return Response({
            'message': f'Production Order {order.order_number} completed. {qty} units of {product.name} stocked to {warehouse.name if warehouse else "inventory"}.',
            'order': ProductionOrderSerializer(order).data
        })


class ManufacturingStatsAPIView(APIView):
    def get(self, request):
        orders = ProductionOrder.objects.all()
        total_orders = orders.count()
        planned_count = orders.filter(status='planned').count()
        in_progress_count = orders.filter(status='in_progress').count()
        qa_count = orders.filter(status='quality_check').count()
        completed_count = orders.filter(status='completed').count()
        
        total_planned_units = sum(o.planned_quantity for o in orders)
        total_completed_units = sum(o.completed_quantity for o in orders)
        
        boms_count = BillOfMaterials.objects.count()
        workcenters_count = WorkCenter.objects.count()

        return Response({
            'total_orders': total_orders,
            'planned_count': planned_count,
            'in_progress_count': in_progress_count,
            'qa_count': qa_count,
            'completed_count': completed_count,
            'total_planned_units': total_planned_units,
            'total_completed_units': total_completed_units,
            'boms_count': boms_count,
            'workcenters_count': workcenters_count,
        })
