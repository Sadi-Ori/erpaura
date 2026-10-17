import uuid
from django.db import models
from django.utils import timezone


class Equipment(models.Model):
    STATUS_CHOICES = [
        ('operational', 'Fully Operational'),
        ('under_maintenance', 'Under Maintenance / Inspection'),
        ('decommissioned', 'Decommissioned / Retired'),
    ]

    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=100, default='Plant Machinery')
    serial_number = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=150)
    maintenance_frequency = models.CharField(max_length=50, default='monthly')
    last_maintenance_date = models.DateField(null=True, blank=True)
    next_maintenance_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='operational')
    technician_in_charge = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Equipment & Assets'
        ordering = ['code']

    def __str__(self):
        return f"[{self.code}] {self.name} ({self.status})"


class MaintenanceRequest(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low / Routine'),
        ('medium', 'Medium'),
        ('high', 'High Priority'),
        ('critical', 'Critical / Machine Breakdown'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open / Backlog'),
        ('in_progress', 'In Progress'),
        ('waiting_parts', 'Waiting on Parts'),
        ('resolved', 'Resolved & Tested 🎉'),
    ]

    ticket_number = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='requests')
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    reported_by = models.CharField(max_length=100, default='Floor Supervisor')
    assigned_technician = models.CharField(max_length=100, blank=True)
    scheduled_date = models.DateField(default=timezone.now)
    completion_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"REQ #{self.ticket_number} - {self.equipment.name} ({self.priority})"
