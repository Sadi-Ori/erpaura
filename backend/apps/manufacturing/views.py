from rest_framework import viewsets
from .models import BillOfMaterials, BOMItem, ProductionOrder
from .serializers import BillOfMaterialsSerializer, BOMItemSerializer, ProductionOrderSerializer


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
    search_fields = ['order_number', 'bom__name']
