from django.db import models
from apps.products.models import Product


class Warehouse(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20, unique=True)
    location = models.CharField(max_length=200)
    manager = models.CharField(max_length=100, blank=True)
    capacity_sqft = models.PositiveIntegerField(default=10000)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class StockItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_levels')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stocks')
    quantity_on_hand = models.IntegerField(default=0)
    quantity_reserved = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=10)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def available_quantity(self):
        return max(0, self.quantity_on_hand - self.quantity_reserved)

    class Meta:
        unique_together = ('product', 'warehouse')

    def __str__(self):
        return f"{self.product.name} @ {self.warehouse.code}: {self.quantity_on_hand} units"


class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ('receipt', 'Goods Receipt (Inbound)'),
        ('dispatch', 'Customer Dispatch (Outbound)'),
        ('transfer', 'Internal Warehouse Transfer'),
        ('adjustment', 'Cycle Count Inventory Adjustment'),
    ]

    reference_number = models.CharField(max_length=50, unique=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    from_warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, blank=True, related_name='moves_out')
    to_warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, blank=True, related_name='moves_in')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.reference_number}: {self.movement_type} - {self.quantity} of {self.product.name}"
