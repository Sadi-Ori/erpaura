import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone


class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    manager_name = models.CharField(max_length=150, blank=True)
    budget = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    location = models.CharField(max_length=100, blank=True, default='Headquarters / Hybrid')

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class Designation(models.Model):
    title = models.CharField(max_length=120)
    code = models.CharField(max_length=30, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='designations')
    salary_grade = models.CharField(max_length=50, default='Grade L4 - Senior Specialist')
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return f"{self.title} ({self.salary_grade})"


class Employee(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active Full-Time'),
        ('contract', 'Contractor / Fixed-Term'),
        ('on_leave', 'On Approved Leave'),
        ('terminated', 'Alumni / Inactive'),
    ]

    EMPLOYMENT_TYPES = [
        ('full_time', 'Full-Time Permanent'),
        ('part_time', 'Part-Time'),
        ('contract', 'Contractor / Consultant'),
        ('intern', 'Internship'),
    ]

    employee_id = models.CharField(max_length=50, blank=True, default='')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    job_title = models.CharField(max_length=120)
    employment_type = models.CharField(max_length=30, choices=EMPLOYMENT_TYPES, default='full_time')
    hire_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    avatar_url = models.CharField(max_length=255, blank=True, default="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")

    # Personal & Emergency details
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, default='Prefer not to say')
    blood_group = models.CharField(max_length=10, blank=True, default='O+')
    emergency_contact_name = models.CharField(max_length=150, blank=True)
    emergency_contact_phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True, default='San Francisco')
    country = models.CharField(max_length=100, blank=True, default='United States')

    # Compensation & Banking
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('6500.00'))
    salary_currency = models.CharField(max_length=10, default='USD')
    bank_name = models.CharField(max_length=100, blank=True, default='JPMorgan Chase Bank')
    bank_account_number = models.CharField(max_length=100, blank=True, default='**** **** **** 4819')
    tax_id = models.CharField(max_length=50, blank=True, default='TAX-US-99210')
    manager_name = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['first_name', 'last_name']

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def save(self, *args, **kwargs):
        if not self.employee_id:
            self.employee_id = f"EMP-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} ({self.employee_id}) - {self.job_title}"


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present / On-Time'),
        ('late', 'Late Arrival'),
        ('half_day', 'Half-Day Shift'),
        ('absent', 'Absent / No-Show'),
        ('on_leave', 'Approved Leave'),
        ('holiday', 'Company Holiday'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    clock_in = models.TimeField(null=True, blank=True)
    clock_out = models.TimeField(null=True, blank=True)
    working_hours = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('8.00'))
    late_minutes = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='present')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', 'employee']
        unique_together = ('employee', 'date')

    def __str__(self):
        return f"{self.employee.full_name} on {self.date} ({self.get_status_display()})"


class TimeOffRequest(models.Model):
    LEAVE_TYPES = [
        ('paid', 'Paid Annual Leave (PTO)'),
        ('sick', 'Medical / Sick Leave'),
        ('casual', 'Casual Leave'),
        ('unpaid', 'Unpaid Leave of Absence'),
        ('parental', 'Parental / Family Care'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Declined / Rejected'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='timeoffs')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES, default='paid')
    start_date = models.DateField()
    end_date = models.DateField()
    days_requested = models.PositiveIntegerField(default=1)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    manager_comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.days_requested} days ({self.leave_type}) [{self.status}]"


class LeaveBalance(models.Model):
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='leave_balance')
    year = models.PositiveIntegerField(default=2026)
    annual_quota = models.PositiveIntegerField(default=22)
    annual_used = models.PositiveIntegerField(default=4)
    sick_quota = models.PositiveIntegerField(default=10)
    sick_used = models.PositiveIntegerField(default=1)
    casual_quota = models.PositiveIntegerField(default=5)
    casual_used = models.PositiveIntegerField(default=0)

    @property
    def annual_remaining(self):
        return max(0, self.annual_quota - self.annual_used)

    @property
    def sick_remaining(self):
        return max(0, self.sick_quota - self.sick_used)

    @property
    def casual_remaining(self):
        return max(0, self.casual_quota - self.casual_used)

    def __str__(self):
        return f"Leave Balance for {self.employee.full_name} ({self.year})"


class PayrollEntry(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft Calculation'),
        ('processed', 'Approved & Processed'),
        ('paid', 'Disbursed / Paid'),
    ]

    payslip_number = models.CharField(max_length=50, unique=True, blank=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payrolls')
    month = models.PositiveIntegerField(default=10)
    year = models.PositiveIntegerField(default=2026)
    period_label = models.CharField(max_length=50, default='October 2026')

    # Base & Allowances
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    housing_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    medical_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    transport_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    bonus_allowance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    # Deductions
    tax_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    provident_fund = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    health_insurance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    unpaid_leave_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    # Totals
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2)
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='processed')
    payment_method = models.CharField(max_length=50, default='Direct Bank Wire')
    disbursed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-year', '-month', 'employee']

    def save(self, *args, **kwargs):
        if not self.payslip_number:
            self.payslip_number = f"PAY-{self.year}{self.month:02d}-{uuid.uuid4().hex[:6].upper()}"
        # Compute gross, deductions, net if not set
        if not self.gross_salary:
            self.gross_salary = (
                self.basic_salary +
                self.housing_allowance +
                self.medical_allowance +
                self.transport_allowance +
                self.bonus_allowance
            )
        if not self.total_deductions:
            self.total_deductions = (
                self.tax_deduction +
                self.provident_fund +
                self.health_insurance +
                self.unpaid_leave_deduction
            )
        if not self.net_salary:
            self.net_salary = self.gross_salary - self.total_deductions
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.payslip_number} - {self.employee.full_name} ({self.period_label}): ${self.net_salary}"


class PerformanceReview(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='reviews')
    reviewer_name = models.CharField(max_length=150, default='Engineering VP')
    review_period = models.CharField(max_length=50, default='Q3 2026 Performance Appraisal')
    technical_rating = models.PositiveIntegerField(default=5)
    communication_rating = models.PositiveIntegerField(default=4)
    punctuality_rating = models.PositiveIntegerField(default=5)
    leadership_rating = models.PositiveIntegerField(default=4)
    overall_rating = models.PositiveIntegerField(default=5)
    strengths = models.TextField(blank=True, default='Exceptional system architecture and code craftsmanship.')
    growth_areas = models.TextField(blank=True, default='Continue mentoring junior squad engineers on asynchronous workflows.')
    comments = models.TextField(blank=True, default='Consistently exceeds quarterly sprint goals.')
    promotion_recommendation = models.CharField(max_length=50, default='Accelerated Promotion')
    review_date = models.DateField(default=timezone.now)

    class Meta:
        ordering = ['-review_date']

    def __str__(self):
        return f"Review for {self.employee.full_name} - {self.overall_rating}/5 ({self.review_period})"
