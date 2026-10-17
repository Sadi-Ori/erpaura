from rest_framework import generics, filters
from .models import Contact, Lead, RecruitmentApplicant
from .serializers import ContactSerializer, LeadSerializer, RecruitmentApplicantSerializer


class ContactListCreateAPIView(generics.ListCreateAPIView):
    queryset = Contact.objects.all().order_by('-created_at')
    serializer_class = ContactSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'company', 'phone']


class ContactDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer


class LeadListCreateAPIView(generics.ListCreateAPIView):
    queryset = Lead.objects.all().select_related('contact')
    serializer_class = LeadSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'contact__name', 'contact__company']


class RecruitmentApplicantListCreateAPIView(generics.ListCreateAPIView):
    queryset = RecruitmentApplicant.objects.all().order_by('-applied_at')
    serializer_class = RecruitmentApplicantSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['full_name', 'email', 'position']
