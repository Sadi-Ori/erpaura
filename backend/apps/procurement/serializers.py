from rest_framework import serializers
from .models import PurchaseOrder, PurchaseOrderItem
from apps.crm.serializers import ContactSerializer


class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrderItem
        fields = '__all__'


class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    vendor_details = ContactSerializer(source='vendor', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = '__all__'
