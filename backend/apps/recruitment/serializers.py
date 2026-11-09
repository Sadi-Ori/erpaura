from rest_framework import serializers
from django.contrib.auth.models import User
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


class SubsidiarySerializer(serializers.ModelSerializer):
    vacancies_count = serializers.IntegerField(source='vacancies.count', read_only=True)

    class Meta:
        model = Subsidiary
        fields = '__all__'


class VacancyQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VacancyQuestion
        fields = '__all__'


class VacancySerializer(serializers.ModelSerializer):
    subsidiary_name = serializers.CharField(source='subsidiary.name', read_only=True)
    subsidiary_code = serializers.CharField(source='subsidiary.code', read_only=True)
    questions = VacancyQuestionSerializer(many=True, read_only=True)
    applications_count = serializers.IntegerField(source='applications.count', read_only=True)

    class Meta:
        model = Vacancy
        fields = '__all__'


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = '__all__'


class WorkExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkExperience
        fields = '__all__'


class ApplicantSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicantSkill
        fields = '__all__'


class ApplicantProfileSerializer(serializers.ModelSerializer):
    educations = EducationSerializer(many=True, read_only=True)
    experiences = WorkExperienceSerializer(many=True, read_only=True)
    skills = ApplicantSkillSerializer(many=True, read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = ApplicantProfile
        fields = '__all__'


class ApplicationAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)

    class Meta:
        model = ApplicationAnswer
        fields = '__all__'


class InterviewEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewEvaluation
        fields = '__all__'


class InterviewSerializer(serializers.ModelSerializer):
    evaluations = InterviewEvaluationSerializer(many=True, read_only=True)
    applicant_name = serializers.CharField(source='application.applicant.full_name', read_only=True)
    applicant_email = serializers.CharField(source='application.applicant.email', read_only=True)
    vacancy_title = serializers.CharField(source='application.vacancy.title', read_only=True)
    application_stage = serializers.CharField(source='application.stage', read_only=True)

    class Meta:
        model = Interview
        fields = '__all__'


class RecruitmentNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruitmentNote
        fields = '__all__'


class JobApplicationSerializer(serializers.ModelSerializer):
    vacancy_title = serializers.CharField(source='vacancy.title', read_only=True)
    vacancy_code = serializers.CharField(source='vacancy.vacancy_code', read_only=True)
    subsidiary_name = serializers.CharField(source='vacancy.subsidiary.name', read_only=True)
    applicant_name = serializers.CharField(source='applicant.full_name', read_only=True)
    applicant_email = serializers.CharField(source='applicant.email', read_only=True)
    applicant_phone = serializers.CharField(source='applicant.phone', read_only=True)
    applicant_headline = serializers.CharField(source='applicant.headline', read_only=True)
    answers = ApplicationAnswerSerializer(many=True, read_only=True)
    interviews = InterviewSerializer(many=True, read_only=True)
    notes = RecruitmentNoteSerializer(many=True, read_only=True)
    applicant_details = ApplicantProfileSerializer(source='applicant', read_only=True)

    class Meta:
        model = JobApplication
        fields = '__all__'
