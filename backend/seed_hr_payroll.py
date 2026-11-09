import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta, time, datetime
from django.utils import timezone

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aura_erp.settings')
django.setup()

from apps.hr.models import (
    Department,
    Designation,
    Employee,
    AttendanceRecord,
    TimeOffRequest,
    LeaveBalance,
    PayrollEntry,
    PerformanceReview,
)


def seed_hr_payroll():
    print("🚀 Seeding Employee & Payroll Management System...")

    # 1. Departments
    dept_eng, _ = Department.objects.get_or_create(
        code='ENG',
        defaults={
            'name': 'Engineering & DevOps',
            'manager_name': 'Marcus Vance',
            'budget': Decimal('1250000.00'),
            'location': 'Building A - Tech Hub (SF & Remote)',
        }
    )

    dept_prod, _ = Department.objects.get_or_create(
        code='PRD',
        defaults={
            'name': 'Product & Design',
            'manager_name': 'Chloe Zhao',
            'budget': Decimal('680000.00'),
            'location': 'Building A - Floor 4',
        }
    )

    dept_sales, _ = Department.objects.get_or_create(
        code='SLS',
        defaults={
            'name': 'Enterprise Sales & Revenue',
            'manager_name': 'Robert Taylor',
            'budget': Decimal('920000.00'),
            'location': 'London & New York Offices',
        }
    )

    dept_hr, _ = Department.objects.get_or_create(
        code='HR',
        defaults={
            'name': 'People Operations & Talent',
            'manager_name': 'Elena Chen',
            'budget': Decimal('450000.00'),
            'location': 'Building B - Executive Suites',
        }
    )

    dept_ops, _ = Department.objects.get_or_create(
        code='OPS',
        defaults={
            'name': 'Supply Chain & Logistics',
            'manager_name': 'Vikram Patel',
            'budget': Decimal('580000.00'),
            'location': 'Chicago Logistics Hub',
        }
    )

    dept_fin, _ = Department.objects.get_or_create(
        code='FIN',
        defaults={
            'name': 'Finance & Enterprise Treasury',
            'manager_name': 'Sophia Dupont',
            'budget': Decimal('520000.00'),
            'location': 'New York & Paris Branches',
        }
    )

    # 2. Designations (Job Roles)
    des_vp_eng, _ = Designation.objects.get_or_create(
        title='VP of Engineering & Architecture',
        defaults={'code': 'VPE-L6', 'department': dept_eng, 'salary_grade': 'Grade L6 - Executive Technical'}
    )
    des_sre_lead, _ = Designation.objects.get_or_create(
        title='Lead Site Reliability Engineer',
        defaults={'code': 'SRE-L5', 'department': dept_eng, 'salary_grade': 'Grade L5 - Staff Engineer'}
    )
    des_fullstack, _ = Designation.objects.get_or_create(
        title='Senior Full-Stack Engineer',
        defaults={'code': 'SWE-L4', 'department': dept_eng, 'salary_grade': 'Grade L4 - Senior Specialist'}
    )
    des_des_lead, _ = Designation.objects.get_or_create(
        title='Principal Product Designer',
        defaults={'code': 'UX-L5', 'department': dept_prod, 'salary_grade': 'Grade L5 - Lead Design'}
    )
    des_prod_head, _ = Designation.objects.get_or_create(
        title='Head of Enterprise Products',
        defaults={'code': 'PM-L6', 'department': dept_prod, 'salary_grade': 'Grade L6 - Executive Product'}
    )
    des_ae_lead, _ = Designation.objects.get_or_create(
        title='Enterprise Account Executive',
        defaults={'code': 'AE-L4', 'department': dept_sales, 'salary_grade': 'Grade L4 - Revenue'}
    )
    des_hr_dir, _ = Designation.objects.get_or_create(
        title='Director of People & Culture',
        defaults={'code': 'HR-L5', 'department': dept_hr, 'salary_grade': 'Grade L5 - HR Leadership'}
    )
    des_ops_dir, _ = Designation.objects.get_or_create(
        title='Director of Global Logistics',
        defaults={'code': 'OPS-L5', 'department': dept_ops, 'salary_grade': 'Grade L5 - Operations'}
    )
    des_fin_ctrl, _ = Designation.objects.get_or_create(
        title='Senior Financial Controller',
        defaults={'code': 'FIN-L4', 'department': dept_fin, 'salary_grade': 'Grade L4 - Finance'}
    )

    # 3. Employees
    employees_data = [
        {
            'employee_id': 'EMP-1001',
            'first_name': 'Marcus',
            'last_name': 'Vance',
            'email': 'marcus.vance@auraerp.com',
            'phone': '+1 (415) 890-2134',
            'department': dept_eng,
            'designation': des_vp_eng,
            'job_title': 'VP of Engineering & Architecture',
            'employment_type': 'full_time',
            'hire_date': date(2021, 6, 1),
            'status': 'active',
            'basic_salary': Decimal('14500.00'),
            'bank_name': 'JPMorgan Chase Bank',
            'bank_account_number': '**** **** **** 4819',
            'tax_id': 'US-SSN-9901',
            'blood_group': 'O+',
            'city': 'San Francisco, CA',
            'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            'manager_name': 'Chief Technology Officer',
        },
        {
            'employee_id': 'EMP-1002',
            'first_name': 'Elena',
            'last_name': 'Rostova',
            'email': 'elena.rostova@auraerp.com',
            'phone': '+1 (206) 555-0199',
            'department': dept_eng,
            'designation': des_sre_lead,
            'job_title': 'Lead Site Reliability Engineer',
            'employment_type': 'full_time',
            'hire_date': date(2022, 3, 15),
            'status': 'active',
            'basic_salary': Decimal('13200.00'),
            'bank_name': 'Silicon Valley Bank',
            'bank_account_number': '**** **** **** 9102',
            'tax_id': 'US-SSN-8812',
            'blood_group': 'A+',
            'city': 'Seattle, WA',
            'avatar_url': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
            'manager_name': 'Marcus Vance',
        },
        {
            'employee_id': 'EMP-1003',
            'first_name': 'David',
            'last_name': 'Kim',
            'email': 'david.kim@auraerp.com',
            'phone': '+1 (917) 442-9981',
            'department': dept_prod,
            'designation': des_des_lead,
            'job_title': 'Principal Product Designer',
            'employment_type': 'full_time',
            'hire_date': date(2022, 8, 1),
            'status': 'active',
            'basic_salary': Decimal('12800.00'),
            'bank_name': 'Citibank N.A.',
            'bank_account_number': '**** **** **** 3314',
            'tax_id': 'US-SSN-7731',
            'blood_group': 'B+',
            'city': 'New York, NY',
            'avatar_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            'manager_name': 'Chloe Zhao',
        },
        {
            'employee_id': 'EMP-1004',
            'first_name': 'Chloe',
            'last_name': 'Zhao',
            'email': 'chloe.zhao@auraerp.com',
            'phone': '+1 (415) 302-8811',
            'department': dept_prod,
            'designation': des_prod_head,
            'job_title': 'Head of Enterprise Products',
            'employment_type': 'full_time',
            'hire_date': date(2021, 2, 10),
            'status': 'active',
            'basic_salary': Decimal('14000.00'),
            'bank_name': 'Wells Fargo Bank',
            'bank_account_number': '**** **** **** 6201',
            'tax_id': 'US-SSN-4420',
            'blood_group': 'AB+',
            'city': 'San Francisco, CA',
            'avatar_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
            'manager_name': 'Chief Executive Officer',
        },
        {
            'employee_id': 'EMP-1005',
            'first_name': 'Robert',
            'last_name': 'Taylor',
            'email': 'robert.taylor@auraerp.com',
            'phone': '+44 20 7946 0912',
            'department': dept_sales,
            'designation': des_ae_lead,
            'job_title': 'VP of Enterprise Sales EMEA',
            'employment_type': 'full_time',
            'hire_date': date(2021, 9, 1),
            'status': 'active',
            'basic_salary': Decimal('11500.00'),
            'bank_name': 'HSBC UK plc',
            'bank_account_number': '**** **** **** 8820',
            'tax_id': 'UK-NINO-9912',
            'blood_group': 'O-',
            'city': 'London, UK',
            'avatar_url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
            'manager_name': 'Chief Commercial Officer',
        },
        {
            'employee_id': 'EMP-1006',
            'first_name': 'Sarah',
            'last_name': 'Jenkins',
            'email': 'sarah.jenkins@auraerp.com',
            'phone': '+44 20 7946 0884',
            'department': dept_sales,
            'designation': des_ae_lead,
            'job_title': 'Enterprise Account Executive',
            'employment_type': 'full_time',
            'hire_date': date(2023, 1, 15),
            'status': 'active',
            'basic_salary': Decimal('9200.00'),
            'bank_name': 'Barclays Bank',
            'bank_account_number': '**** **** **** 5192',
            'tax_id': 'UK-NINO-4410',
            'blood_group': 'A-',
            'city': 'London, UK',
            'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            'manager_name': 'Robert Taylor',
        },
        {
            'employee_id': 'EMP-1007',
            'first_name': 'Elena',
            'last_name': 'Chen',
            'email': 'elena.chen@auraerp.com',
            'phone': '+1 (415) 777-1029',
            'department': dept_hr,
            'designation': des_hr_dir,
            'job_title': 'Director of People & Culture',
            'employment_type': 'full_time',
            'hire_date': date(2021, 4, 1),
            'status': 'active',
            'basic_salary': Decimal('10500.00'),
            'bank_name': 'Bank of America',
            'bank_account_number': '**** **** **** 7719',
            'tax_id': 'US-SSN-3310',
            'blood_group': 'O+',
            'city': 'San Francisco, CA',
            'avatar_url': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
            'manager_name': 'Chief Executive Officer',
        },
        {
            'employee_id': 'EMP-1008',
            'first_name': 'Vikram',
            'last_name': 'Patel',
            'email': 'vikram.patel@auraerp.com',
            'phone': '+1 (312) 880-9921',
            'department': dept_ops,
            'designation': des_ops_dir,
            'job_title': 'Director of Global Logistics',
            'employment_type': 'full_time',
            'hire_date': date(2022, 5, 10),
            'status': 'active',
            'basic_salary': Decimal('9800.00'),
            'bank_name': 'JPMorgan Chase Bank',
            'bank_account_number': '**** **** **** 1092',
            'tax_id': 'US-SSN-5521',
            'blood_group': 'B-',
            'city': 'Chicago, IL',
            'avatar_url': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
            'manager_name': 'Chief Operating Officer',
        },
        {
            'employee_id': 'EMP-1009',
            'first_name': 'Sophia',
            'last_name': 'Dupont',
            'email': 'sophia.dupont@auraerp.com',
            'phone': '+33 1 42 68 55 00',
            'department': dept_fin,
            'designation': des_fin_ctrl,
            'job_title': 'Senior Financial Controller',
            'employment_type': 'full_time',
            'hire_date': date(2022, 11, 1),
            'status': 'active',
            'basic_salary': Decimal('11200.00'),
            'bank_name': 'BNP Paribas',
            'bank_account_number': '**** **** **** 8841',
            'tax_id': 'FR-FISC-2091',
            'blood_group': 'AB-',
            'city': 'Paris, France',
            'avatar_url': 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150',
            'manager_name': 'Chief Financial Officer',
        },
        {
            'employee_id': 'EMP-1010',
            'first_name': 'Liam',
            'last_name': "O'Connor",
            'email': 'liam.oconnor@auraerp.com',
            'phone': '+353 1 496 0123',
            'department': dept_eng,
            'designation': des_fullstack,
            'job_title': 'Senior Full-Stack Engineer',
            'employment_type': 'full_time',
            'hire_date': date(2023, 4, 1),
            'status': 'active',
            'basic_salary': Decimal('8500.00'),
            'bank_name': 'Allied Irish Banks',
            'bank_account_number': '**** **** **** 2291',
            'tax_id': 'IE-PPS-8821',
            'blood_group': 'O+',
            'city': 'Dublin, Ireland',
            'avatar_url': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
            'manager_name': 'Marcus Vance',
        },
    ]

    saved_employees = []
    for emp_dict in employees_data:
        emp, created = Employee.objects.update_or_create(
            email=emp_dict['email'],
            defaults=emp_dict
        )
        saved_employees.append(emp)

        # 4. Leave Balance
        LeaveBalance.objects.update_or_create(
            employee=emp,
            defaults={
                'year': 2026,
                'annual_quota': 22,
                'annual_used': 5 if emp.hire_date.year < 2023 else 2,
                'sick_quota': 10,
                'sick_used': 1,
                'casual_quota': 5,
                'casual_used': 0,
            }
        )

        # 5. Attendance Records for current week
        today = date.today()
        for day_offset in range(5):
            att_date = today - timedelta(days=day_offset)
            if att_date.weekday() < 5: # Monday - Friday
                clock_in_time = time(8, 55) if emp.employee_id != 'EMP-1006' else time(9, 25)
                clock_out_time = time(17, 30)
                is_late = clock_in_time.hour == 9 and clock_in_time.minute > 15
                AttendanceRecord.objects.update_or_create(
                    employee=emp,
                    date=att_date,
                    defaults={
                        'clock_in': clock_in_time,
                        'clock_out': clock_out_time,
                        'working_hours': Decimal('8.00'),
                        'status': 'late' if is_late else 'present',
                        'late_minutes': 25 if is_late else 0,
                        'notes': 'Recorded via Office Badge Keycard.' if not is_late else 'Delayed due to traffic transit.',
                    }
                )

        # 6. Performance Reviews
        PerformanceReview.objects.update_or_create(
            employee=emp,
            review_period='Q3 2026 Comprehensive Appraisal',
            defaults={
                'reviewer_name': emp.manager_name or 'Leadership Committee',
                'technical_rating': 5 if emp.department == dept_eng else 4,
                'communication_rating': 5 if emp.department == dept_sales else 4,
                'punctuality_rating': 5,
                'leadership_rating': 5 if 'VP' in emp.job_title or 'Director' in emp.job_title else 4,
                'overall_rating': 5 if 'VP' in emp.job_title or 'Head' in emp.job_title else 4,
                'strengths': f'{emp.first_name} demonstrated immense ownership across enterprise initiatives and cross-functional deliverables.',
                'growth_areas': 'Continue delegating architectural spikes to build depth across junior squad tiers.',
                'comments': 'Consistently exceeds key quarterly OKRs and serves as a cultural role model.',
                'promotion_recommendation': 'Recommended for Accelerated Executive Tier',
                'review_date': date(2026, 9, 30),
            }
        )

    # 7. Time-Off Requests
    TimeOffRequest.objects.get_or_create(
        employee=saved_employees[0], # Marcus
        start_date=date.today() + timedelta(days=12),
        end_date=date.today() + timedelta(days=15),
        defaults={
            'leave_type': 'paid',
            'days_requested': 4,
            'reason': 'Annual family vacation leave.',
            'status': 'pending',
            'manager_comment': '',
        }
    )

    TimeOffRequest.objects.get_or_create(
        employee=saved_employees[2], # David Kim
        start_date=date.today() + timedelta(days=5),
        end_date=date.today() + timedelta(days=6),
        defaults={
            'leave_type': 'casual',
            'days_requested': 2,
            'reason': 'Attending Design Tokens Config Conference.',
            'status': 'approved',
            'manager_comment': 'Approved - Conference attendance aligns with design system roadmap.',
        }
    )

    # 8. Monthly Payroll Runs (September Paid, October Processed)
    for emp in saved_employees:
        base = emp.basic_salary
        housing = round(base * Decimal('0.20'), 2)
        medical = round(base * Decimal('0.10'), 2)
        transport = Decimal('350.00')
        bonus = Decimal('600.00') if 'VP' in emp.job_title or 'Lead' in emp.job_title else Decimal('0.00')

        tax = round(base * Decimal('0.15'), 2)
        pf = round(base * Decimal('0.08'), 2)
        health = Decimal('180.00')

        gross = base + housing + medical + transport + bonus
        total_ded = tax + pf + health
        net = gross - total_ded

        # September (Paid & Disbursed)
        PayrollEntry.objects.update_or_create(
            employee=emp,
            month=9,
            year=2026,
            defaults={
                'period_label': 'September 2026',
                'basic_salary': base,
                'housing_allowance': housing,
                'medical_allowance': medical,
                'transport_allowance': transport,
                'bonus_allowance': bonus,
                'tax_deduction': tax,
                'provident_fund': pf,
                'health_insurance': health,
                'unpaid_leave_deduction': Decimal('0.00'),
                'gross_salary': gross,
                'total_deductions': total_ded,
                'net_salary': net,
                'status': 'paid',
                'payment_method': 'Direct Bank Wire (ACH/SWIFT)',
                'disbursed_at': timezone.now() - timedelta(days=32),
            }
        )

        # October (Processed / Ready for Disbursement)
        PayrollEntry.objects.update_or_create(
            employee=emp,
            month=10,
            year=2026,
            defaults={
                'period_label': 'October 2026',
                'basic_salary': base,
                'housing_allowance': housing,
                'medical_allowance': medical,
                'transport_allowance': transport,
                'bonus_allowance': bonus,
                'tax_deduction': tax,
                'provident_fund': pf,
                'health_insurance': health,
                'unpaid_leave_deduction': Decimal('0.00'),
                'gross_salary': gross,
                'total_deductions': total_ded,
                'net_salary': net,
                'status': 'processed',
                'payment_method': 'Direct Bank Wire (ACH/SWIFT)',
                'disbursed_at': None,
            }
        )

    print("✅ Employee & Payroll Management System seeded with 10 employees, attendances, payrolls, and reviews!")


if __name__ == '__main__':
    seed_hr_payroll()
