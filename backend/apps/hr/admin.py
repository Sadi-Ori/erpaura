from django.contrib import admin
from .models import Department, Employee, TimeOffRequest


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'manager_name')
    search_fields = ('name', 'code')


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'department', 'job_title', 'status', 'hire_date')
    list_filter = ('department', 'status')
    search_fields = ('first_name', 'last_name', 'email', 'job_title')


@admin.register(TimeOffRequest)
class TimeOffRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'days_requested', 'start_date', 'end_date', 'status')
    list_filter = ('status', 'leave_type')
    list_editable = ('status',)
