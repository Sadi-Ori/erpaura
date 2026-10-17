from django.db import models


class CompanyProfile(models.Model):
    name = models.CharField(max_length=120, default="Aura ERP")
    tagline = models.CharField(
        max_length=255, 
        default="Next-Gen Open-Source ERP Platform Built to Scale Your Enterprise"
    )
    description = models.TextField(
        default="Aura ERP delivers modular ERP, automated workflows, and real-time business intelligence for modern businesses."
    )
    logo_light = models.CharField(max_length=255, default="/images/logo-light.svg")
    logo_dark = models.CharField(max_length=255, default="/images/logo-dark.svg")
    primary_color = models.CharField(max_length=20, default="#6366F1")
    secondary_color = models.CharField(max_length=20, default="#10B981")
    accent_color = models.CharField(max_length=20, default="#06B6D4")
    email = models.EmailField(default="contact@auraerp.io")
    phone = models.CharField(max_length=50, default="+1 (888) 287-2377")
    address = models.CharField(max_length=255, default="742 Innovation Way, Tech Valley, CA 94016")
    github_url = models.URLField(default="https://github.com/auraerp/auraerp")
    twitter_url = models.URLField(default="https://twitter.com/AuraERP")
    linkedin_url = models.URLField(default="https://linkedin.com/company/auraerp")
    youtube_url = models.URLField(default="https://youtube.com/@AuraERP")
    docs_url = models.URLField(default="/docs")
    demo_url = models.URLField(default="/demo")
    version = models.CharField(max_length=20, default="v3.2.0")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Company Profile"
        verbose_name_plural = "Company Profile"


class AnnouncementBanner(models.Model):
    headline = models.CharField(max_length=255, default="Aura: $29/Month. One Platform. Your Entire Enterprise")
    cta_text = models.CharField(max_length=100, default="Aura Cloud Hosting")
    cta_url = models.CharField(max_length=255, default="/pricing")
    background_color = models.CharField(max_length=20, default="#4F46E5")
    text_color = models.CharField(max_length=20, default="#FFFFFF")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.headline


class NavigationItem(models.Model):
    title = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    url = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True)
    icon_name = models.CharField(max_length=50, blank=True)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='children'
    )
    order = models.PositiveIntegerField(default=0)
    is_external = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.title} ({self.url})"


class ContactInquiry(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_review', 'In Review'),
        ('contacted', 'Contacted'),
        ('resolved', 'Resolved'),
    ]

    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    phone = models.CharField(max_length=50, blank=True)
    company = models.CharField(max_length=150, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Contact Inquiry"
        verbose_name_plural = "Contact Inquiries"

    def __str__(self):
        return f"{self.name} - {self.subject} ({self.status})"


class FAQItem(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.CharField(max_length=80, default="General")
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.question


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.email
