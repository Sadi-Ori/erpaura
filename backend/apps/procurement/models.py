import uuid
from django.db import models
from django.utils import timezone
from apps.crm.models import Contact
from apps.products.models import Product


class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft RFQ'),
        ('sent', 'Order Sent to Vendor'),
        ('received', 'Goods Received (Stock Added)'),
        ('billed', 'Vendor Invoiced & Billed'),
        ('cancelled', 'Cancelled'),
    ]

    po_number = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    vendor = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='purchase_orders')
    order_date = models.DateField(default=timezone.now)
    expected_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"PO #{self.po_number} - {self.vendor.name} (${self.total})"


class PurchaseOrderItem(models.Model):
    po = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    item_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=1)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.item_name} (PO #{self.po.po_number})"
