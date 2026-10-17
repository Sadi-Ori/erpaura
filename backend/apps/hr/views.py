from rest_framework import generics, filters
from .models import Department, Employee, TimeOffRequest
from .serializers import DepartmentSerializer, EmployeeSerializer, TimeOffRequestSerializer


class DepartmentListAPIView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class EmployeeListCreateAPIView(generics.ListCreateAPIView):
    queryset = Employee.objects.all().select_related('department')
    serializer_class = EmployeeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'job_title', 'department__name']


class EmployeeDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer


class TimeOffRequestListCreateAPIView(generics.ListCreateAPIView):
    queryset = TimeOffRequest.objects.all().select_related('employee', 'employee__department')
    serializer_class = TimeOffRequestSerializer


class TimeOffRequestDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimeOffRequest.objects.all()
    serializer_class = TimeOffRequestSerializer
