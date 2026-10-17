from rest_framework import generics, filters
from .models import Project, Task, Timesheet
from .serializers import ProjectSerializer, TaskSerializer, TimesheetSerializer


class ProjectListCreateAPIView(generics.ListCreateAPIView):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'code', 'description']


class ProjectDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'code'


class TaskListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'assigned_to', 'project__code']

    def get_queryset(self):
        queryset = Task.objects.all().select_related('project')
        project_code = self.request.query_params.get('project')
        if project_code:
            queryset = queryset.filter(project__code=project_code)
        return queryset


class TaskDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class TimesheetListCreateAPIView(generics.ListCreateAPIView):
    queryset = Timesheet.objects.all().select_related('task')[:100]
    serializer_class = TimesheetSerializer
