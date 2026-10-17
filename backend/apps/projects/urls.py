from django.urls import path
from .views import (
    ProjectListCreateAPIView,
    ProjectDetailAPIView,
    TaskListCreateAPIView,
    TaskDetailAPIView,
    TimesheetListCreateAPIView,
)

app_name = 'projects'

urlpatterns = [
    path('projects/', ProjectListCreateAPIView.as_view(), name='project-list-create'),
    path('projects/<str:code>/', ProjectDetailAPIView.as_view(), name='project-detail'),
    path('tasks/', TaskListCreateAPIView.as_view(), name='task-list-create'),
    path('tasks/<int:pk>/', TaskDetailAPIView.as_view(), name='task-detail'),
    path('timesheets/', TimesheetListCreateAPIView.as_view(), name='timesheet-list-create'),
]
