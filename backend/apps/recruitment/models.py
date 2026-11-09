import uuid
from django.db import models
from django.contrib.auth.models import User
from apps.hr.models import Department


class Subsidiary(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    industry = models.CharField(max_length=100, default='Technology & Enterprise Services')
    country = models.CharField(max_length=100, default='Global')
    city = models.CharField(max_length=100, default='San Francisco')
    website = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Subsidiaries'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class Vacancy(models.Model):
    JOB_TYPE_CHOICES = [
        ('full_time', 'Full-Time'),
        ('part_time', 'Part-Time'),
        ('contract', 'Contract / Consultant'),
        ('internship', 'Internship'),
        ('remote', 'Fully Remote'),
    ]

    EXPERIENCE_LEVEL_CHOICES = [
        ('entry', 'Entry Level (0-2 years)'),
        ('mid', 'Mid Level (3-5 years)'),
        ('senior', 'Senior (5-8 years)'),
        ('lead', 'Lead / Staff (8+ years)'),
        ('executive', 'Executive / Director'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('published', 'Published'),
        ('under_review', 'Applications Received / Under Review'),
        ('shortlisted', 'Shortlisting Candidates'),
        ('interview', 'Interviews in Progress'),
        ('closed', 'Position Closed / Filled'),
    ]

    title = models.CharField(max_length=200)
    vacancy_code = models.CharField(max_length=50, unique=True, blank=True)
    subsidiary = models.ForeignKey(Subsidiary, on_delete=models.CASCADE, related_name='vacancies')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='vacancies')
    department_name = models.CharField(max_length=100, blank=True)
    job_type = models.CharField(max_length=30, choices=JOB_TYPE_CHOICES, default='full_time')
    experience_level = models.CharField(max_length=30, choices=EXPERIENCE_LEVEL_CHOICES, default='mid')
    required_education = models.CharField(max_length=150, default="Bachelor's Degree or Equivalent")
    min_experience_years = models.PositiveIntegerField(default=2)
    openings_count = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=150, default='New York, NY / Hybrid')
    salary_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    salary_currency = models.CharField(max_length=10, default='USD')
    description = models.TextField(help_text="Detailed job overview and mission")
    responsibilities = models.TextField(blank=True, help_text="Day-to-day responsibilities")
    requirements = models.TextField(help_text="Required qualifications and skills")
    benefits = models.TextField(blank=True, help_text="Company perks and healthcare")
    required_skills = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    deadline = models.DateField(null=True, blank=True)
    hiring_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_vacancies')
    hiring_manager_name = models.CharField(max_length=150, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_vacancies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Vacancies'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.vacancy_code:
            self.vacancy_code = f"VAC-{uuid.uuid4().hex[:6].upper()}"
        if self.department and not self.department_name:
            self.department_name = self.department.name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.subsidiary.name} ({self.get_status_display()})"


class VacancyQuestion(models.Model):
    QUESTION_TYPES = [
        ('text', 'Single Line Text'),
        ('paragraph', 'Paragraph / Long Text'),
        ('boolean', 'Yes / No Choice'),
        ('multiple_choice', 'Multiple Choice Single Selection'),
        ('number', 'Numeric Answer'),
    ]

    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE, related_name='questions')
    question_text = models.CharField(max_length=500)
    question_type = models.CharField(max_length=30, choices=QUESTION_TYPES, default='text')
    options = models.JSONField(default=list, blank=True, help_text="Options list for multiple choice")
    is_required = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"{self.vacancy.title} - Q: {self.question_text[:40]}"


class ApplicantProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='applicant_profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)
    headline = models.CharField(max_length=200, blank=True, help_text="e.g. Senior Software Architect")
    bio_summary = models.TextField(blank=True)
    resume_url = models.CharField(max_length=500, blank=True)
    resume_file_name = models.CharField(max_length=255, blank=True)
    portfolio_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} ({self.email})"


class Education(models.Model):
    profile = models.ForeignKey(ApplicantProfile, on_delete=models.CASCADE, related_name='educations')
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=150)
    field_of_study = models.CharField(max_length=150)
    start_year = models.PositiveIntegerField()
    end_year = models.PositiveIntegerField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    grade_gpa = models.CharField(max_length=50, blank=True)
    activities = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_year']

    def __str__(self):
        return f"{self.degree} in {self.field_of_study} - {self.institution}"


class WorkExperience(models.Model):
    profile = models.ForeignKey(ApplicantProfile, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=150)
    location = models.CharField(max_length=150, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.position} at {self.company}"


class ApplicantSkill(models.Model):
    PROFICIENCY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]

    profile = models.ForeignKey(ApplicantProfile, on_delete=models.CASCADE, related_name='skills')
    skill_name = models.CharField(max_length=100)
    proficiency = models.CharField(max_length=30, choices=PROFICIENCY_CHOICES, default='intermediate')
    years_of_experience = models.DecimalField(max_digits=4, decimal_places=1, default=2.0)

    class Meta:
        ordering = ['-years_of_experience', 'skill_name']

    def __str__(self):
        return f"{self.skill_name} ({self.proficiency})"


class JobApplication(models.Model):
    STAGE_CHOICES = [
        ('draft', 'Application Draft'),
        ('submitted', 'Application Received'),
        ('under_review', 'Under Screening & Review'),
        ('shortlisted', 'Shortlisted Candidate'),
        ('interview', 'Interview Stage'),
        ('selected', 'Selected / Offer Extended'),
        ('not_selected', 'Not Selected / Declined'),
        ('closed', 'Position Closed'),
    ]

    application_number = models.CharField(max_length=50, unique=True, blank=True)
    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE, related_name='applications')
    applicant = models.ForeignKey(ApplicantProfile, on_delete=models.CASCADE, related_name='applications')
    cover_letter = models.TextField(blank=True)
    resume_url = models.CharField(max_length=500, blank=True)
    is_draft = models.BooleanField(default=False)
    stage = models.CharField(max_length=40, choices=STAGE_CHOICES, default='submitted')
    recruiter_rating = models.PositiveIntegerField(default=0, help_text="Rating 1 to 5")
    rejection_reason = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.application_number:
            self.application_number = f"APP-{uuid.uuid4().hex[:7].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.application_number} - {self.applicant.full_name} for {self.vacancy.title}"


class ApplicationAnswer(models.Model):
    application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(VacancyQuestion, on_delete=models.CASCADE, related_name='answers')
    answer_text = models.TextField(blank=True)

    class Meta:
        unique_together = ('application', 'question')

    def __str__(self):
        return f"Answer to {self.question.question_text[:30]}"


class Interview(models.Model):
    ROUND_CHOICES = [
        ('screening', 'Initial Recruiter Screening'),
        ('technical', 'Technical & Systems Assessment'),
        ('cultural', 'Cultural & Leadership Fit'),
        ('executive', 'Executive Partner Review'),
        ('final', 'Final Offer Discussion'),
    ]

    TYPE_CHOICES = [
        ('video', 'Video Conference (Meet / Zoom)'),
        ('phone', 'Phone Call'),
        ('in_person', 'Onsite In-Person Interview'),
    ]

    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
    ]

    application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name='interviews')
    title = models.CharField(max_length=200, default='Technical Interview Round')
    round_type = models.CharField(max_length=40, choices=ROUND_CHOICES, default='technical')
    interview_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='video')
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(default=45)
    location_or_url = models.CharField(max_length=300, default='https://meet.google.com/aur-recr-app')
    panelists = models.ManyToManyField(User, blank=True, related_name='assigned_interviews')
    panelist_names = models.CharField(max_length=255, default='Alex Vance (Lead Architect), Sara Chen (HR)')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='scheduled')
    meeting_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['scheduled_date', 'scheduled_time']

    def __str__(self):
        return f"{self.title} for {self.application.applicant.full_name} on {self.scheduled_date}"


class InterviewEvaluation(models.Model):
    RECOMMENDATION_CHOICES = [
        ('strong_hire', 'Strong Hire 🌟'),
        ('hire', 'Hire 👍'),
        ('hold', 'Neutral / Needs Follow-up 🤔'),
        ('reject', 'Do Not Hire ❌'),
    ]

    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='evaluations')
    evaluator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='recruitment_evaluations')
    evaluator_name = models.CharField(max_length=150, default='Senior Technical Interviewer')
    technical_score = models.PositiveIntegerField(default=4, help_text="1 to 5 scale")
    communication_score = models.PositiveIntegerField(default=4, help_text="1 to 5 scale")
    problem_solving_score = models.PositiveIntegerField(default=4, help_text="1 to 5 scale")
    cultural_fit_score = models.PositiveIntegerField(default=4, help_text="1 to 5 scale")
    overall_score = models.PositiveIntegerField(default=4, help_text="1 to 5 scale")
    feedback_notes = models.TextField(help_text="Detailed assessment commentary")
    recommendation = models.CharField(max_length=30, choices=RECOMMENDATION_CHOICES, default='hire')
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Evaluation by {self.evaluator_name} - {self.get_recommendation_display()}"


class RecruitmentNote(models.Model):
    application = models.ForeignKey(JobApplication, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='recruitment_notes')
    author_name = models.CharField(max_length=150, default='HR Recruiter')
    note_text = models.TextField()
    is_confidential = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Note on {self.application.application_number} by {self.author_name}"
