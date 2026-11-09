from rest_framework import serializers
from .models import Contact, Lead, Activity, RecruitmentApplicant


class ActivitySerializer(serializers.ModelSerializer):
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    lead_title = serializers.CharField(source='lead.title', read_only=True, default='')

    class Meta:
        model = Activity
        fields = '__all__'


class LeadSerializer(serializers.ModelSerializer):
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    contact_company = serializers.CharField(source='contact.company', read_only=True)
    contact_email = serializers.CharField(source='contact.email', read_only=True)
    contact_phone = serializers.CharField(source='contact.phone', read_only=True)
    activities = ActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = '__all__'


class ContactSerializer(serializers.ModelSerializer):
    leads = LeadSerializer(many=True, read_only=True)
    activities = ActivitySerializer(many=True, read_only=True)
    leads_count = serializers.SerializerMethodField()

    class Meta:
        model = Contact
        fields = '__all__'

    def get_leads_count(self, obj):
        return obj.leads.count()


class RecruitmentApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruitmentApplicant
        fields = '__all__'
