from django.contrib import admin
from .models import (
    Department,
    Designation,
    Employee,
    AttendanceRecord,
    TimeOffRequest,
    LeaveBalance,
    PayrollEntry,
    PerformanceReview,
)


class DesignationInline(admin.TabularInline):
    model = Designation
    extra = 1


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'manager_name', 'budget', 'location')
    search_fields = ('name', 'code', 'manager_name')
    inlines = [DesignationInline]


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ('title', 'code', 'department', 'salary_grade')
    list_filter = ('department', 'salary_grade')
    search_fields = ('title', 'code')


class AttendanceInline(admin.TabularInline):
    model = AttendanceRecord
    extra = 0
    ordering = ('-date',)


class PayrollInline(admin.TabularInline):
    model = PayrollEntry
    extra = 0
    fields = ('payslip_number', 'period_label', 'gross_salary', 'total_deductions', 'net_salary', 'status')
    readonly_fields = ('payslip_number', 'gross_salary', 'total_deductions', 'net_salary')


class PerformanceReviewInline(admin.StackedInline):
    model = PerformanceReview
    extra = 0


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'full_name', 'email', 'department', 'job_title', 'employment_type', 'status', 'hire_date')
    list_filter = ('department', 'status', 'employment_type')
    search_fields = ('first_name', 'last_name', 'email', 'employee_id', 'job_title')
    inlines = [AttendanceInline, PayrollInline, PerformanceReviewInline]


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'clock_in', 'clock_out', 'working_hours', 'status', 'late_minutes')
    list_filter = ('status', 'date')
    search_fields = ('employee__first_name', 'employee__last_name', 'employee__employee_id')


@admin.register(TimeOffRequest)
class TimeOffRequestAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'days_requested', 'start_date', 'end_date', 'status', 'created_at')
    list_filter = ('status', 'leave_type')
    search_fields = ('employee__first_name', 'employee__last_name', 'reason')
    list_editable = ('status',)


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'year', 'annual_quota', 'annual_used', 'annual_remaining', 'sick_quota', 'sick_used', 'casual_quota', 'casual_used')
    search_fields = ('employee__first_name', 'employee__last_name')


@admin.register(PayrollEntry)
class PayrollEntryAdmin(admin.ModelAdmin):
    list_display = ('payslip_number', 'employee', 'period_label', 'basic_salary', 'gross_salary', 'net_salary', 'status', 'payment_method')
    list_filter = ('status', 'year', 'month')
    search_fields = ('payslip_number', 'employee__first_name', 'employee__last_name', 'employee__employee_id')


@admin.register(PerformanceReview)
class PerformanceReviewAdmin(admin.ModelAdmin):
    list_display = ('employee', 'review_period', 'reviewer_name', 'overall_rating', 'promotion_recommendation', 'review_date')
    list_filter = ('overall_rating', 'promotion_recommendation')
    search_fields = ('employee__first_name', 'employee__last_name', 'reviewer_name')
