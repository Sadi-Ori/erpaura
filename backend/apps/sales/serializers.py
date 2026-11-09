from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, Invoice, Coupon, Quotation, QuotationItem, POSTransaction, POSRegister
from apps.products.serializers import ProductSerializer, PricingPlanSerializer


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    plan = PricingPlanSerializer(read_only=True)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = '__all__'


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    plan = PricingPlanSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'


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


class POSRegisterSerializer(serializers.ModelSerializer):
    transactions_count = serializers.SerializerMethodField()
    total_sales = serializers.SerializerMethodField()

    class Meta:
        model = POSRegister
        fields = '__all__'

    def get_transactions_count(self, obj):
        return obj.transactions.count()

    def get_total_sales(self, obj):
        return sum(t.total_amount for t in obj.transactions.all())


class POSTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = POSTransaction
        fields = '__all__'
