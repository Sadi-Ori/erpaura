from rest_framework import serializers
from .models import BillOfMaterials, BOMItem, ProductionOrder
from apps.products.serializers import ProductSerializer


class BOMItemSerializer(serializers.ModelSerializer):
    total_cost = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = BOMItem
        fields = '__all__'


class BillOfMaterialsSerializer(serializers.ModelSerializer):
    components = BOMItemSerializer(many=True, read_only=True)
    product_details = ProductSerializer(source='finished_product', read_only=True)

    class Meta:
        model = BillOfMaterials
        fields = '__all__'


class ProductionOrderSerializer(serializers.ModelSerializer):
    bom_details = BillOfMaterialsSerializer(source='bom', read_only=True)

    class Meta:
        model = ProductionOrder
        fields = '__all__'
