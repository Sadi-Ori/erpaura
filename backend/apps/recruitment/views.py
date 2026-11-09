from datetime import datetime, date
from django.utils import timezone
from django.db.models import Count, Q
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Subsidiary,
    Vacancy,
    VacancyQuestion,
    ApplicantProfile,
    Education,
    WorkExperience,
    ApplicantSkill,
    JobApplication,
    ApplicationAnswer,
    Interview,
    InterviewEvaluation,
    RecruitmentNote,
)
from .serializers import (
    SubsidiarySerializer,
    VacancySerializer,
    VacancyQuestionSerializer,
    ApplicantProfileSerializer,
    EducationSerializer,
    WorkExperienceSerializer,
    ApplicantSkillSerializer,
    JobApplicationSerializer,
    ApplicationAnswerSerializer,
    InterviewSerializer,
    InterviewEvaluationSerializer,
    RecruitmentNoteSerializer,
)


class SubsidiaryViewSet(viewsets.ModelViewSet):
    queryset = Subsidiary.objects.all()
    serializer_class = SubsidiarySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code', 'industry', 'city']


class VacancyViewSet(viewsets.ModelViewSet):
    queryset = Vacancy.objects.all().select_related('subsidiary', 'department').prefetch_related('questions', 'applications')
    serializer_class = VacancySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'vacancy_code', 'description', 'requirements', 'subsidiary__name', 'department_name']

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        subsidiary_param = self.request.query_params.get('subsidiary')
        job_type_param = self.request.query_params.get('job_type')
        experience_param = self.request.query_params.get('experience_level')

        if status_param:
            qs = qs.filter(status=status_param)
        if subsidiary_param:
            qs = qs.filter(subsidiary_id=subsidiary_param)
        if job_type_param:
            qs = qs.filter(job_type=job_type_param)
        if experience_param:
            qs = qs.filter(experience_level=experience_param)
        return qs

    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        vacancy = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Vacancy.STATUS_CHOICES):
            vacancy.status = new_status
            vacancy.save()
            return Response(VacancySerializer(vacancy).data)
        return Response({'error': f'Invalid status: {new_status}'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_question(self, request, pk=None):
        vacancy = self.get_object()
        data = request.data.copy()
        data['vacancy'] = vacancy.id
        serializer = VacancyQuestionSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VacancyQuestionViewSet(viewsets.ModelViewSet):
    queryset = VacancyQuestion.objects.all()
    serializer_class = VacancyQuestionSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        vacancy_id = self.request.query_params.get('vacancy')
        if vacancy_id:
            qs = qs.filter(vacancy_id=vacancy_id)
        return qs


class ApplicantProfileViewSet(viewsets.ModelViewSet):
    queryset = ApplicantProfile.objects.all().prefetch_related('educations', 'experiences', 'skills', 'applications')
    serializer_class = ApplicantProfileSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'headline']

    @action(detail=False, methods=['get'])
    def by_email(self, request):
        email = request.query_params.get('email')
        if not email:
            return Response({'error': 'Email query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        profile = ApplicantProfile.objects.filter(email__iexact=email).first()
        if not profile:
            return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ApplicantProfileSerializer(profile).data)


class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer


class WorkExperienceViewSet(viewsets.ModelViewSet):
    queryset = WorkExperience.objects.all()
    serializer_class = WorkExperienceSerializer


class ApplicantSkillViewSet(viewsets.ModelViewSet):
    queryset = ApplicantSkill.objects.all()
    serializer_class = ApplicantSkillSerializer


class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all().select_related(
        'vacancy', 'vacancy__subsidiary', 'applicant'
    ).prefetch_related('answers', 'interviews', 'interviews__evaluations', 'notes')
    serializer_class = JobApplicationSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['application_number', 'applicant__first_name', 'applicant__last_name', 'applicant__email', 'vacancy__title']

    def get_queryset(self):
        qs = super().get_queryset()
        stage_param = self.request.query_params.get('stage')
        vacancy_param = self.request.query_params.get('vacancy')
        applicant_email = self.request.query_params.get('email')
        is_draft_param = self.request.query_params.get('is_draft')

        if stage_param:
            qs = qs.filter(stage=stage_param)
        if vacancy_param:
            qs = qs.filter(vacancy_id=vacancy_param)
        if applicant_email:
            qs = qs.filter(applicant__email__iexact=applicant_email)
        if is_draft_param is not None:
            qs = qs.filter(is_draft=is_draft_param.lower() in ['true', '1'])
        return qs

    @action(detail=False, methods=['post'])
    def submit_or_draft(self, request):
        """
        Unified endpoint for applicants to create/update reusable profile and submit or save draft application.
        """
        data = request.data
        vacancy_id = data.get('vacancy_id')
        applicant_email = data.get('email', '').strip().lower()
        is_draft = data.get('is_draft', False)

        if not vacancy_id or not applicant_email:
            return Response({'error': 'vacancy_id and email are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vacancy = Vacancy.objects.get(id=vacancy_id)
        except Vacancy.DoesNotExist:
            return Response({'error': 'Vacancy not found'}, status=status.HTTP_404_NOT_FOUND)

        # 1. Update or create ApplicantProfile
        profile, _ = ApplicantProfile.objects.get_or_create(
            email=applicant_email,
            defaults={
                'first_name': data.get('first_name', ''),
                'last_name': data.get('last_name', ''),
                'phone': data.get('phone', ''),
                'address': data.get('address', ''),
                'headline': data.get('headline', ''),
                'bio_summary': data.get('bio_summary', ''),
                'resume_url': data.get('resume_url', ''),
                'resume_file_name': data.get('resume_file_name', 'resume.pdf'),
                'portfolio_url': data.get('portfolio_url', ''),
                'linkedin_url': data.get('linkedin_url', ''),
                'github_url': data.get('github_url', ''),
            }
        )

        # Update profile fields if provided
        for field in ['first_name', 'last_name', 'phone', 'address', 'headline', 'bio_summary', 'resume_url', 'resume_file_name', 'portfolio_url', 'linkedin_url', 'github_url']:
            if field in data and data[field]:
                setattr(profile, field, data[field])
        profile.save()

        # Handle education records if sent
        if 'educations' in data and isinstance(data['educations'], list):
            for edu_item in data['educations']:
                if edu_item.get('institution') and edu_item.get('degree'):
                    Education.objects.update_or_create(
                        profile=profile,
                        institution=edu_item.get('institution'),
                        degree=edu_item.get('degree'),
                        defaults={
                            'field_of_study': edu_item.get('field_of_study', 'General Studies'),
                            'start_year': edu_item.get('start_year', 2020),
                            'end_year': edu_item.get('end_year', 2024),
                            'grade_gpa': edu_item.get('grade_gpa', ''),
                        }
                    )

        # Handle work experiences if sent
        if 'experiences' in data and isinstance(data['experiences'], list):
            for exp_item in data['experiences']:
                if exp_item.get('company') and exp_item.get('position'):
                    start_date_val = exp_item.get('start_date') or date.today()
                    WorkExperience.objects.update_or_create(
                        profile=profile,
                        company=exp_item.get('company'),
                        position=exp_item.get('position'),
                        defaults={
                            'location': exp_item.get('location', ''),
                            'start_date': start_date_val,
                            'description': exp_item.get('description', ''),
                            'is_current': exp_item.get('is_current', False),
                        }
                    )

        # Handle skills if sent
        if 'skills' in data and isinstance(data['skills'], list):
            for sk in data['skills']:
                s_name = sk.get('skill_name') if isinstance(sk, dict) else str(sk)
                if s_name:
                    ApplicantSkill.objects.update_or_create(
                        profile=profile,
                        skill_name=s_name,
                        defaults={
                            'proficiency': sk.get('proficiency', 'intermediate') if isinstance(sk, dict) else 'intermediate',
                            'years_of_experience': sk.get('years_of_experience', 2.0) if isinstance(sk, dict) else 2.0,
                        }
                    )

        # 2. Check if existing application exists
        application, created = JobApplication.objects.get_or_create(
            vacancy=vacancy,
            applicant=profile,
            defaults={
                'cover_letter': data.get('cover_letter', ''),
                'resume_url': data.get('resume_url', profile.resume_url),
                'is_draft': is_draft,
                'stage': 'draft' if is_draft else 'submitted',
                'submitted_at': None if is_draft else timezone.now(),
            }
        )

        if not created:
            application.cover_letter = data.get('cover_letter', application.cover_letter)
            application.resume_url = data.get('resume_url', application.resume_url or profile.resume_url)
            application.is_draft = is_draft
            if not is_draft and application.stage == 'draft':
                application.stage = 'submitted'
                application.submitted_at = timezone.now()
            application.save()

        # 3. Save Question Answers
        answers_data = data.get('answers', {})
        if isinstance(answers_data, dict):
            for q_id, ans_val in answers_data.items():
                try:
                    q_obj = VacancyQuestion.objects.get(id=q_id, vacancy=vacancy)
                    ApplicationAnswer.objects.update_or_create(
                        application=application,
                        question=q_obj,
                        defaults={'answer_text': str(ans_val)}
                    )
                except (VacancyQuestion.DoesNotExist, ValueError):
                    continue

        return Response(JobApplicationSerializer(application).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def advance_stage(self, request, pk=None):
        application = self.get_object()
        new_stage = request.data.get('stage')
        if new_stage in dict(JobApplication.STAGE_CHOICES):
            application.stage = new_stage
            if new_stage == 'draft':
                application.is_draft = True
            else:
                application.is_draft = False
                if not application.submitted_at:
                    application.submitted_at = timezone.now()
            application.save()
            return Response(JobApplicationSerializer(application).data)
        return Response({'error': f'Invalid stage: {new_stage}'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        application = self.get_object()
        rating = request.data.get('rating')
        try:
            rating = int(rating)
            if 0 <= rating <= 5:
                application.recruiter_rating = rating
                application.save()
                return Response(JobApplicationSerializer(application).data)
        except (ValueError, TypeError):
            pass
        return Response({'error': 'Rating must be an integer between 0 and 5'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        application = self.get_object()
        note_text = request.data.get('note_text', '').strip()
        author_name = request.data.get('author_name', 'HR Recruiter')
        is_confidential = request.data.get('is_confidential', False)

        if not note_text:
            return Response({'error': 'Note text cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        note = RecruitmentNote.objects.create(
            application=application,
            author=request.user if request.user.is_authenticated else None,
            author_name=author_name,
            note_text=note_text,
            is_confidential=is_confidential,
        )
        return Response(RecruitmentNoteSerializer(note).data, status=status.HTTP_201_CREATED)


class InterviewViewSet(viewsets.ModelViewSet):
    queryset = Interview.objects.all().select_related(
        'application', 'application__applicant', 'application__vacancy'
    ).prefetch_related('evaluations')
    serializer_class = InterviewSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'application__applicant__first_name', 'application__applicant__last_name', 'application__vacancy__title']

    def get_queryset(self):
        qs = super().get_queryset()
        app_id = self.request.query_params.get('application')
        status_param = self.request.query_params.get('status')
        if app_id:
            qs = qs.filter(application_id=app_id)
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    @action(detail=True, methods=['post'])
    def evaluate(self, request, pk=None):
        interview = self.get_object()
        data = request.data.copy()
        data['interview'] = interview.id

        serializer = InterviewEvaluationSerializer(data=data)
        if serializer.is_valid():
            evaluation = serializer.save()
            interview.status = 'completed'
            interview.save()
            # If recommendation is strong hire or hire, we can advance candidate stage or update status
            return Response(InterviewEvaluationSerializer(evaluation).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InterviewEvaluationViewSet(viewsets.ModelViewSet):
    queryset = InterviewEvaluation.objects.all().select_related('interview')
    serializer_class = InterviewEvaluationSerializer


class RecruitmentNoteViewSet(viewsets.ModelViewSet):
    queryset = RecruitmentNote.objects.all().select_related('application')
    serializer_class = RecruitmentNoteSerializer


class RecruitmentStatsAPIView(APIView):
    """
    Returns high-level recruitment KPIs for the HR & Management Dashboard.
    """
    def get(self, request):
        total_vacancies = Vacancy.objects.count()
        published_vacancies = Vacancy.objects.filter(status='published').count()
        total_applicants = ApplicantProfile.objects.count()
        total_applications = JobApplication.objects.count()

        stage_counts = {
            'draft': JobApplication.objects.filter(stage='draft').count(),
            'submitted': JobApplication.objects.filter(stage='submitted').count(),
            'under_review': JobApplication.objects.filter(stage='under_review').count(),
            'shortlisted': JobApplication.objects.filter(stage='shortlisted').count(),
            'interview': JobApplication.objects.filter(stage='interview').count(),
            'selected': JobApplication.objects.filter(stage='selected').count(),
            'not_selected': JobApplication.objects.filter(stage='not_selected').count(),
            'closed': JobApplication.objects.filter(stage='closed').count(),
        }

        scheduled_interviews = Interview.objects.filter(status='scheduled').count()
        completed_interviews = Interview.objects.filter(status='completed').count()

        # Breakdown by subsidiary
        subsidiary_stats = []
        for sub in Subsidiary.objects.all():
            subsidiary_stats.append({
                'id': sub.id,
                'name': sub.name,
                'code': sub.code,
                'vacancies_count': sub.vacancies.count(),
                'active_vacancies': sub.vacancies.filter(status='published').count(),
            })

        return Response({
            'total_vacancies': total_vacancies,
            'published_vacancies': published_vacancies,
            'total_applicants': total_applicants,
            'total_applications': total_applications,
            'stage_counts': stage_counts,
            'scheduled_interviews': scheduled_interviews,
            'completed_interviews': completed_interviews,
            'subsidiaries': subsidiary_stats,
        })
