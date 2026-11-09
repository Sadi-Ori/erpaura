from rest_framework import serializers
from .models import Project, Milestone, Task, TaskChecklist, TaskComment, Timesheet, Issue


class TaskChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskChecklist
        fields = '__all__'


class TaskCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskComment
        fields = '__all__'


class TimesheetSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    project_code = serializers.CharField(source='task.project.code', read_only=True)
    project_title = serializers.CharField(source='task.project.title', read_only=True)

    class Meta:
        model = Timesheet
        fields = '__all__'


class TaskSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.code', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    milestone_title = serializers.CharField(source='milestone.title', read_only=True, default='')
    checklist_items = TaskChecklistSerializer(many=True, read_only=True)
    checklist_count = serializers.SerializerMethodField()
    completed_checklist_count = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = '__all__'

    def get_checklist_count(self, obj):
        return obj.checklist_items.count()

    def get_completed_checklist_count(self, obj):
        return obj.checklist_items.filter(is_completed=True).count()


class MilestoneSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.code', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    tasks_count = serializers.SerializerMethodField()
    completed_tasks_count = serializers.SerializerMethodField()

    class Meta:
        model = Milestone
        fields = '__all__'

    def get_tasks_count(self, obj):
        return obj.tasks.count()

    def get_completed_tasks_count(self, obj):
        return obj.tasks.filter(status='done').count()


class IssueSerializer(serializers.ModelSerializer):
    project_code = serializers.CharField(source='project.code', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True, default='')

    class Meta:
        model = Issue
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True, default='')
    tasks_count = serializers.SerializerMethodField()
    completed_tasks_count = serializers.SerializerMethodField()
    open_issues_count = serializers.SerializerMethodField()
    milestones_count = serializers.SerializerMethodField()
    recent_tasks = TaskSerializer(source='tasks', many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'

    def get_tasks_count(self, obj):
        return obj.tasks.count()

    def get_completed_tasks_count(self, obj):
        return obj.tasks.filter(status='done').count()

    def get_open_issues_count(self, obj):
        return obj.issues.filter(status__in=['open', 'investigating']).count()

    def get_milestones_count(self, obj):
        return obj.milestones.count()
