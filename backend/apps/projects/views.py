from decimal import Decimal
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import generics, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Project, Milestone, Task, TaskChecklist, TaskComment, Timesheet, Issue
from .serializers import (
    ProjectSerializer,
    MilestoneSerializer,
    TaskSerializer,
    TaskChecklistSerializer,
    TaskCommentSerializer,
    TimesheetSerializer,
    IssueSerializer,
)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().select_related('client').prefetch_related('tasks', 'milestones', 'issues')
    serializer_class = ProjectSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        category_param = self.request.query_params.get('category')
        health_param = self.request.query_params.get('health')
        search_param = self.request.query_params.get('search')

        if status_param:
            qs = qs.filter(status=status_param)
        if category_param:
            qs = qs.filter(category=category_param)
        if health_param:
            qs = qs.filter(health_status=health_param)
        if search_param:
            qs = qs.filter(Q(title__icontains=search_param) | Q(code__icontains=search_param) | Q(description__icontains=search_param))
        return qs

    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        project = self.get_object()
        tasks = project.tasks.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def milestones(self, request, pk=None):
        project = self.get_object()
        milestones = project.milestones.all()
        serializer = MilestoneSerializer(milestones, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def issues(self, request, pk=None):
        project = self.get_object()
        issues = project.issues.all()
        serializer = IssueSerializer(issues, many=True)
        return Response(serializer.data)


class MilestoneViewSet(viewsets.ModelViewSet):
    queryset = Milestone.objects.all().select_related('project')
    serializer_class = MilestoneSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        project_param = self.request.query_params.get('project')
        if project_param:
            qs = qs.filter(project_id=project_param)
        return qs


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().select_related('project', 'milestone').prefetch_related('checklist_items')
    serializer_class = TaskSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        project_param = self.request.query_params.get('project')
        status_param = self.request.query_params.get('status')
        priority_param = self.request.query_params.get('priority')
        assigned_param = self.request.query_params.get('assigned_to')
        search_param = self.request.query_params.get('search')

        if project_param:
            qs = qs.filter(project_id=project_param)
        if status_param:
            qs = qs.filter(status=status_param)
        if priority_param:
            qs = qs.filter(priority=priority_param)
        if assigned_param:
            qs = qs.filter(assigned_to__icontains=assigned_param)
        if search_param:
            qs = qs.filter(Q(title__icontains=search_param) | Q(description__icontains=search_param))
        return qs

    @action(detail=True, methods=['post'])
    def move_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        if not new_status:
            return Response({'error': 'status required'}, status=status.HTTP_400_BAD_REQUEST)

        valid_statuses = [choice[0] for choice in Task.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'error': f'Invalid status. Choose from: {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)

        task.status = new_status
        task.save()

        # Recalculate project progress
        project = task.project
        total = project.tasks.count()
        completed = project.tasks.filter(status='done').count()
        if total > 0:
            project.progress_percentage = int((completed / total) * 100)
            if project.progress_percentage == 100:
                project.status = 'completed'
                project.health_status = 'completed'
            project.save()

        return Response({
            'message': f'Task status moved to {new_status}',
            'task': TaskSerializer(task).data,
            'project_progress': project.progress_percentage,
        })

    @action(detail=True, methods=['post'])
    def log_time(self, request, pk=None):
        task = self.get_object()
        worker_name = request.data.get('worker_name', 'Current User')
        hours = Decimal(str(request.data.get('hours', 1.0)))
        work_date = request.data.get('work_date', timezone.now().date().isoformat())
        notes = request.data.get('notes', '')
        is_billable = request.data.get('is_billable', True)
        hourly_rate = Decimal(str(request.data.get('hourly_rate', 75.00)))

        timesheet = Timesheet.objects.create(
            task=task,
            worker_name=worker_name,
            hours=hours,
            work_date=work_date,
            notes=notes,
            is_billable=is_billable,
            hourly_rate=hourly_rate,
            total_cost=hours * hourly_rate,
            approval_status='pending',
        )

        task.logged_hours = (task.logged_hours or Decimal('0.0')) + hours
        task.save()

        project = task.project
        project.spent = (project.spent or Decimal('0.0')) + (hours * hourly_rate)
        project.save()

        return Response({
            'message': f'Logged {hours} hours on {task.title}',
            'timesheet': TimesheetSerializer(timesheet).data,
            'task_logged_hours': str(task.logged_hours),
            'project_spent': str(project.spent),
        })

    @action(detail=True, methods=['post'])
    def add_checklist_item(self, request, pk=None):
        task = self.get_object()
        title = request.data.get('title')
        if not title:
            return Response({'error': 'title required'}, status=status.HTTP_400_BAD_REQUEST)

        item = TaskChecklist.objects.create(
            task=task,
            title=title,
            is_completed=False,
            order=task.checklist_items.count() + 1
        )
        return Response(TaskChecklistSerializer(item).data)


class TaskChecklistViewSet(viewsets.ModelViewSet):
    queryset = TaskChecklist.objects.all()
    serializer_class = TaskChecklistSerializer

    @action(detail=True, methods=['post'])
    def toggle(self, request, pk=None):
        item = self.get_object()
        item.is_completed = not item.is_completed
        item.save()
        return Response(TaskChecklistSerializer(item).data)


class TimesheetViewSet(viewsets.ModelViewSet):
    queryset = Timesheet.objects.all().select_related('task', 'task__project')
    serializer_class = TimesheetSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        task_param = self.request.query_params.get('task')
        project_param = self.request.query_params.get('project')
        worker_param = self.request.query_params.get('worker_name')
        status_param = self.request.query_params.get('status')

        if task_param:
            qs = qs.filter(task_id=task_param)
        if project_param:
            qs = qs.filter(task__project_id=project_param)
        if worker_param:
            qs = qs.filter(worker_name__icontains=worker_param)
        if status_param:
            qs = qs.filter(approval_status=status_param)
        return qs

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        ts = self.get_object()
        ts.approval_status = 'approved'
        ts.approved_by = request.data.get('approved_by', 'Project Director')
        ts.save()
        return Response(TimesheetSerializer(ts).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        ts = self.get_object()
        ts.approval_status = 'rejected'
        ts.approved_by = request.data.get('approved_by', 'Project Director')
        ts.save()
        return Response(TimesheetSerializer(ts).data)


class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all().select_related('project', 'task')
    serializer_class = IssueSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        project_param = self.request.query_params.get('project')
        severity_param = self.request.query_params.get('severity')
        status_param = self.request.query_params.get('status')

        if project_param:
            qs = qs.filter(project_id=project_param)
        if severity_param:
            qs = qs.filter(severity=severity_param)
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        issue = self.get_object()
        issue.status = 'resolved'
        issue.resolution_notes = request.data.get('resolution_notes', 'Issue resolved and verified in testing')
        issue.resolved_at = timezone.now()
        issue.save()
        return Response(IssueSerializer(issue).data)


class ProjectStatsAPIView(APIView):
    def get(self, request):
        total_projects = Project.objects.count()
        active_projects = Project.objects.filter(status='active').count()
        completed_projects = Project.objects.filter(status='completed').count()

        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status='done').count()
        in_progress_tasks = Task.objects.filter(status__in=['in_progress', 'review', 'testing']).count()
        todo_tasks = Task.objects.filter(status='todo').count()

        ts_stats = Timesheet.objects.aggregate(
            total_hours=Sum('hours'),
            total_cost=Sum('total_cost'),
            pending_count=Count('id', filter=Q(approval_status='pending'))
        )

        open_issues = Issue.objects.filter(status__in=['open', 'investigating']).count()
        critical_issues = Issue.objects.filter(severity='critical', status__in=['open', 'investigating']).count()

        health_counts = {
            'on_track': Project.objects.filter(health_status='on_track').count(),
            'at_risk': Project.objects.filter(health_status='at_risk').count(),
            'delayed': Project.objects.filter(health_status='delayed').count(),
            'completed': Project.objects.filter(health_status='completed').count(),
        }

        budget_stats = Project.objects.aggregate(
            total_budget=Sum('budget'),
            total_spent=Sum('spent')
        )

        return Response({
            'total_projects': total_projects,
            'active_projects': active_projects,
            'completed_projects': completed_projects,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'todo_tasks': todo_tasks,
            'total_hours_logged': float(ts_stats['total_hours'] or 0),
            'total_timesheet_cost': float(ts_stats['total_cost'] or 0),
            'pending_timesheets': ts_stats['pending_count'] or 0,
            'open_issues': open_issues,
            'critical_issues': critical_issues,
            'health_counts': health_counts,
            'total_budget': float(budget_stats['total_budget'] or 0),
            'total_spent': float(budget_stats['total_spent'] or 0),
        })


# Legacy Class-Based View Aliases
class ProjectListCreateAPIView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class ProjectDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer


class TaskListCreateAPIView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class TaskDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class TimesheetListCreateAPIView(generics.ListCreateAPIView):
    queryset = Timesheet.objects.all()
    serializer_class = TimesheetSerializer
