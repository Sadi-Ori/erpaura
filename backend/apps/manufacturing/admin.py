from django.contrib import admin
from .models import BillOfMaterials, BOMItem, ProductionOrder


class BOMItemInline(admin.TabularInline):
    model = BOMItem
    extra = 1


@admin.register(BillOfMaterials)
class BillOfMaterialsAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'finished_product', 'quantity_produced', 'estimated_cost', 'is_active')
    search_fields = ('code', 'name', 'finished_product__name')
    list_filter = ('is_active',)
    inlines = [BOMItemInline]


@admin.register(ProductionOrder)
class ProductionOrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'bom', 'planned_quantity', 'completed_quantity', 'status', 'start_date', 'due_date')
    list_filter = ('status', 'assigned_workstation')
    search_fields = ('order_number', 'bom__name')
