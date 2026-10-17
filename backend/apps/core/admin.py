from django.contrib import admin
from .models import CompanyProfile, AnnouncementBanner, NavigationItem, ContactInquiry, FAQItem, NewsletterSubscriber


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'version', 'email', 'phone')


@admin.register(AnnouncementBanner)
class AnnouncementBannerAdmin(admin.ModelAdmin):
    list_display = ('headline', 'cta_text', 'is_active', 'created_at')
    list_editable = ('is_active',)


class NavigationItemInline(admin.TabularInline):
    model = NavigationItem
    extra = 1
    fk_name = 'parent'


@admin.register(NavigationItem)
class NavigationItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'url', 'parent', 'order', 'is_active')
    list_filter = ('parent', 'is_active')
    search_fields = ('title', 'url')
    inlines = [NavigationItemInline]


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'company', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('created_at',)


@admin.register(FAQItem)
class FAQItemAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'order', 'is_published')
    list_filter = ('category', 'is_published')
    search_fields = ('question', 'answer')


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'subscribed_at', 'is_active')
    search_fields = ('email',)
