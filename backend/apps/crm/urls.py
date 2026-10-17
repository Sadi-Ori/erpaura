from django.urls import path
from .views import (
    ContactListCreateAPIView,
    ContactDetailAPIView,
    LeadListCreateAPIView,
    RecruitmentApplicantListCreateAPIView,
)

app_name = 'crm'

urlpatterns = [
    path('contacts/', ContactListCreateAPIView.as_view(), name='contact-list-create'),
    path('contacts/<int:pk>/', ContactDetailAPIView.as_view(), name='contact-detail'),
    path('leads/', LeadListCreateAPIView.as_view(), name='lead-list-create'),
    path('recruitment/', RecruitmentApplicantListCreateAPIView.as_view(), name='recruitment-list-create'),
]
