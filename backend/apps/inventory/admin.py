from django.contrib import admin
from .models import Warehouse, StockItem, StockMovement


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'location', 'manager', 'is_active')
    search_fields = ('name', 'code', 'location')


@admin.register(StockItem)
class StockItemAdmin(admin.ModelAdmin):
    list_display = ('product', 'warehouse', 'quantity_on_hand', 'quantity_reserved', 'reorder_level', 'updated_at')
    list_filter = ('warehouse',)
    search_fields = ('product__name', 'warehouse__code')
    list_editable = ('quantity_on_hand', 'reorder_level')


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'product', 'movement_type', 'quantity', 'from_warehouse', 'to_warehouse', 'timestamp')
    list_filter = ('movement_type', 'timestamp')
    search_fields = ('reference_number', 'product__name')
