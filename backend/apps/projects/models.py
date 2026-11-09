from django.db import models
from django.utils import timezone
from apps.crm.models import Contact


class Project(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planning & Scope'),
        ('active', 'Active In-Progress'),
        ('review', 'Quality Review'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
    ]

    HEALTH_CHOICES = [
        ('on_track', 'On Track (Green)'),
        ('at_risk', 'At Risk (Amber)'),
        ('delayed', 'Delayed (Red)'),
        ('completed', 'Completed'),
    ]

    CATEGORY_CHOICES = [
        ('software', 'Software Engineering'),
        ('infrastructure', 'Cloud Infrastructure'),
        ('client_delivery', 'Client Implementation'),
        ('product_design', 'Product & UX Design'),
        ('internal_ops', 'Internal Operations'),
    ]

    title = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='software')
    client = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True, related_name='projects')
    manager_name = models.CharField(max_length=150, blank=True, default='Project Lead')
    team_size = models.PositiveIntegerField(default=5)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='active')
    health_status = models.CharField(max_length=30, choices=HEALTH_CHOICES, default='on_track')
    progress_percentage = models.PositiveIntegerField(default=0)
    start_date = models.DateField(default=timezone.now)
    due_date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    spent = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.code}] {self.title} ({self.progress_percentage}%)"


class Milestone(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Release'),
        ('in_progress', 'In Development'),
        ('completed', 'Completed & Delivered'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    progress_percentage = models.PositiveIntegerField(default=0)
    deliverables = models.TextField(blank=True, help_text="Key deliverables or acceptance criteria")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['due_date', 'title']

    def __str__(self):
        return f"{self.project.code} - {self.title} ({self.status})"


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
        ('testing', 'QA & Testing'),
        ('done', 'Done'),
    ]

    TYPE_CHOICES = [
        ('feature', 'Feature'),
        ('bug', 'Bug / Defect'),
        ('improvement', 'Improvement'),
        ('task', 'Standard Task'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    milestone = models.ForeignKey(Milestone, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assigned_to = models.CharField(max_length=150, blank=True)
    task_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='feature')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    estimated_hours = models.DecimalField(max_digits=6, decimal_places=1, default=8.0)
    logged_hours = models.DecimalField(max_digits=6, decimal_places=1, default=0.0)
    tags = models.CharField(max_length=200, blank=True, default='')
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['due_date', 'priority']

    def __str__(self):
        return f"{self.title} ({self.project.code}) - {self.status}"


class TaskChecklist(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='checklist_items')
    title = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"[{'x' if self.is_completed else ' '}] {self.title}"


class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author_name = models.CharField(max_length=150, default='Team Member')
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.author_name} on {self.task.title}"


class Timesheet(models.Model):
    APPROVAL_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved by PM'),
        ('rejected', 'Rejected'),
    ]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='timesheets')
    worker_name = models.CharField(max_length=150)
    work_date = models.DateField()
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    is_billable = models.BooleanField(default=True)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=75.00)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default='pending')
    approved_by = models.CharField(max_length=150, blank=True)
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-work_date', '-created_at']

    def save(self, *args, **kwargs):
        if not self.total_cost or self.total_cost == 0:
            self.total_cost = self.hours * self.hourly_rate
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.worker_name}: {self.hours}h on {self.task.title} ({self.work_date})"


class Issue(models.Model):
    SEVERITY_CHOICES = [
        ('critical', 'Critical (Blocker)'),
        ('major', 'Major Defect'),
        ('minor', 'Minor Issue'),
        ('cosmetic', 'Cosmetic / Trivial'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('investigating', 'Investigating'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='issues')
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name='related_issues')
    title = models.CharField(max_length=250)
    description = models.TextField(blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='minor')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    reported_by = models.CharField(max_length=150, default='QA Engineer')
    assigned_to = models.CharField(max_length=150, blank=True)
    steps_to_reproduce = models.TextField(blank=True)
    resolution_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity.upper()}] {self.title} ({self.status})"
