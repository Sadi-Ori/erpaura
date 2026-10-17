import uuid
from django.db import models
from django.utils import timezone
from apps.products.models import Product


class BillOfMaterials(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    finished_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='boms')
    quantity_produced = models.PositiveIntegerField(default=1)
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Bills of Materials'
        ordering = ['code']

    def __str__(self):
        return f"[{self.code}] {self.name} ({self.finished_product.name})"


class BOMItem(models.Model):
    bom = models.ForeignKey(BillOfMaterials, on_delete=models.CASCADE, related_name='components')
    material_name = models.CharField(max_length=150)
    quantity_required = models.DecimalField(max_digits=10, decimal_places=2, default=1.00)
    unit_of_measure = models.CharField(max_length=50, default='Units')
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    @property
    def total_cost(self):
        return round(self.quantity_required * self.unit_cost, 2)

    def __str__(self):
        return f"{self.quantity_required} {self.unit_of_measure} of {self.material_name} for {self.bom.code}"


class ProductionOrder(models.Model):
    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in_progress', 'On Shop Floor / In Production'),
        ('quality_check', 'Quality Assurance Inspection'),
        ('completed', 'Finished & Stocked 🎉'),
        ('cancelled', 'Cancelled'),
    ]

    order_number = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    bom = models.ForeignKey(BillOfMaterials, on_delete=models.CASCADE, related_name='production_orders')
    planned_quantity = models.PositiveIntegerField(default=10)
    completed_quantity = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='planned')
    start_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)
    assigned_workstation = models.CharField(max_length=100, default='Assembly Line A')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"MO #{self.order_number} - {self.bom.finished_product.name} ({self.status})"
