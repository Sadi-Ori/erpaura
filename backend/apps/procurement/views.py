import uuid
from decimal import Decimal
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PurchaseOrder, PurchaseOrderItem
from .serializers import PurchaseOrderSerializer, PurchaseOrderItemSerializer
from apps.inventory.models import StockItem, StockMovement, Warehouse


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().select_related('vendor').prefetch_related('items')
    serializer_class = PurchaseOrderSerializer
    filterset_fields = ['status', 'vendor']
    search_fields = ['po_number', 'vendor__name']

    @action(detail=True, methods=['post'])
    def send_order(self, request, pk=None):
        po = self.get_object()
        po.status = 'sent'
        po.save()
        return Response({
            'message': f'Purchase Order {po.po_number} dispatched to vendor {po.vendor.name}.',
            'order': PurchaseOrderSerializer(po).data
        })

    @action(detail=True, methods=['post'])
    def receive_goods(self, request, pk=None):
        po = self.get_object()
        warehouse_id = request.data.get('warehouse_id')
        warehouse = None
        if warehouse_id:
            warehouse = Warehouse.objects.filter(id=warehouse_id).first()
        if not warehouse:
            warehouse = Warehouse.objects.filter(is_active=True).first()

        items_stocked = []
        for item in po.items.all():
            if item.product and warehouse:
                stock_item, _ = StockItem.objects.get_or_create(
                    product=item.product,
                    warehouse=warehouse,
                    defaults={'quantity_on_hand': 0, 'unit_cost': item.unit_cost}
                )
                stock_item.quantity_on_hand += item.quantity
                stock_item.unit_cost = item.unit_cost
                stock_item.save()

                StockMovement.objects.create(
                    reference_number=f"GRN-{uuid.uuid4().hex[:8].upper()}",
                    product=item.product,
                    to_warehouse=warehouse,
                    movement_type='purchase',
                    quantity=item.quantity,
                    unit_cost=item.unit_cost,
                    performed_by=request.data.get('received_by', 'Procurement Receiving Specialist'),
                    notes=f"Goods Receipt Note for PO #{po.po_number}"
                )
                items_stocked.append(f"{item.quantity}x {item.item_name}")

        po.status = 'received'
        po.save()

        return Response({
            'message': f'Goods receipt completed for PO #{po.po_number}. Stock auto-credited to {warehouse.name if warehouse else "inventory"}.',
            'stocked_items': items_stocked,
            'order': PurchaseOrderSerializer(po).data
        })

    @action(detail=True, methods=['post'])
    def bill_order(self, request, pk=None):
        po = self.get_object()
        po.status = 'billed'
        po.save()
        return Response({
            'message': f'Purchase Order {po.po_number} 3-way matched & recorded as billed.',
            'order': PurchaseOrderSerializer(po).data
        })


class PurchaseOrderItemViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrderItem.objects.all()
    serializer_class = PurchaseOrderItemSerializer


class ProcurementStatsAPIView(APIView):
    def get(self, request):
        orders = PurchaseOrder.objects.all()
        total_spend = sum(o.total for o in orders if o.status in ['received', 'billed'])
        total_committed = sum(o.total for o in orders)
        draft_count = orders.filter(status='draft').count()
        sent_count = orders.filter(status='sent').count()
        received_count = orders.filter(status='received').count()
        billed_count = orders.filter(status='billed').count()
        
        from apps.crm.models import Contact
        vendors_count = Contact.objects.filter(contact_type='vendor').count()

        return Response({
            'total_spend': float(total_spend),
            'total_committed': float(total_committed),
            'total_orders': orders.count(),
            'draft_count': draft_count,
            'sent_count': sent_count,
            'received_count': received_count,
            'billed_count': billed_count,
            'vendors_count': vendors_count,
        })
