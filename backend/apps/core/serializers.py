from rest_framework import serializers
from .models import CompanyProfile, AnnouncementBanner, NavigationItem, ContactInquiry, FAQItem, NewsletterSubscriber


class CompanyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyProfile
        fields = '__all__'


class AnnouncementBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnouncementBanner
        fields = '__all__'


class NavigationItemSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = NavigationItem
        fields = ['id', 'title', 'slug', 'url', 'description', 'icon_name', 'order', 'is_external', 'children']

    def get_children(self, obj):
        children = obj.children.filter(is_active=True).order_by('order')
        return NavigationItemSerializer(children, many=True).data


class ContactInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = ['id', 'name', 'email', 'subject', 'message', 'phone', 'company', 'created_at']
        read_only_fields = ['id', 'created_at']


class FAQItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQItem
        fields = '__all__'


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'subscribed_at']
        read_only_fields = ['id', 'subscribed_at']
