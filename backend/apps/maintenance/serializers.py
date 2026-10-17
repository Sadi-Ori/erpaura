from rest_framework import serializers
from .models import Equipment, MaintenanceRequest


class EquipmentSerializer(serializers.ModelSerializer):
    open_requests_count = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = '__all__'

    def get_open_requests_count(self, obj):
        return obj.requests.exclude(status='resolved').count()


class MaintenanceRequestSerializer(serializers.ModelSerializer):
    equipment_details = EquipmentSerializer(source='equipment', read_only=True)

    class Meta:
        model = MaintenanceRequest
        fields = '__all__'
