from django.db import models
from django.utils import timezone
from apps.products.models import Product


class Warehouse(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20, unique=True)
    location = models.CharField(max_length=200)
    address = models.CharField(max_length=255, blank=True, default='')
    contact_phone = models.CharField(max_length=50, blank=True, default='')
    contact_email = models.CharField(max_length=100, blank=True, default='')
    manager = models.CharField(max_length=100, blank=True, default='')
    capacity_sqft = models.PositiveIntegerField(default=10000)
    current_occupancy_pct = models.PositiveIntegerField(default=65)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class BinLocation(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='bins')
    zone = models.CharField(max_length=50, default='Zone A - Fast Moving')
    aisle = models.CharField(max_length=20, default='Aisle 01')
    shelf = models.CharField(max_length=20, default='Tier 1')
    bin_code = models.CharField(max_length=50, unique=True)
    is_occupied = models.BooleanField(default=True)

    class Meta:
        ordering = ['bin_code']

    def __str__(self):
        return f"{self.bin_code} ({self.warehouse.code} - {self.zone})"


class StockItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_levels')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name='stocks')
    bin_location = models.ForeignKey(BinLocation, on_delete=models.SET_NULL, null=True, blank=True, related_name='stocked_items')
    quantity_on_hand = models.IntegerField(default=0)
    quantity_reserved = models.IntegerField(default=0)
    reorder_level = models.IntegerField(default=10)
    reorder_quantity = models.IntegerField(default=50)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    last_counted_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def available_quantity(self):
        return max(0, self.quantity_on_hand - self.quantity_reserved)

    @property
    def total_inventory_value(self):
        cost = self.unit_cost or (self.product.price if self.product else 0)
        return float(cost) * self.quantity_on_hand

    @property
    def is_low_stock(self):
        return self.quantity_on_hand <= self.reorder_level

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
        ('pos_sale', 'Point-of-Sale Register Deduct'),
    ]

    reference_number = models.CharField(max_length=50, unique=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    from_warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, blank=True, related_name='moves_out')
    to_warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, blank=True, related_name='moves_in')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    performed_by = models.CharField(max_length=150, default='Warehouse Specialist', blank=True)
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.reference_number}: {self.movement_type} - {self.quantity} of {self.product.name}"
