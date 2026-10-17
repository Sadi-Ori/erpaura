from rest_framework import serializers
from .models import Warehouse, StockItem, StockMovement
from apps.products.serializers import ProductSerializer


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = '__all__'


class StockItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    warehouse_code = serializers.CharField(source='warehouse.code', read_only=True)
    available_quantity = serializers.IntegerField(read_only=True)

    class Meta:
        model = StockItem
        fields = '__all__'


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    from_warehouse_name = serializers.CharField(source='from_warehouse.name', read_only=True)
    to_warehouse_name = serializers.CharField(source='to_warehouse.name', read_only=True)

    class Meta:
        model = StockMovement
        fields = '__all__'
