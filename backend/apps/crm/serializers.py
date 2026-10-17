from rest_framework import serializers
from .models import Contact, Lead, RecruitmentApplicant


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'


class LeadSerializer(serializers.ModelSerializer):
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    contact_company = serializers.CharField(source='contact.company', read_only=True)

    class Meta:
        model = Lead
        fields = '__all__'


class RecruitmentApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruitmentApplicant
        fields = '__all__'
