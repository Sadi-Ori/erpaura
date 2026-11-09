from django.contrib import admin
from .models import Contact, Lead, Activity, RecruitmentApplicant


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'contact_type', 'status', 'email', 'phone')
    list_filter = ('contact_type', 'status')
    search_fields = ('name', 'email', 'company')


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('title', 'contact', 'estimated_value', 'stage', 'probability_percentage', 'created_at')
    list_filter = ('stage', 'source')
    search_fields = ('title', 'contact__name')


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('activity_type', 'summary', 'contact', 'performed_by', 'performed_at')
    list_filter = ('activity_type', 'performed_at')
    search_fields = ('summary', 'contact__name', 'performed_by')


@admin.register(RecruitmentApplicant)
class RecruitmentApplicantAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'position', 'experience_years', 'stage', 'applied_at')
    list_filter = ('stage',)
    search_fields = ('full_name', 'email', 'position')
