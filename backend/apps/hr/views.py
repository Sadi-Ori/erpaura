from decimal import Decimal
from datetime import date, datetime
from django.utils import timezone
from django.db.models import Count, Sum
from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

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
from .serializers import (
    DepartmentSerializer,
    DesignationSerializer,
    EmployeeSerializer,
    AttendanceRecordSerializer,
    TimeOffRequestSerializer,
    LeaveBalanceSerializer,
    PayrollEntrySerializer,
    PerformanceReviewSerializer,
)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().prefetch_related('employees')
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code', 'manager_name']


class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all().select_related('department')
    serializer_class = DesignationSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'code', 'salary_grade']


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().select_related('department', 'designation').prefetch_related('attendances', 'timeoffs', 'payrolls')
    serializer_class = EmployeeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'employee_id', 'job_title', 'department__name']

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        dept_param = self.request.query_params.get('department')
        emp_type = self.request.query_params.get('employment_type')

        if status_param:
            qs = qs.filter(status=status_param)
        if dept_param:
            qs = qs.filter(department_id=dept_param)
        if emp_type:
            qs = qs.filter(employment_type=emp_type)
        return qs

    @action(detail=True, methods=['post'])
    def clock_in_out(self, request, pk=None):
        employee = self.get_object()
        today = date.today()
        now_time = datetime.now().time()

        att, created = AttendanceRecord.objects.get_or_create(
            employee=employee,
            date=today,
            defaults={
                'clock_in': now_time,
                'status': 'present',
                'working_hours': Decimal('8.00'),
            }
        )

        if not created and not att.clock_out:
            att.clock_out = now_time
            # Calculate elapsed hours
            if att.clock_in:
                diff = datetime.combine(today, att.clock_out) - datetime.combine(today, att.clock_in)
                hours = round(diff.total_seconds() / 3600, 2)
                att.working_hours = Decimal(str(max(1.0, hours)))
            att.save()
            return Response({'message': f'Clocked out at {now_time.strftime("%H:%M")}', 'record': AttendanceRecordSerializer(att).data})

        return Response({'message': f'Clocked in at {att.clock_in.strftime("%H:%M")}', 'record': AttendanceRecordSerializer(att).data})


class AttendanceRecordViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.all().select_related('employee', 'employee__department')
    serializer_class = AttendanceRecordSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['employee__first_name', 'employee__last_name', 'employee__employee_id']

    def get_queryset(self):
        qs = super().get_queryset()
        date_param = self.request.query_params.get('date')
        status_param = self.request.query_params.get('status')
        emp_id = self.request.query_params.get('employee')

        if date_param:
            qs = qs.filter(date=date_param)
        if status_param:
            qs = qs.filter(status=status_param)
        if emp_id:
            qs = qs.filter(employee_id=emp_id)
        return qs


class TimeOffRequestViewSet(viewsets.ModelViewSet):
    queryset = TimeOffRequest.objects.all().select_related('employee', 'employee__department')
    serializer_class = TimeOffRequestSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['employee__first_name', 'employee__last_name', 'reason']

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        leave_type_param = self.request.query_params.get('leave_type')
        emp_id = self.request.query_params.get('employee')

        if status_param:
            qs = qs.filter(status=status_param)
        if leave_type_param:
            qs = qs.filter(leave_type=leave_type_param)
        if emp_id:
            qs = qs.filter(employee_id=emp_id)
        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'approved'
        leave.manager_comment = request.data.get('comment', 'Approved by Management.')
        leave.save()

        # Deduct from LeaveBalance if exists
        balance, _ = LeaveBalance.objects.get_or_create(employee=leave.employee)
        if leave.leave_type == 'paid':
            balance.annual_used += leave.days_requested
        elif leave.leave_type == 'sick':
            balance.sick_used += leave.days_requested
        elif leave.leave_type == 'casual':
            balance.casual_used += leave.days_requested
        balance.save()

        return Response(TimeOffRequestSerializer(leave).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'rejected'
        leave.manager_comment = request.data.get('comment', 'Declined due to critical delivery coverage.')
        leave.save()
        return Response(TimeOffRequestSerializer(leave).data)


class LeaveBalanceViewSet(viewsets.ModelViewSet):
    queryset = LeaveBalance.objects.all().select_related('employee')
    serializer_class = LeaveBalanceSerializer


class PayrollEntryViewSet(viewsets.ModelViewSet):
    queryset = PayrollEntry.objects.all().select_related('employee', 'employee__department')
    serializer_class = PayrollEntrySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['payslip_number', 'employee__first_name', 'employee__last_name', 'employee__employee_id']

    def get_queryset(self):
        qs = super().get_queryset()
        month_param = self.request.query_params.get('month')
        year_param = self.request.query_params.get('year')
        status_param = self.request.query_params.get('status')
        emp_id = self.request.query_params.get('employee')

        if month_param:
            qs = qs.filter(month=month_param)
        if year_param:
            qs = qs.filter(year=year_param)
        if status_param:
            qs = qs.filter(status=status_param)
        if emp_id:
            qs = qs.filter(employee_id=emp_id)
        return qs

    @action(detail=True, methods=['post'])
    def disburse(self, request, pk=None):
        payroll = self.get_object()
        payroll.status = 'paid'
        payroll.disbursed_at = timezone.now()
        payroll.payment_method = request.data.get('payment_method', payroll.payment_method)
        payroll.save()
        return Response(PayrollEntrySerializer(payroll).data)

    @action(detail=False, methods=['post'])
    def run_monthly_batch(self, request):
        """
        Batch generate payroll for all active employees for given month and year.
        Inspired by Online-Payroll-Management-System logic.
        """
        month = int(request.data.get('month', date.today().month))
        year = int(request.data.get('year', date.today().year))
        period_label = request.data.get('period_label', f"{date(year, month, 1).strftime('%B')} {year}")

        employees = Employee.objects.filter(status='active')
        created_count = 0
        updated_count = 0

        for emp in employees:
            base = emp.basic_salary or Decimal('6000.00')

            # Standard enterprise allowances
            housing = round(base * Decimal('0.20'), 2)      # 20% housing
            medical = round(base * Decimal('0.10'), 2)      # 10% medical
            transport = Decimal('350.00')                   # Fixed $350 transport
            bonus = Decimal('500.00') if emp.job_title.startswith('Lead') or emp.job_title.startswith('Senior') else Decimal('0.00')

            # Standard enterprise deductions
            tax = round(base * Decimal('0.15'), 2)          # 15% income tax
            pf = round(base * Decimal('0.08'), 2)           # 8% Provident Fund
            health = Decimal('180.00')                      # Group health plan

            gross = base + housing + medical + transport + bonus
            total_deduct = tax + pf + health
            net = gross - total_deduct

            entry, created = PayrollEntry.objects.update_or_create(
                employee=emp,
                month=month,
                year=year,
                defaults={
                    'period_label': period_label,
                    'basic_salary': base,
                    'housing_allowance': housing,
                    'medical_allowance': medical,
                    'transport_allowance': transport,
                    'bonus_allowance': bonus,
                    'tax_deduction': tax,
                    'provident_fund': pf,
                    'health_insurance': health,
                    'unpaid_leave_deduction': Decimal('0.00'),
                    'gross_salary': gross,
                    'total_deductions': total_deduct,
                    'net_salary': net,
                    'status': 'processed',
                    'payment_method': 'Direct Bank Wire (ACH/SWIFT)',
                }
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        return Response({
            'message': f'Payroll batch processed successfully for {period_label}',
            'month': month,
            'year': year,
            'created_count': created_count,
            'updated_count': updated_count,
            'total_processed': created_count + updated_count,
        }, status=status.HTTP_200_OK)


class PerformanceReviewViewSet(viewsets.ModelViewSet):
    queryset = PerformanceReview.objects.all().select_related('employee', 'employee__department')
    serializer_class = PerformanceReviewSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['employee__first_name', 'employee__last_name', 'review_period', 'reviewer_name']


class HRStatsAPIView(APIView):
    """
    Returns executive metrics for Employee Management, Attendance, and Payroll.
    """
    def get(self, request):
        today = date.today()
        total_employees = Employee.objects.count()
        active_employees = Employee.objects.filter(status='active').count()
        departments_count = Department.objects.count()

        # Attendance today
        present_today = AttendanceRecord.objects.filter(date=today, status='present').count()
        late_today = AttendanceRecord.objects.filter(date=today, status='late').count()
        on_leave_today = AttendanceRecord.objects.filter(date=today, status='on_leave').count()

        # Leaves
        pending_leaves = TimeOffRequest.objects.filter(status='pending').count()
        approved_leaves = TimeOffRequest.objects.filter(status='approved').count()

        # Payroll summary
        current_month = today.month
        current_year = today.year
        monthly_payroll_total = PayrollEntry.objects.filter(
            month=current_month, year=current_year
        ).aggregate(Sum('net_salary'))['net_salary__sum'] or Decimal('0.00')

        disbursed_total = PayrollEntry.objects.filter(
            month=current_month, year=current_year, status='paid'
        ).aggregate(Sum('net_salary'))['net_salary__sum'] or Decimal('0.00')

        # Department breakdown
        dept_stats = []
        for d in Department.objects.all():
            dept_stats.append({
                'id': d.id,
                'name': d.name,
                'code': d.code,
                'employee_count': d.employees.count(),
                'manager_name': d.manager_name,
            })

        return Response({
            'total_employees': total_employees,
            'active_employees': active_employees,
            'departments_count': departments_count,
            'attendance_today': {
                'present': present_today,
                'late': late_today,
                'on_leave': on_leave_today,
            },
            'pending_leaves': pending_leaves,
            'approved_leaves': approved_leaves,
            'monthly_payroll_total': monthly_payroll_total,
            'disbursed_total': disbursed_total,
            'departments': dept_stats,
        })


# Legacy view aliases for backward compatibility with existing URLs/tests
class DepartmentListAPIView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class EmployeeListCreateAPIView(generics.ListCreateAPIView):
    queryset = Employee.objects.all().select_related('department')
    serializer_class = EmployeeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'job_title', 'department__name']


class EmployeeDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class TimeOffRequestListCreateAPIView(generics.ListCreateAPIView):
    queryset = TimeOffRequest.objects.all().select_related('employee', 'employee__department')
    serializer_class = TimeOffRequestSerializer


class TimeOffRequestDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimeOffRequest.objects.all()
    serializer_class = TimeOffRequestSerializer
