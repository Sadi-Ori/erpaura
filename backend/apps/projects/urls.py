from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    MilestoneViewSet,
    TaskViewSet,
    TaskChecklistViewSet,
    TimesheetViewSet,
    IssueViewSet,
    ProjectStatsAPIView,
    # Legacy aliases
    ProjectListCreateAPIView,
    ProjectDetailAPIView,
    TaskListCreateAPIView,
    TaskDetailAPIView,
    TimesheetListCreateAPIView,
)

app_name = 'projects'

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'milestones', MilestoneViewSet, basename='milestone')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'checklists', TaskChecklistViewSet, basename='checklist')
router.register(r'timesheets', TimesheetViewSet, basename='timesheet')
router.register(r'issues', IssueViewSet, basename='issue')

urlpatterns = [
    path('stats/', ProjectStatsAPIView.as_view(), name='projects-stats'),
    # Router endpoints
    path('', include(router.urls)),
]
