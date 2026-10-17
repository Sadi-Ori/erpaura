from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import PurchaseOrder, PurchaseOrderItem
from .serializers import PurchaseOrderSerializer, PurchaseOrderItemSerializer


class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().select_related('vendor').prefetch_related('items')
    serializer_class = PurchaseOrderSerializer
    filterset_fields = ['status', 'vendor']
    search_fields = ['po_number', 'vendor__name']


class PurchaseOrderItemViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrderItem.objects.all()
    serializer_class = PurchaseOrderItemSerializer
