from rest_framework import viewsets
from .models import Equipment, MaintenanceRequest
from .serializers import EquipmentSerializer, MaintenanceRequestSerializer


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().prefetch_related('requests')
    serializer_class = EquipmentSerializer
    filterset_fields = ['status', 'category', 'location']
    search_fields = ['code', 'name', 'serial_number']


class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all().select_related('equipment')
    serializer_class = MaintenanceRequestSerializer
    filterset_fields = ['priority', 'status', 'assigned_technician']
    search_fields = ['ticket_number', 'title', 'equipment__name']
