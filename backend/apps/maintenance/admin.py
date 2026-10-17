from django.contrib import admin
from .models import Equipment, MaintenanceRequest


class MaintenanceRequestInline(admin.TabularInline):
    model = MaintenanceRequest
    extra = 0


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'category', 'location', 'maintenance_frequency', 'status', 'next_maintenance_date')
    list_filter = ('status', 'category', 'maintenance_frequency')
    search_fields = ('code', 'name', 'serial_number')
    inlines = [MaintenanceRequestInline]


@admin.register(MaintenanceRequest)
class MaintenanceRequestAdmin(admin.ModelAdmin):
    list_display = ('ticket_number', 'equipment', 'title', 'priority', 'status', 'assigned_technician', 'scheduled_date')
    list_filter = ('priority', 'status', 'scheduled_date')
    search_fields = ('ticket_number', 'title', 'equipment__name')
