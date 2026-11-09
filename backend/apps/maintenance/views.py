import uuid
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Equipment, MaintenanceRequest
from .serializers import EquipmentSerializer, MaintenanceRequestSerializer


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().prefetch_related('requests')
    serializer_class = EquipmentSerializer
    filterset_fields = ['status', 'category', 'location']
    search_fields = ['code', 'name', 'serial_number']

    @action(detail=True, methods=['post'])
    def toggle_operational(self, request, pk=None):
        eq = self.get_object()
        if eq.status == 'operational':
            eq.status = 'under_maintenance'
        else:
            eq.status = 'operational'
        eq.save()
        return Response({
            'message': f'Equipment {eq.code} status updated to {eq.status}.',
            'equipment': EquipmentSerializer(eq).data
        })


class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all().select_related('equipment')
    serializer_class = MaintenanceRequestSerializer
    filterset_fields = ['priority', 'status', 'assigned_technician']
    search_fields = ['ticket_number', 'title', 'equipment__name']

    @action(detail=True, methods=['post'])
    def start_work(self, request, pk=None):
        req = self.get_object()
        req.status = 'in_progress'
        req.save()
        
        # Update equipment status to under maintenance
        eq = req.equipment
        eq.status = 'under_maintenance'
        eq.save()

        return Response({
            'message': f'Work started on ticket #{req.ticket_number}. Asset {eq.code} marked under maintenance.',
            'request': MaintenanceRequestSerializer(req).data
        })

    @action(detail=True, methods=['post'])
    def mark_waiting_parts(self, request, pk=None):
        req = self.get_object()
        req.status = 'waiting_parts'
        req.save()
        return Response({
            'message': f'Ticket #{req.ticket_number} placed on hold waiting for parts.',
            'request': MaintenanceRequestSerializer(req).data
        })

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        req = self.get_object()
        req.status = 'resolved'
        req.completion_date = timezone.now().date()
        notes = request.data.get('notes')
        if notes:
            req.notes = f"{req.notes}\n[Resolution]: {notes}" if req.notes else f"[Resolution]: {notes}"
        req.save()

        # Return equipment to operational
        eq = req.equipment
        eq.status = 'operational'
        eq.last_maintenance_date = timezone.now().date()
        eq.save()

        return Response({
            'message': f'Ticket #{req.ticket_number} resolved! Asset {eq.code} tested and restored to operational service.',
            'request': MaintenanceRequestSerializer(req).data
        })


class MaintenanceStatsAPIView(APIView):
    def get(self, request):
        equipment_qs = Equipment.objects.all()
        total_equipment = equipment_qs.count()
        operational_count = equipment_qs.filter(status='operational').count()
        under_maintenance_count = equipment_qs.filter(status='under_maintenance').count()
        decommissioned_count = equipment_qs.filter(status='decommissioned').count()

        reqs = MaintenanceRequest.objects.all()
        total_requests = reqs.count()
        open_requests = reqs.filter(status='open').count()
        in_progress_requests = reqs.filter(status='in_progress').count()
        waiting_parts_requests = reqs.filter(status='waiting_parts').count()
        resolved_requests = reqs.filter(status='resolved').count()
        critical_requests = reqs.filter(priority='critical', status__in=['open', 'in_progress']).count()

        operational_rate = round((operational_count / total_equipment * 100), 1) if total_equipment > 0 else 100.0

        return Response({
            'total_equipment': total_equipment,
            'operational_count': operational_count,
            'under_maintenance_count': under_maintenance_count,
            'decommissioned_count': decommissioned_count,
            'operational_rate': operational_rate,
            'total_requests': total_requests,
            'open_requests': open_requests,
            'in_progress_requests': in_progress_requests,
            'waiting_parts_requests': waiting_parts_requests,
            'resolved_requests': resolved_requests,
            'critical_requests': critical_requests,
        })
