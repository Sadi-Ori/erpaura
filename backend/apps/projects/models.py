from django.db import models
from apps.crm.models import Contact


class Project(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning & Scope'),
        ('active', 'Active In-Progress'),
        ('review', 'Quality Review'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
    ]

    title = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    client = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    description = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='active')
    progress_percentage = models.PositiveIntegerField(default=0)
    start_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    spent = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.code}] {self.title} ({self.progress_percentage}%)"


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent Priority'),
    ]

    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('review', 'In Review'),
        ('done', 'Done'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assigned_to = models.CharField(max_length=150, blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    estimated_hours = models.DecimalField(max_digits=6, decimal_places=1, default=8.0)
    logged_hours = models.DecimalField(max_digits=6, decimal_places=1, default=0.0)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['due_date', 'priority']

    def __str__(self):
        return f"{self.title} ({self.project.code}) - {self.status}"


class Timesheet(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='timesheets')
    worker_name = models.CharField(max_length=150)
    work_date = models.DateField()
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-work_date', '-created_at']

    def __str__(self):
        return f"{self.worker_name}: {self.hours}h on {self.task.title} ({self.work_date})"
