from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import CompanyProfile, AnnouncementBanner, NavigationItem, ContactInquiry, FAQItem, NewsletterSubscriber
from .serializers import (
    CompanyProfileSerializer,
    AnnouncementBannerSerializer,
    NavigationItemSerializer,
    ContactInquirySerializer,
    FAQItemSerializer,
    NewsletterSubscriberSerializer,
)


class SiteConfigAPIView(APIView):
    """
    Returns unified site configuration including branding, active banners, and menus.
    """
    def get(self, request):
        profile = CompanyProfile.objects.first()
        banner = AnnouncementBanner.objects.filter(is_active=True).first()
        menus = NavigationItem.objects.filter(parent__isnull=True, is_active=True).order_by('order')

        return Response({
            'company': CompanyProfileSerializer(profile).data if profile else {
                'name': 'Aura ERP',
                'tagline': 'Next-Gen Open Source ERP Platform',
                'primary_color': '#6366F1',
                'secondary_color': '#10B981',
            },
            'banner': AnnouncementBannerSerializer(banner).data if banner else None,
            'navigation': NavigationItemSerializer(menus, many=True).data,
        })


class NavigationListAPIView(generics.ListAPIView):
    queryset = NavigationItem.objects.filter(parent__isnull=True, is_active=True).order_by('order')
    serializer_class = NavigationItemSerializer


class FAQListAPIView(generics.ListAPIView):
    queryset = FAQItem.objects.filter(is_published=True).order_by('order')
    serializer_class = FAQItemSerializer


class ContactInquiryCreateAPIView(generics.CreateAPIView):
    queryset = ContactInquiry.objects.all()
    serializer_class = ContactInquirySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            'success': True,
            'message': 'Your message has been received! Our enterprise solutions team will reach out shortly.',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)


class NewsletterSubscribeAPIView(generics.CreateAPIView):
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSubscriberSerializer

    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        subscriber, created = NewsletterSubscriber.objects.get_or_create(email=email)
        return Response({
            'success': True,
            'message': 'Thank you for subscribing to Aura ERP releases and announcements!'
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
