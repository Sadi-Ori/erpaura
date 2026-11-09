from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Contact, Lead, Activity, RecruitmentApplicant
from .serializers import ContactSerializer, LeadSerializer, ActivitySerializer, RecruitmentApplicantSerializer


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all().prefetch_related('leads', 'activities')
    serializer_class = ContactSerializer
    filterset_fields = ['contact_type', 'status']
    search_fields = ['name', 'email', 'company', 'phone']


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all().select_related('contact').prefetch_related('activities')
    serializer_class = LeadSerializer
    filterset_fields = ['stage', 'source']
    search_fields = ['title', 'contact__name', 'contact__company']

    @action(detail=True, methods=['post'])
    def move_stage(self, request, pk=None):
        lead = self.get_object()
        new_stage = request.data.get('stage')
        valid_stages = [s[0] for s in Lead.STAGE_CHOICES]
        if new_stage not in valid_stages:
            return Response({'error': f'Invalid stage. Must be one of {valid_stages}'}, status=status.HTTP_400_BAD_REQUEST)

        lead.stage = new_stage
        if new_stage == 'won':
            lead.probability_percentage = 100
        elif new_stage == 'lost':
            lead.probability_percentage = 0
        lead.save()

        # Record activity
        Activity.objects.create(
            contact=lead.contact,
            lead=lead,
            activity_type='note',
            summary=f"Pipeline stage moved to '{lead.get_stage_display()}'",
            performed_by=request.data.get('user', 'Account Executive')
        )

        return Response({
            'message': f"Lead '{lead.title}' moved to {lead.get_stage_display()}",
            'lead': LeadSerializer(lead).data
        })

    @action(detail=True, methods=['post'])
    def mark_won(self, request, pk=None):
        lead = self.get_object()
        lead.stage = 'won'
        lead.probability_percentage = 100
        lead.save()
        Activity.objects.create(
            contact=lead.contact,
            lead=lead,
            activity_type='note',
            summary=f"Deal Closed Won for ${lead.estimated_value}! 🎉",
            performed_by=request.data.get('user', 'Account Executive')
        )
        return Response({
            'message': f"Deal '{lead.title}' closed as WON 🎉",
            'lead': LeadSerializer(lead).data
        })

    @action(detail=True, methods=['post'])
    def mark_lost(self, request, pk=None):
        lead = self.get_object()
        lead.stage = 'lost'
        lead.probability_percentage = 0
        lead.save()
        Activity.objects.create(
            contact=lead.contact,
            lead=lead,
            activity_type='note',
            summary=f"Deal Closed Lost. Reason: {request.data.get('reason', 'N/A')}",
            performed_by=request.data.get('user', 'Account Executive')
        )
        return Response({
            'message': f"Deal '{lead.title}' closed as Lost.",
            'lead': LeadSerializer(lead).data
        })


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all().select_related('contact', 'lead')
    serializer_class = ActivitySerializer
    filterset_fields = ['activity_type', 'contact', 'lead']
    search_fields = ['summary', 'details', 'performed_by', 'contact__name']


class RecruitmentApplicantViewSet(viewsets.ModelViewSet):
    queryset = RecruitmentApplicant.objects.all().order_by('-applied_at')
    serializer_class = RecruitmentApplicantSerializer
    filterset_fields = ['stage']
    search_fields = ['full_name', 'email', 'position']


class CRMStatsAPIView(APIView):
    def get(self, request):
        leads = Lead.objects.all()
        total_leads = leads.count()
        
        # Pipeline value is all open leads
        open_leads = leads.exclude(stage__in=['won', 'lost'])
        total_pipeline_value = sum(l.estimated_value for l in open_leads)
        won_revenue = sum(l.estimated_value for l in leads.filter(stage='won'))
        
        won_count = leads.filter(stage='won').count()
        lost_count = leads.filter(stage='lost').count()
        decided_count = won_count + lost_count
        win_rate = round((won_count / decided_count * 100), 1) if decided_count > 0 else 0.0

        contacts = Contact.objects.all()
        contacts_count = contacts.count()
        customers_count = contacts.filter(contact_type='customer').count()
        prospects_count = contacts.filter(contact_type='lead').count()
        vendors_count = contacts.filter(contact_type='vendor').count()
        partners_count = contacts.filter(contact_type='partner').count()

        stage_breakdown = {}
        for code, label in Lead.STAGE_CHOICES:
            stage_leads = leads.filter(stage=code)
            stage_breakdown[code] = {
                'label': label,
                'count': stage_leads.count(),
                'total_value': float(sum(l.estimated_value for l in stage_leads))
            }

        return Response({
            'total_pipeline_value': float(total_pipeline_value),
            'won_revenue': float(won_revenue),
            'total_leads': total_leads,
            'won_count': won_count,
            'lost_count': lost_count,
            'win_rate': win_rate,
            'contacts_count': contacts_count,
            'customers_count': customers_count,
            'prospects_count': prospects_count,
            'vendors_count': vendors_count,
            'partners_count': partners_count,
            'stage_breakdown': stage_breakdown,
        })
