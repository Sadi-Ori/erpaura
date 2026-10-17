from django.urls import path
from .views import (
    SiteConfigAPIView,
    NavigationListAPIView,
    FAQListAPIView,
    ContactInquiryCreateAPIView,
    NewsletterSubscribeAPIView,
)

app_name = 'core'

urlpatterns = [
    path('config/', SiteConfigAPIView.as_view(), name='site-config'),
    path('navigation/', NavigationListAPIView.as_view(), name='navigation-list'),
    path('faqs/', FAQListAPIView.as_view(), name='faq-list'),
    path('contact/', ContactInquiryCreateAPIView.as_view(), name='contact-create'),
    path('newsletter/', NewsletterSubscribeAPIView.as_view(), name='newsletter-subscribe'),
]
