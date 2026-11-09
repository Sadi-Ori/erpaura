from rest_framework import serializers
from .models import Warehouse, BinLocation, StockItem, StockMovement
from apps.products.serializers import ProductSerializer
from apps.products.models import Product


class BinLocationSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    warehouse_code = serializers.CharField(source='warehouse.code', read_only=True)

    class Meta:
        model = BinLocation
        fields = '__all__'


class WarehouseSerializer(serializers.ModelSerializer):
    bins_count = serializers.SerializerMethodField()
    stock_items_count = serializers.SerializerMethodField()
    total_valuation = serializers.SerializerMethodField()

    class Meta:
        model = Warehouse
        fields = '__all__'

    def get_bins_count(self, obj):
        return obj.bins.count()

    def get_stock_items_count(self, obj):
        return obj.stocks.count()

    def get_total_valuation(self, obj):
        return sum(s.total_inventory_value for s in obj.stocks.all())


class StockItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True, required=False
    )
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    warehouse_code = serializers.CharField(source='warehouse.code', read_only=True)
    bin_code = serializers.CharField(source='bin_location.bin_code', read_only=True, default='')
    available_quantity = serializers.IntegerField(read_only=True)
    total_inventory_value = serializers.FloatField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = StockItem
        fields = '__all__'


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True, default='')
    from_warehouse_name = serializers.CharField(source='from_warehouse.name', read_only=True, default='')
    to_warehouse_name = serializers.CharField(source='to_warehouse.name', read_only=True, default='')

    class Meta:
        model = StockMovement
        fields = '__all__'
