from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ContactViewSet,
    LeadViewSet,
    ActivityViewSet,
    RecruitmentApplicantViewSet,
    CRMStatsAPIView,
)

app_name = 'crm'

router = DefaultRouter()
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'applicants', RecruitmentApplicantViewSet, basename='recruitment-applicant')

urlpatterns = [
    path('stats/', CRMStatsAPIView.as_view(), name='crm-stats'),
    path('', include(router.urls)),
]
