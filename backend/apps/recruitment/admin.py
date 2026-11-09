from django.contrib import admin
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


class VacancyQuestionInline(admin.TabularInline):
    model = VacancyQuestion
    extra = 1


@admin.register(Subsidiary)
class SubsidiaryAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'industry', 'city', 'country', 'is_active', 'created_at')
    search_fields = ('name', 'code', 'city', 'country')
    list_filter = ('is_active', 'industry')


@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ('title', 'vacancy_code', 'subsidiary', 'department_name', 'job_type', 'experience_level', 'status', 'deadline', 'created_at')
    list_filter = ('status', 'job_type', 'experience_level', 'subsidiary')
    search_fields = ('title', 'vacancy_code', 'description', 'requirements')
    inlines = [VacancyQuestionInline]


class EducationInline(admin.TabularInline):
    model = Education
    extra = 0


class WorkExperienceInline(admin.TabularInline):
    model = WorkExperience
    extra = 0


class ApplicantSkillInline(admin.TabularInline):
    model = ApplicantSkill
    extra = 0


@admin.register(ApplicantProfile)
class ApplicantProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'headline', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'headline')
    inlines = [EducationInline, WorkExperienceInline, ApplicantSkillInline]


class ApplicationAnswerInline(admin.StackedInline):
    model = ApplicationAnswer
    extra = 0
    readonly_fields = ('question', 'answer_text')


class RecruitmentNoteInline(admin.StackedInline):
    model = RecruitmentNote
    extra = 0


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('application_number', 'applicant', 'vacancy', 'stage', 'recruiter_rating', 'is_draft', 'submitted_at')
    list_filter = ('stage', 'is_draft', 'vacancy__subsidiary')
    search_fields = ('application_number', 'applicant__first_name', 'applicant__last_name', 'applicant__email', 'vacancy__title')
    inlines = [ApplicationAnswerInline, RecruitmentNoteInline]


class InterviewEvaluationInline(admin.StackedInline):
    model = InterviewEvaluation
    extra = 0


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ('title', 'application', 'round_type', 'interview_type', 'scheduled_date', 'scheduled_time', 'status')
    list_filter = ('status', 'round_type', 'interview_type')
    search_fields = ('title', 'application__applicant__first_name', 'application__applicant__last_name', 'application__vacancy__title')
    inlines = [InterviewEvaluationInline]


@admin.register(InterviewEvaluation)
class InterviewEvaluationAdmin(admin.ModelAdmin):
    list_display = ('interview', 'evaluator_name', 'overall_score', 'recommendation', 'submitted_at')
    list_filter = ('recommendation', 'overall_score')
    search_fields = ('evaluator_name', 'feedback_notes')


@admin.register(RecruitmentNote)
class RecruitmentNoteAdmin(admin.ModelAdmin):
    list_display = ('application', 'author_name', 'is_confidential', 'created_at')
    list_filter = ('is_confidential',)
    search_fields = ('note_text', 'author_name')
