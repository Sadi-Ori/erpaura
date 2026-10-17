from django.urls import path
from .views import (
    DepartmentListAPIView,
    EmployeeListCreateAPIView,
    EmployeeDetailAPIView,
    TimeOffRequestListCreateAPIView,
    TimeOffRequestDetailAPIView,
)

app_name = 'hr'

urlpatterns = [
    path('departments/', DepartmentListAPIView.as_view(), name='department-list'),
    path('employees/', EmployeeListCreateAPIView.as_view(), name='employee-list-create'),
    path('employees/<int:pk>/', EmployeeDetailAPIView.as_view(), name='employee-detail'),
    path('timeoffs/', TimeOffRequestListCreateAPIView.as_view(), name='timeoff-list-create'),
    path('timeoffs/<int:pk>/', TimeOffRequestDetailAPIView.as_view(), name='timeoff-detail'),
]
