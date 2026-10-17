from django.db import models


class Contact(models.Model):
    CONTACT_TYPES = [
        ('customer', 'Customer'),
        ('lead', 'Prospective Lead'),
        ('vendor', 'Supplier / Vendor'),
        ('partner', 'Strategic Partner'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('lead', 'Lead'),
        ('negotiation', 'In Negotiation'),
        ('inactive', 'Inactive'),
    ]

    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    company = models.CharField(max_length=150, blank=True)
    job_title = models.CharField(max_length=100, blank=True)
    contact_type = models.CharField(max_length=20, choices=CONTACT_TYPES, default='customer')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.company or self.contact_type})"


class Lead(models.Model):
    STAGE_CHOICES = [
        ('new', 'New Opportunity'),
        ('qualification', 'Qualification'),
        ('demo_scheduled', 'Live Demo Scheduled'),
        ('proposal', 'Proposal Sent'),
        ('negotiation', 'Contract Negotiation'),
        ('won', 'Closed Won 🎉'),
        ('lost', 'Closed Lost'),
    ]

    title = models.CharField(max_length=200)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='leads')
    estimated_value = models.DecimalField(max_digits=12, decimal_places=2, default=5000.00)
    stage = models.CharField(max_length=30, choices=STAGE_CHOICES, default='new')
    expected_close_date = models.DateField(null=True, blank=True)
    probability_percentage = models.PositiveIntegerField(default=50)
    source = models.CharField(max_length=100, default='Website Demo Request')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - ${self.estimated_value} ({self.stage})"


class RecruitmentApplicant(models.Model):
    STAGE_CHOICES = [
        ('applied', 'Application Submitted'),
        ('review', 'Resume Under Review'),
        ('screening', 'Initial Phone Screening'),
        ('technical', 'Technical / Domain Interview'),
        ('culture', 'Executive Leadership Round'),
        ('offered', 'Job Offer Extended'),
        ('hired', 'Hired & Onboarded 🎉'),
        ('rejected', 'Declined / Archived'),
    ]

    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    position = models.CharField(max_length=120)
    experience_years = models.PositiveIntegerField(default=3)
    stage = models.CharField(max_length=30, choices=STAGE_CHOICES, default='applied')
    resume_url = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.full_name} - {self.position} ({self.stage})"
