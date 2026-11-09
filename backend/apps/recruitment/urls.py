from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SubsidiaryViewSet,
    VacancyViewSet,
    VacancyQuestionViewSet,
    ApplicantProfileViewSet,
    EducationViewSet,
    WorkExperienceViewSet,
    ApplicantSkillViewSet,
    JobApplicationViewSet,
    InterviewViewSet,
    InterviewEvaluationViewSet,
    RecruitmentNoteViewSet,
    RecruitmentStatsAPIView,
)

app_name = 'recruitment'

router = DefaultRouter()
router.register(r'subsidiaries', SubsidiaryViewSet, basename='subsidiary')
router.register(r'vacancies', VacancyViewSet, basename='vacancy')
router.register(r'questions', VacancyQuestionViewSet, basename='question')
router.register(r'profiles', ApplicantProfileViewSet, basename='profile')
router.register(r'educations', EducationViewSet, basename='education')
router.register(r'experiences', WorkExperienceViewSet, basename='experience')
router.register(r'skills', ApplicantSkillViewSet, basename='skill')
router.register(r'applications', JobApplicationViewSet, basename='application')
router.register(r'interviews', InterviewViewSet, basename='interview')
router.register(r'evaluations', InterviewEvaluationViewSet, basename='evaluation')
router.register(r'notes', RecruitmentNoteViewSet, basename='note')

urlpatterns = [
    path('stats/', RecruitmentStatsAPIView.as_view(), name='stats'),
    path('', include(router.urls)),
]
