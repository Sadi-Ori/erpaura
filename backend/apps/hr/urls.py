from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet,
    DesignationViewSet,
    EmployeeViewSet,
    AttendanceRecordViewSet,
    TimeOffRequestViewSet,
    LeaveBalanceViewSet,
    PayrollEntryViewSet,
    PerformanceReviewViewSet,
    HRStatsAPIView,
    # Legacy aliases
    DepartmentListAPIView,
    EmployeeListCreateAPIView,
    EmployeeDetailAPIView,
    TimeOffRequestListCreateAPIView,
    TimeOffRequestDetailAPIView,
)

app_name = 'hr'

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'designations', DesignationViewSet, basename='designation')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'attendances', AttendanceRecordViewSet, basename='attendance')
router.register(r'timeoffs', TimeOffRequestViewSet, basename='timeoff')
router.register(r'balances', LeaveBalanceViewSet, basename='balance')
router.register(r'payroll', PayrollEntryViewSet, basename='payroll')
router.register(r'reviews', PerformanceReviewViewSet, basename='review')

urlpatterns = [
    path('stats/', HRStatsAPIView.as_view(), name='hr-stats'),
    path('', include(router.urls)),
]
