from rest_framework import serializers
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


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.IntegerField(source='employees.count', read_only=True)

    class Meta:
        model = Department
        fields = '__all__'


class DesignationSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Designation
        fields = '__all__'


class AttendanceRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = '__all__'


class LeaveBalanceSerializer(serializers.ModelSerializer):
    annual_remaining = serializers.IntegerField(read_only=True)
    sick_remaining = serializers.IntegerField(read_only=True)
    casual_remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveBalance
        fields = '__all__'


class TimeOffRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_department = serializers.CharField(source='employee.department.name', read_only=True)
    employee_avatar = serializers.CharField(source='employee.avatar_url', read_only=True)

    class Meta:
        model = TimeOffRequest
        fields = '__all__'


class PayrollEntrySerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    employee_job = serializers.CharField(source='employee.job_title', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True)
    bank_name = serializers.CharField(source='employee.bank_name', read_only=True)
    bank_account_number = serializers.CharField(source='employee.bank_account_number', read_only=True)

    class Meta:
        model = PayrollEntry
        fields = '__all__'


class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    job_title = serializers.CharField(source='employee.job_title', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True)

    class Meta:
        model = PerformanceReview
        fields = '__all__'


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_title = serializers.CharField(source='designation.title', read_only=True)
    full_name = serializers.CharField(read_only=True)
    leave_balance = LeaveBalanceSerializer(read_only=True)
    recent_reviews = PerformanceReviewSerializer(source='reviews', many=True, read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'
