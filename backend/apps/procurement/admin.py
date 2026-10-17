from django.contrib import admin
from .models import PurchaseOrder, PurchaseOrderItem


class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('po_number', 'vendor', 'order_date', 'status', 'total', 'created_at')
    list_filter = ('status', 'order_date')
    search_fields = ('po_number', 'vendor__name')
    inlines = [PurchaseOrderItemInline]
