from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    manager_name = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return self.name


class Employee(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active Full-Time'),
        ('contract', 'Contractor'),
        ('on_leave', 'On Leave'),
        ('terminated', 'Alumni'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    job_title = models.CharField(max_length=120)
    hire_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    avatar_url = models.CharField(max_length=255, blank=True, default="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150")

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} ({self.job_title})"


class TimeOffRequest(models.Model):
    LEAVE_TYPES = [
        ('paid', 'Paid Time Off (PTO)'),
        ('sick', 'Sick Leave'),
        ('unpaid', 'Unpaid Leave'),
        ('parental', 'Parental / Family Care'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='timeoffs')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPES, default='paid')
    start_date = models.DateField()
    end_date = models.DateField()
    days_requested = models.PositiveIntegerField(default=1)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.days_requested} days ({self.leave_type})"
