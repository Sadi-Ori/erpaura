from rest_framework import serializers
from .models import Coupon, Cart, CartItem, Order, OrderItem, Invoice, Quotation, QuotationItem, POSTransaction
from apps.products.serializers import ProductSerializer, PricingPlanSerializer


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'description', 'discount_percentage', 'fixed_discount', 'is_active']


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    plan = PricingPlanSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True, required=False)
    plan_id = serializers.IntegerField(write_only=True, required=False)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'plan', 'product_id', 'plan_id', 'quantity', 'billing_cycle', 'unit_price', 'total_price']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    coupon = CouponSerializer(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'session_id', 'items', 'coupon', 'subtotal', 'discount_amount', 'total']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['id', 'order_number', 'created_at']


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = '__all__'


class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = '__all__'


class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True, read_only=True)

    class Meta:
        model = Quotation
        fields = '__all__'


class POSTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = POSTransaction
        fields = '__all__'
