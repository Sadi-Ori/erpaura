from django.contrib import admin
from .models import Contact, Lead, RecruitmentApplicant


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'company', 'contact_type', 'status', 'created_at')
    list_filter = ('contact_type', 'status')
    search_fields = ('name', 'email', 'company')


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('title', 'contact', 'estimated_value', 'stage', 'probability_percentage', 'expected_close_date')
    list_filter = ('stage',)
    search_fields = ('title', 'contact__name', 'contact__company')


@admin.register(RecruitmentApplicant)
class RecruitmentApplicantAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'position', 'experience_years', 'stage', 'applied_at')
    list_filter = ('stage', 'position')
    search_fields = ('full_name', 'email', 'position')
