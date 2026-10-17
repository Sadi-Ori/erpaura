from rest_framework import serializers
from .models import Project, Task, Timesheet


class TimesheetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timesheet
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    project_code = serializers.CharField(source='project.code', read_only=True)

    class Meta:
        model = Task
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    tasks_count = serializers.IntegerField(source='tasks.count', read_only=True)
    completed_tasks_count = serializers.SerializerMethodField()
    client_name = serializers.CharField(source='client.name', read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

    def get_completed_tasks_count(self, obj):
        return obj.tasks.filter(status='done').count()
