import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta, time
from django.utils import timezone

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aura_erp.settings')
django.setup()

from django.contrib.auth.models import User
from apps.hr.models import Department
from apps.recruitment.models import (
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


def seed_recruitment():
    print("🚀 Seeding Recruitment Management System (RMS) data...")

    # 1. Ensure admin user exists
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={'email': 'admin@auraerp.com', 'is_staff': True, 'is_superuser': True}
    )

    # 2. Subsidiaries
    sub_tech, _ = Subsidiary.objects.get_or_create(
        code='AURA-TECH',
        defaults={
            'name': 'Aura Technologies Inc.',
            'industry': 'Enterprise Cloud & AI Systems',
            'country': 'United States',
            'city': 'San Francisco, CA',
            'description': 'Core engineering, cloud platform infrastructure, and enterprise ERP development division.',
            'website': 'https://tech.auraerp.com',
            'is_active': True,
        }
    )

    sub_retail, _ = Subsidiary.objects.get_or_create(
        code='AURA-RETAIL',
        defaults={
            'name': 'Aura Retail Dynamics Ltd.',
            'industry': 'Retail Hardware & Point-of-Sale Solutions',
            'country': 'United States',
            'city': 'Austin, TX',
            'description': 'Touchscreen register hardware, barcode integration, and high-frequency omni-channel retail systems.',
            'website': 'https://retail.auraerp.com',
            'is_active': True,
        }
    )

    sub_logistics, _ = Subsidiary.objects.get_or_create(
        code='AURA-LOGISTICS',
        defaults={
            'name': 'Aura Global Logistics Corp.',
            'industry': 'Supply Chain & Intelligent Warehousing',
            'country': 'United States',
            'city': 'Chicago, IL',
            'description': 'Multi-tier warehouse management, automated guided vehicle (AGV) routing, and 3PL fulfillment.',
            'website': 'https://logistics.auraerp.com',
            'is_active': True,
        }
    )

    sub_fintech, _ = Subsidiary.objects.get_or_create(
        code='AURA-FINTECH',
        defaults={
            'name': 'Aura FinTech Solutions Ltd.',
            'industry': 'Banking & Ledger Automation',
            'country': 'United Kingdom',
            'city': 'London',
            'description': 'Multi-currency ledger, regulatory banking rails, and automated invoice clearance gateway.',
            'website': 'https://fintech.auraerp.com',
            'is_active': True,
        }
    )

    # 3. Ensure Departments exist
    dept_eng, _ = Department.objects.get_or_create(code='ENG', defaults={'name': 'Engineering & DevOps', 'manager_name': 'Marcus Vance'})
    dept_prod, _ = Department.objects.get_or_create(code='PRD', defaults={'name': 'Product & Design', 'manager_name': 'Chloe Zhao'})
    dept_sales, _ = Department.objects.get_or_create(code='SLS', defaults={'name': 'Enterprise Sales', 'manager_name': 'Robert Taylor'})
    dept_hr, _ = Department.objects.get_or_create(code='HR', defaults={'name': 'Human Capital & People Ops', 'manager_name': 'Elena Chen'})
    dept_ops, _ = Department.objects.get_or_create(code='OPS', defaults={'name': 'Operations & Supply Chain', 'manager_name': 'Vikram Patel'})

    # 4. Vacancies
    vac1, _ = Vacancy.objects.get_or_create(
        vacancy_code='VAC-ENG-001',
        defaults={
            'title': 'Lead Full-Stack Python & React Architect',
            'subsidiary': sub_tech,
            'department': dept_eng,
            'department_name': 'Engineering & DevOps',
            'job_type': 'full_time',
            'experience_level': 'senior',
            'required_education': "Bachelor's or Master's in Computer Science",
            'min_experience_years': 5,
            'openings_count': 2,
            'location': 'San Francisco, CA / Hybrid',
            'salary_min': Decimal('165000.00'),
            'salary_max': Decimal('210000.00'),
            'salary_currency': 'USD',
            'description': 'We are looking for an experienced Full-Stack Architect to lead the modernization of our core ERP platform using Django REST Framework, Next.js, and distributed microservices.',
            'responsibilities': '- Architect and implement modular RESTful APIs and real-time stateful web sockets.\n- Build responsive, accessible frontend layouts with Next.js 16, TypeScript, and Tailwind CSS.\n- Mentor engineering squad members through rigorous pull request reviews and architectural RFCs.\n- Optimize database queries across large-scale PostgreSQL and SQLite enterprise clusters.',
            'requirements': '- 5+ years of production experience with Python, Django, and Django REST Framework.\n- 4+ years building production applications with React or Next.js and TypeScript.\n- Deep understanding of database indexes, migrations, and concurrency controls.\n- Experience with Docker, Kubernetes, and CI/CD pipelines.',
            'benefits': '- Comprehensive health, vision, and dental insurance (100% company-covered)\n- Unlimited Paid Time Off (PTO) with mandatory 3-week minimum\n- $4,000 annual continuing education & conference budget\n- 401(k) retirement plan with 6% employer matching',
            'required_skills': ['Python', 'Django', 'Next.js', 'TypeScript', 'PostgreSQL', 'Docker'],
            'status': 'published',
            'deadline': date.today() + timedelta(days=45),
            'hiring_manager': admin_user,
            'hiring_manager_name': 'Elena Rostova (VP Engineering)',
            'created_by': admin_user,
        }
    )

    vac2, _ = Vacancy.objects.get_or_create(
        vacancy_code='VAC-SRE-002',
        defaults={
            'title': 'Senior Cloud Infrastructure & Site Reliability Engineer',
            'subsidiary': sub_tech,
            'department': dept_eng,
            'department_name': 'Engineering & DevOps',
            'job_type': 'remote',
            'experience_level': 'senior',
            'required_education': "Bachelor's in Computer Science, Systems Engineering, or equivalent",
            'min_experience_years': 5,
            'openings_count': 1,
            'location': 'Remote (US / Europe)',
            'salary_min': Decimal('150000.00'),
            'salary_max': Decimal('195000.00'),
            'salary_currency': 'USD',
            'description': 'Join the Core SRE team responsible for maintaining 99.99% uptime across all global cloud regions and enterprise on-prem installations.',
            'responsibilities': '- Manage automated Kubernetes deployments across AWS and multi-cloud regions.\n- Define infrastructure-as-code using Terraform and GitOps practices.\n- Implement distributed telemetry, observability, and anomaly detection with Prometheus and Grafana.\n- Participate in an empathetic on-call rotation with thorough blameless post-mortems.',
            'requirements': '- Extensive production experience with Kubernetes and AWS infrastructure.\n- Strong scripting and automation skills in Python, Go, or Bash.\n- Proficiency in Terraform, Helm, and GitHub Actions CI/CD.\n- Deep understanding of TCP/IP, DNS, SSL/TLS, and zero-trust service meshes.',
            'benefits': '- $1,500 home office ergonomics setup stipend\n- Global health coverage and wellness stipends\n- Generous equity stock options with 4-year vesting schedule',
            'required_skills': ['Kubernetes', 'AWS', 'Terraform', 'Prometheus', 'Python', 'Go'],
            'status': 'published',
            'deadline': date.today() + timedelta(days=30),
            'hiring_manager': admin_user,
            'hiring_manager_name': 'Marcus Vance (Director of Infrastructure)',
            'created_by': admin_user,
        }
    )

    vac3, _ = Vacancy.objects.get_or_create(
        vacancy_code='VAC-PRD-003',
        defaults={
            'title': 'Principal Product Designer (Design Systems & Enterprise UX)',
            'subsidiary': sub_tech,
            'department': dept_prod,
            'department_name': 'Product & Design',
            'job_type': 'full_time',
            'experience_level': 'lead',
            'required_education': "Degree in Human-Computer Interaction (HCI), Graphic Design, or Portfolio Proof",
            'min_experience_years': 6,
            'openings_count': 1,
            'location': 'San Francisco, CA / New York, NY',
            'salary_min': Decimal('160000.00'),
            'salary_max': Decimal('200000.00'),
            'salary_currency': 'USD',
            'description': 'We are looking for a visionary Lead Product Designer to evolve the Aura Design System across web, desktop, and mobile touchpoints.',
            'responsibilities': '- Own and scale our unified Figma component library and token taxonomy.\n- Conduct generative user interviews with enterprise CFOs, inventory managers, and engineers.\n- Rapidly prototype interactive motion prototypes to validate complex workflows.\n- Collaborate directly with frontend engineers to ensure 100% pixel-perfect fidelity.',
            'requirements': '- 6+ years designing B2B SaaS or complex data-dense applications.\n- Mastery of Figma, auto-layout, design tokens, and interactive component states.\n- Deep commitment to accessibility (WCAG 2.1 AA compliant design).\n- Strong verbal storytelling and ability to articulate trade-offs.',
            'benefits': '- High-end Apple Silicon hardware workstation & 4K monitor setup\n- Annual design conference pass (Config, Framer, Figma)\n- Comprehensive health and dental coverage',
            'required_skills': ['Figma', 'Design Systems', 'Prototyping', 'User Research', 'Accessibility (WCAG)'],
            'status': 'published',
            'deadline': date.today() + timedelta(days=60),
            'hiring_manager': admin_user,
            'hiring_manager_name': 'Chloe Zhao (Head of Product)',
            'created_by': admin_user,
        }
    )

    vac4, _ = Vacancy.objects.get_or_create(
        vacancy_code='VAC-SLS-004',
        defaults={
            'title': 'Enterprise Account Executive (Mid-Market & Tier 1)',
            'subsidiary': sub_fintech,
            'department': dept_sales,
            'department_name': 'Enterprise Sales',
            'job_type': 'full_time',
            'experience_level': 'senior',
            'required_education': "Bachelor's Degree in Business, Finance, or equivalent",
            'min_experience_years': 4,
            'openings_count': 3,
            'location': 'London, UK / Hybrid',
            'salary_min': Decimal('95000.00'),
            'salary_max': Decimal('140000.00'),
            'salary_currency': 'GBP',
            'description': 'Drive new enterprise logos across financial services and manufacturing verticals in Europe.',
            'responsibilities': '- Prospect and close high-ACV multi-year enterprise contracts ($80k - $250k ARR).\n- Partner with Solutions Architects to run live product demonstrations.\n- Manage sales pipeline progression rigorously through CRM and forecasting cadences.',
            'requirements': '- Proven track record of exceeding SaaS sales quota (120%+ attainment).\n- Experience selling ERP, CRM, or financial accounting software.\n- Consultative Challenger sales methodology.',
            'benefits': '- Uncapped commission structure with accelerator bonuses\n- Private UK medical insurance with Vitality wellness points\n- Railcard commute subsidy',
            'required_skills': ['Enterprise SaaS Sales', 'Contract Negotiation', 'Executive Presentations', 'CRM Pipeline'],
            'status': 'published',
            'deadline': date.today() + timedelta(days=35),
            'hiring_manager': admin_user,
            'hiring_manager_name': 'Robert Taylor (VP Sales EMEA)',
            'created_by': admin_user,
        }
    )

    vac5, _ = Vacancy.objects.get_or_create(
        vacancy_code='VAC-LOG-005',
        defaults={
            'title': 'Supply Chain Inventory & Procurement Planner',
            'subsidiary': sub_logistics,
            'department': dept_ops,
            'department_name': 'Operations & Supply Chain',
            'job_type': 'full_time',
            'experience_level': 'mid',
            'required_education': "Degree in Supply Chain Management or Industrial Engineering",
            'min_experience_years': 3,
            'openings_count': 2,
            'location': 'Chicago, IL',
            'salary_min': Decimal('85000.00'),
            'salary_max': Decimal('115000.00'),
            'salary_currency': 'USD',
            'description': 'Optimize safety stock levels, vendor purchase order cycles, and distribution center replenishment algorithms.',
            'responsibilities': '- Forecast SKU velocity and set dynamic reorder points.\n- Collaborate with vendors on lead-time compliance and volume discounts.\n- Run weekly cycle counts and warehouse reconciliation reports.',
            'requirements': '- 3+ years managing multi-warehouse distribution inventory.\n- Proficiency in ERP inventory modules and advanced Excel/SQL modeling.',
            'benefits': '- Comprehensive healthcare, 401(k) matching, transit passes',
            'required_skills': ['Inventory Forecasting', 'Purchase Orders', 'WMS Logistics', 'SQL'],
            'status': 'published',
            'deadline': date.today() + timedelta(days=25),
            'hiring_manager': admin_user,
            'hiring_manager_name': 'Vikram Patel (Logistics Director)',
            'created_by': admin_user,
        }
    )

    # 5. Screening Questions for vac1
    q1, _ = VacancyQuestion.objects.get_or_create(
        vacancy=vac1,
        order=1,
        defaults={
            'question_text': 'How many years of commercial experience do you have with Django and React in production?',
            'question_type': 'multiple_choice',
            'options': ['1-2 years', '3-5 years', '5-8 years', '8+ years'],
            'is_required': True,
        }
    )

    q2, _ = VacancyQuestion.objects.get_or_create(
        vacancy=vac1,
        order=2,
        defaults={
            'question_text': 'Briefly describe the most complex database optimization or caching challenge you resolved in Django/PostgreSQL.',
            'question_type': 'paragraph',
            'options': [],
            'is_required': True,
        }
    )

    q3, _ = VacancyQuestion.objects.get_or_create(
        vacancy=vac1,
        order=3,
        defaults={
            'question_text': 'Are you authorized to work in the United States without current or future sponsorship requirements?',
            'question_type': 'boolean',
            'options': ['Yes', 'No'],
            'is_required': True,
        }
    )

    # 6. Reusable Applicant Profiles
    cand1, _ = ApplicantProfile.objects.get_or_create(
        email='marcus.vance@example.com',
        defaults={
            'first_name': 'Marcus',
            'last_name': 'Vance',
            'phone': '+1 (415) 890-2134',
            'address': '540 Howard St, San Francisco, CA 94105',
            'headline': 'Senior Full-Stack & Distributed Systems Architect',
            'bio_summary': 'Passionate engineer with 7+ years of experience scaling Django, DRF, Next.js, and event-driven architectures. Led core platform teams delivering 99.99% reliability across microservices handling millions of daily requests.',
            'resume_url': 'https://storage.auraerp.com/resumes/marcus_vance_cv_2026.pdf',
            'resume_file_name': 'marcus_vance_cv_2026.pdf',
            'linkedin_url': 'https://linkedin.com/in/marcus-vance-dev',
            'github_url': 'https://github.com/marcusvance',
            'portfolio_url': 'https://marcusvance.tech',
        }
    )

    Education.objects.get_or_create(
        profile=cand1,
        institution='University of California, Berkeley',
        degree='Bachelor of Science (B.S.)',
        defaults={
            'field_of_study': 'Computer Science & Engineering',
            'start_year': 2015,
            'end_year': 2019,
            'grade_gpa': '3.89 / 4.0',
            'activities': 'President of Web Development Club, ACM Chapter Member',
        }
    )

    WorkExperience.objects.get_or_create(
        profile=cand1,
        company='Stripe Financial Infrastructure',
        position='Senior Software Engineer',
        defaults={
            'location': 'San Francisco, CA',
            'start_date': date(2021, 6, 1),
            'end_date': None,
            'is_current': True,
            'description': 'Designed and implemented high-throughput billing webhooks and developer portal SDKs. Reduced API response latency by 34% via multi-level Redis caching and query batching.',
        }
    )

    WorkExperience.objects.get_or_create(
        profile=cand1,
        company='Datadog Cloud Monitoring',
        position='Full-Stack Engineer',
        defaults={
            'location': 'San Francisco, CA',
            'start_date': date(2019, 7, 1),
            'end_date': date(2021, 5, 30),
            'is_current': False,
            'description': 'Built interactive telemetry visualization dashboards in React and TypeScript. Managed ingestion pipelines processing 200k metrics/sec.',
        }
    )

    for s_name, prof, yrs in [('Python', 'expert', 7.5), ('Django / DRF', 'expert', 7.0), ('Next.js / React', 'advanced', 5.5), ('TypeScript', 'advanced', 5.0), ('PostgreSQL', 'expert', 6.5), ('Docker & K8s', 'intermediate', 4.0)]:
        ApplicantSkill.objects.get_or_create(
            profile=cand1,
            skill_name=s_name,
            defaults={'proficiency': prof, 'years_of_experience': Decimal(str(yrs))}
        )

    cand2, _ = ApplicantProfile.objects.get_or_create(
        email='elena.rostova@example.com',
        defaults={
            'first_name': 'Elena',
            'last_name': 'Rostova',
            'phone': '+1 (206) 555-0199',
            'address': '2200 Westlake Ave, Seattle, WA 98121',
            'headline': 'Lead Site Reliability Engineer & Kubernetes Specialist',
            'bio_summary': '9+ years of SRE leadership in multi-cloud environments. Specialized in automated disaster recovery, zero-trust service meshes, and infrastructure-as-code.',
            'resume_url': 'https://storage.auraerp.com/resumes/elena_rostova_resume.pdf',
            'resume_file_name': 'elena_rostova_resume.pdf',
            'linkedin_url': 'https://linkedin.com/in/elena-rostova-sre',
            'github_url': 'https://github.com/erostova',
        }
    )

    Education.objects.get_or_create(
        profile=cand2,
        institution='Massachusetts Institute of Technology (MIT)',
        degree='Master of Science (M.S.)',
        defaults={
            'field_of_study': 'Distributed Systems & Network Security',
            'start_year': 2013,
            'end_year': 2015,
            'grade_gpa': '4.0 / 4.0',
        }
    )

    WorkExperience.objects.get_or_create(
        profile=cand2,
        company='Amazon Web Services (AWS)',
        position='Principal Systems Architect',
        defaults={
            'location': 'Seattle, WA',
            'start_date': date(2018, 4, 1),
            'end_date': None,
            'is_current': True,
            'description': 'Supervised global control plane availability for Amazon EKS clusters across 16 commercial regions.',
        }
    )

    for s_name, prof, yrs in [('Kubernetes', 'expert', 8.0), ('AWS Architecture', 'expert', 9.0), ('Terraform', 'expert', 7.0), ('Go', 'advanced', 5.0), ('Python', 'advanced', 6.0)]:
        ApplicantSkill.objects.get_or_create(
            profile=cand2,
            skill_name=s_name,
            defaults={'proficiency': prof, 'years_of_experience': Decimal(str(yrs))}
        )

    cand3, _ = ApplicantProfile.objects.get_or_create(
        email='david.kim@example.com',
        defaults={
            'first_name': 'David',
            'last_name': 'Kim',
            'phone': '+1 (917) 442-9981',
            'address': '72 Spring St, New York, NY 10012',
            'headline': 'Principal Product Designer & Design System Author',
            'bio_summary': 'Product designer specializing in enterprise ergonomics and accessible design token infrastructure. Contributor to major open-source UI libraries.',
            'resume_url': 'https://storage.auraerp.com/resumes/david_kim_portfolio_cv.pdf',
            'resume_file_name': 'david_kim_portfolio_cv.pdf',
            'portfolio_url': 'https://davidkim.design',
        }
    )

    Education.objects.get_or_create(
        profile=cand3,
        institution='Rhode Island School of Design (RISD)',
        degree='Bachelor of Fine Arts (B.F.A.)',
        defaults={
            'field_of_study': 'Graphic & Interaction Design',
            'start_year': 2014,
            'end_year': 2018,
            'grade_gpa': '3.92 / 4.0',
        }
    )

    WorkExperience.objects.get_or_create(
        profile=cand3,
        company='Figma Design Inc.',
        position='Senior Product Designer',
        defaults={
            'location': 'New York, NY',
            'start_date': date(2020, 2, 1),
            'end_date': None,
            'is_current': True,
            'description': 'Designed core variable and component property workflows used by millions of digital product designers.',
        }
    )

    for s_name, prof, yrs in [('Figma', 'expert', 8.0), ('Design Systems', 'expert', 6.5), ('Prototyping', 'expert', 7.0), ('Tailwind CSS', 'advanced', 4.0)]:
        ApplicantSkill.objects.get_or_create(
            profile=cand3,
            skill_name=s_name,
            defaults={'proficiency': prof, 'years_of_experience': Decimal(str(yrs))}
        )

    cand4, _ = ApplicantProfile.objects.get_or_create(
        email='sarah.jenkins@example.com',
        defaults={
            'first_name': 'Sarah',
            'last_name': 'Jenkins',
            'phone': '+44 20 7946 0912',
            'address': '14 Bishopgate, London EC2N 4AQ',
            'headline': 'Enterprise SaaS Account Executive | 145% Quota Attainment',
            'bio_summary': 'Top performing sales executive with deep background in closing complex mid-market ERP and fintech solutions across the UK and DACH regions.',
            'resume_url': 'https://storage.auraerp.com/resumes/sarah_jenkins_sales_cv.pdf',
            'resume_file_name': 'sarah_jenkins_sales_cv.pdf',
        }
    )

    cand5, _ = ApplicantProfile.objects.get_or_create(
        email='liam.oconnor@example.com',
        defaults={
            'first_name': 'Liam',
            'last_name': "O'Connor",
            'phone': '+1 (617) 902-8877',
            'address': '45 Beacon St, Boston, MA 02108',
            'headline': 'Full-Stack Software Engineer (Python / Next.js)',
            'bio_summary': '4 years building responsive web platforms with Django backend and modern React frontend. Enthusiastic about clean code, test coverage, and documentation.',
            'resume_url': 'https://storage.auraerp.com/resumes/liam_oconnor_cv.pdf',
            'resume_file_name': 'liam_oconnor_cv.pdf',
        }
    )

    # 7. Job Applications
    # Marcus Vance -> Lead Full-Stack Architect (Interview Stage)
    app1, _ = JobApplication.objects.get_or_create(
        application_number='APP-2026-00101',
        defaults={
            'vacancy': vac1,
            'applicant': cand1,
            'cover_letter': 'Dear Aura Hiring Team,\n\nI have followed Aura ERP’s rapid rise in the enterprise market with deep excitement. Having spent over 7 years scaling Django and Next.js platforms at Stripe and Datadog, I am eager to help lead your architecture team. My background in building multi-tenant databases and microservice resiliency aligns directly with the mission of this role.\n\nLooking forward to speaking with the team!\n\nBest regards,\nMarcus Vance',
            'resume_url': cand1.resume_url,
            'is_draft': False,
            'stage': 'interview',
            'recruiter_rating': 5,
            'submitted_at': timezone.now() - timedelta(days=6),
        }
    )

    ApplicationAnswer.objects.get_or_create(
        application=app1,
        question=q1,
        defaults={'answer_text': '5-8 years'}
    )
    ApplicationAnswer.objects.get_or_create(
        application=app1,
        question=q2,
        defaults={'answer_text': 'At Stripe, we resolved a severe database lock bottleneck during high-volume end-of-month reconciliations. By partitioning the journal line tables, introducing asynchronous worker queues with Celery, and deploying read replicas with strict read-only queries, we reduced transaction lock contention from 4.2 seconds to under 80 milliseconds.'}
    )
    ApplicationAnswer.objects.get_or_create(
        application=app1,
        question=q3,
        defaults={'answer_text': 'Yes'}
    )

    # Elena Rostova -> SRE (Shortlisted Stage)
    app2, _ = JobApplication.objects.get_or_create(
        application_number='APP-2026-00102',
        defaults={
            'vacancy': vac2,
            'applicant': cand2,
            'cover_letter': 'Hello Marcus and Aura team,\n\nI would love to apply for the Senior Cloud Infrastructure & SRE position. Over 9 years of designing multi-region Kubernetes clusters for AWS, I have developed strict automation and observability standards that eliminate production surprises. Aura’s commitment to self-hosted reliability is truly inspiring.\n\nWarm regards,\nElena Rostova',
            'resume_url': cand2.resume_url,
            'is_draft': False,
            'stage': 'shortlisted',
            'recruiter_rating': 5,
            'submitted_at': timezone.now() - timedelta(days=4),
        }
    )

    # David Kim -> Principal Product Designer (Selected / Offer Extended Stage)
    app3, _ = JobApplication.objects.get_or_create(
        application_number='APP-2026-00103',
        defaults={
            'vacancy': vac3,
            'applicant': cand3,
            'cover_letter': 'Dear Chloe and the Aura Product squad,\n\nEnterprise software doesn’t have to feel clunky or dated. At Figma, I obsessed over high-density UX that gives power users the speed and clarity they need to thrive. Aura ERP’s unified interface is a fantastic foundation, and I would be thrilled to establish the next generation of our design tokens and component standards.\n\nBest,\nDavid Kim',
            'resume_url': cand3.resume_url,
            'is_draft': False,
            'stage': 'selected',
            'recruiter_rating': 5,
            'submitted_at': timezone.now() - timedelta(days=12),
        }
    )

    # Sarah Jenkins -> Enterprise Account Executive (Under Review Stage)
    app4, _ = JobApplication.objects.get_or_create(
        application_number='APP-2026-00104',
        defaults={
            'vacancy': vac4,
            'applicant': cand4,
            'cover_letter': 'Dear Robert,\n\nI am thrilled to submit my candidacy for the Enterprise Account Executive position in London. I have consistently exceeded my SaaS revenue targets across Europe by taking an advisory, ROI-focused approach with tier-1 enterprise decision makers.\n\nSincerely,\nSarah Jenkins',
            'resume_url': cand4.resume_url,
            'is_draft': False,
            'stage': 'under_review',
            'recruiter_rating': 4,
            'submitted_at': timezone.now() - timedelta(days=2),
        }
    )

    # Liam O'Connor -> Lead Full-Stack Architect (Application Received / Submitted)
    app5, _ = JobApplication.objects.get_or_create(
        application_number='APP-2026-00105',
        defaults={
            'vacancy': vac1,
            'applicant': cand5,
            'cover_letter': 'Hi Team,\n\nI am applying for the Full-Stack Developer position. I have 4 years of solid Django and React development and love writing clean, maintainable systems code.\n\nThanks,\nLiam O\'Connor',
            'resume_url': cand5.resume_url,
            'is_draft': False,
            'stage': 'submitted',
            'recruiter_rating': 3,
            'submitted_at': timezone.now() - timedelta(days=1),
        }
    )

    # 8. Interviews & Evaluations
    # Interview 1 for Marcus Vance (Technical Round - Scheduled)
    int1, _ = Interview.objects.get_or_create(
        application=app1,
        title='Round 2: Architecture & Scalability Assessment',
        defaults={
            'round_type': 'technical',
            'interview_type': 'video',
            'scheduled_date': date.today() + timedelta(days=1),
            'scheduled_time': time(14, 0),
            'duration_minutes': 60,
            'location_or_url': 'https://meet.google.com/aur-arch-vanc',
            'panelist_names': 'Elena Rostova (VP Eng), Chloe Zhao (Product Lead)',
            'status': 'scheduled',
            'meeting_notes': 'Focus on database partitioning, concurrency handles, and Next.js server components state synchronization.',
        }
    )

    # Interview 2 for David Kim (Completed Round with Evaluation)
    int2, _ = Interview.objects.get_or_create(
        application=app3,
        title='Round 3: Executive Design Review & Portfolio Deep Dive',
        defaults={
            'round_type': 'executive',
            'interview_type': 'video',
            'scheduled_date': date.today() - timedelta(days=3),
            'scheduled_time': time(16, 0),
            'duration_minutes': 60,
            'location_or_url': 'https://meet.google.com/aur-dsgn-kim',
            'panelist_names': 'Elena Chen (HR Director), Marcus Vance (Lead Architect)',
            'status': 'completed',
            'meeting_notes': 'Candidate presented incredible work on Figma token systems. Strong alignment on enterprise speed and design accessibility.',
        }
    )

    InterviewEvaluation.objects.get_or_create(
        interview=int2,
        evaluator=admin_user,
        defaults={
            'evaluator_name': 'Elena Chen (HR & Executive Talent Director)',
            'technical_score': 5,
            'communication_score': 5,
            'problem_solving_score': 5,
            'cultural_fit_score': 5,
            'overall_score': 5,
            'recommendation': 'strong_hire',
            'feedback_notes': 'Outstanding candidate. David showed an unmatched command over complex design token systems and enterprise design ergonomics. He demonstrated clear empathy for software engineers who consume design tokens and spoke passionately about WCAG accessibility compliance. Unanimous Strong Hire recommendation.',
        }
    )

    # 9. Recruiter Notes
    RecruitmentNote.objects.get_or_create(
        application=app1,
        note_text='Screened Marcus via phone. Excellent communication, clearly very senior in both Python and modern React. Salary expectation ($185k base + equity) is well within our budget band. Proceeded to Round 2 Architecture interview immediately.',
        defaults={'author': admin_user, 'author_name': 'Sara Chen (Senior Recruiter)', 'is_confidential': False}
    )

    RecruitmentNote.objects.get_or_create(
        application=app3,
        note_text='Background and reference checks completed with former VP at Figma with glowing remarks. Formal offer letter prepared and dispatched for $180,000 base + 0.45% equity grant.',
        defaults={'author': admin_user, 'author_name': 'Sara Chen (Senior Recruiter)', 'is_confidential': True}
    )

    print("✅ Recruitment Management System successfully seeded with realistic enterprise data!")


if __name__ == '__main__':
    seed_recruitment()
