import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aura_erp.settings')
django.setup()

from apps.projects.models import Project, Milestone, Task, TaskChecklist, TaskComment, Timesheet, Issue
from apps.crm.models import Contact

def seed_projects():
    print("Seeding Project Management System (PMS) data...")

    client_contact = Contact.objects.filter(contact_type='customer').first() or Contact.objects.first()

    projects_data = [
        {
            'code': 'PRJ-AURA-01',
            'title': 'Aura Cloud ERP Enterprise Migration',
            'category': 'infrastructure',
            'manager_name': 'Alexander Reed',
            'team_size': 8,
            'description': 'End-to-end migration of legacy ERP instances to multi-tenant cloud Kubernetes clusters with automated Postgres failover and zero-downtime cutover.',
            'status': 'active',
            'health_status': 'on_track',
            'progress_percentage': 68,
            'start_date': date(2026, 8, 1),
            'due_date': date(2026, 12, 15),
            'budget': Decimal('180000.00'),
            'spent': Decimal('122400.00'),
        },
        {
            'code': 'PRJ-AURA-02',
            'title': 'NextGen POS Touch Terminal & Scanner Integration',
            'category': 'software',
            'manager_name': 'Marcus Vance',
            'team_size': 6,
            'description': 'High-speed retail point-of-sale checkout client supporting barcode hardware scanners, thermal receipt printers, and offline cash reconciliation.',
            'status': 'active',
            'health_status': 'on_track',
            'progress_percentage': 52,
            'start_date': date(2026, 9, 10),
            'due_date': date(2026, 12, 30),
            'budget': Decimal('95000.00'),
            'spent': Decimal('49400.00'),
        },
        {
            'code': 'PRJ-AURA-03',
            'title': 'Fintech Payment Gateway & Bank Feed Reconciliation',
            'category': 'client_delivery',
            'manager_name': 'Elena Chen',
            'team_size': 5,
            'description': 'Automated Open Banking API synchronization, multi-currency ledger conversions, and ISO 20022 wire transfer protocol support.',
            'status': 'active',
            'health_status': 'at_risk',
            'progress_percentage': 35,
            'start_date': date(2026, 10, 1),
            'due_date': date(2027, 2, 28),
            'budget': Decimal('140000.00'),
            'spent': Decimal('58800.00'),
        },
        {
            'code': 'PRJ-AURA-04',
            'title': 'Warehouse Automated Bin Location & RFID Tracking',
            'category': 'internal_ops',
            'manager_name': 'Robert Taylor',
            'team_size': 7,
            'description': 'Real-time pallet location tracking across 4 logistics facilities using UHF RFID readers and dynamic picking path optimization.',
            'status': 'active',
            'health_status': 'on_track',
            'progress_percentage': 84,
            'start_date': date(2026, 7, 15),
            'due_date': date(2026, 11, 20),
            'budget': Decimal('220000.00'),
            'spent': Decimal('184800.00'),
        },
        {
            'code': 'PRJ-AURA-05',
            'title': 'Executive Analytics Dashboard (iOS & Android)',
            'category': 'product_design',
            'manager_name': 'David Kim',
            'team_size': 4,
            'description': 'Mobile companion application for C-suite executives providing real-time cash flow KPIs, inventory safety margins, and team velocity meters.',
            'status': 'planning',
            'health_status': 'on_track',
            'progress_percentage': 15,
            'start_date': date(2026, 11, 1),
            'due_date': date(2027, 3, 31),
            'budget': Decimal('75000.00'),
            'spent': Decimal('11250.00'),
        },
    ]

    for pdata in projects_data:
        code = pdata.pop('code')
        proj, created = Project.objects.update_or_create(
            code=code,
            defaults={**pdata, 'client': client_contact}
        )
        print(f"  Project: {proj.code} - {proj.title}")

        # Seed Milestones for Project 1 & 2
        if code == 'PRJ-AURA-01':
            m1, _ = Milestone.objects.get_or_create(
                project=proj,
                title='Phase 1: Architecture Blueprint & Cloud Topology',
                defaults={
                    'description': 'Finalized Terraform templates and multi-region failover specifications.',
                    'due_date': date(2026, 8, 30),
                    'status': 'completed',
                    'progress_percentage': 100,
                    'deliverables': 'Terraform manifests, VPC peering diagram, SOC2 compliance audit report.',
                }
            )
            m2, _ = Milestone.objects.get_or_create(
                project=proj,
                title='Phase 2: Database Re-platforming & Dual-Write Sync',
                defaults={
                    'description': 'Replicate production databases with Debezium CDC and verify write parity.',
                    'due_date': date(2026, 10, 15),
                    'status': 'completed',
                    'progress_percentage': 100,
                    'deliverables': 'Debezium pipeline, Postgres 16 cluster, lag monitoring Prometheus alerts.',
                }
            )
            m3, _ = Milestone.objects.get_or_create(
                project=proj,
                title='Phase 3: Production DNS Cutover & Traffic Migration',
                defaults={
                    'description': 'Gradual canary traffic cutover via Envoy mesh and 100% cloud switchover.',
                    'due_date': date(2026, 12, 10),
                    'status': 'in_progress',
                    'progress_percentage': 45,
                    'deliverables': 'Route53 weighted routing, rollback automation runbook, zero-data-loss validation.',
                }
            )

            # Seed Tasks across Kanban stages
            tasks_data = [
                {
                    'title': 'Provision multi-region Kubernetes clusters in us-east-1 and eu-central-1',
                    'status': 'done',
                    'priority': 'high',
                    'task_type': 'feature',
                    'assigned_to': 'Alexander Reed',
                    'estimated_hours': Decimal('32.0'),
                    'logged_hours': Decimal('34.5'),
                    'tags': 'DevOps, K8s, Terraform',
                    'due_date': date(2026, 8, 25),
                    'milestone': m1,
                },
                {
                    'title': 'Configure Debezium change data capture for zero-downtime DB sync',
                    'status': 'done',
                    'priority': 'urgent',
                    'task_type': 'feature',
                    'assigned_to': 'Elena Rostova',
                    'estimated_hours': Decimal('40.0'),
                    'logged_hours': Decimal('38.0'),
                    'tags': 'Database, Kafka, CDC',
                    'due_date': date(2026, 9, 28),
                    'milestone': m2,
                },
                {
                    'title': 'Execute automated stress testing with 50,000 simulated concurrent users',
                    'status': 'review',
                    'priority': 'high',
                    'task_type': 'improvement',
                    'assigned_to': 'Marcus Vance',
                    'estimated_hours': Decimal('24.0'),
                    'logged_hours': Decimal('22.0'),
                    'tags': 'QA, Locust, Performance',
                    'due_date': date(2026, 11, 10),
                    'milestone': m3,
                },
                {
                    'title': 'Implement automated Envoy edge proxy circuit breakers and rate limiters',
                    'status': 'in_progress',
                    'priority': 'medium',
                    'task_type': 'feature',
                    'assigned_to': 'Alexander Reed',
                    'estimated_hours': Decimal('20.0'),
                    'logged_hours': Decimal('14.0'),
                    'tags': 'Envoy, Security, Networking',
                    'due_date': date(2026, 11, 18),
                    'milestone': m3,
                },
                {
                    'title': 'Resolve latency spike in European Redis replica cluster during cache warmup',
                    'status': 'in_progress',
                    'priority': 'urgent',
                    'task_type': 'bug',
                    'assigned_to': 'Elena Rostova',
                    'estimated_hours': Decimal('16.0'),
                    'logged_hours': Decimal('9.5'),
                    'tags': 'Redis, Latency, Bug',
                    'due_date': date(2026, 11, 12),
                    'milestone': m3,
                },
                {
                    'title': 'Finalize customer communication runbook and cutover maintenance window',
                    'status': 'todo',
                    'priority': 'low',
                    'task_type': 'task',
                    'assigned_to': 'Chloe Zhao',
                    'estimated_hours': Decimal('12.0'),
                    'logged_hours': Decimal('0.0'),
                    'tags': 'Docs, Operations',
                    'due_date': date(2026, 11, 30),
                    'milestone': m3,
                },
            ]

            for tdata in tasks_data:
                task, _ = Task.objects.get_or_create(
                    project=proj,
                    title=tdata['title'],
                    defaults={**tdata, 'description': f"Execution details for {tdata['title']}"}
                )

                # Add checklist items
                TaskChecklist.objects.get_or_create(task=task, title='Technical design review approved', defaults={'is_completed': True, 'order': 1})
                TaskChecklist.objects.get_or_create(task=task, title='Automated integration test suites passing', defaults={'is_completed': tdata['status'] in ['done', 'review'], 'order': 2})
                TaskChecklist.objects.get_or_create(task=task, title='Security vulnerability scan (SAST/DAST) cleared', defaults={'is_completed': tdata['status'] == 'done', 'order': 3})

                # Add sample timesheet
                if tdata['logged_hours'] > 0:
                    Timesheet.objects.get_or_create(
                        task=task,
                        worker_name=tdata['assigned_to'],
                        work_date=date(2026, 11, 3),
                        defaults={
                            'hours': Decimal('8.0'),
                            'hourly_rate': Decimal('95.00'),
                            'total_cost': Decimal('760.00'),
                            'is_billable': True,
                            'approval_status': 'approved',
                            'approved_by': 'Project Director',
                            'notes': f"Sprint work session on {task.title[:30]}",
                        }
                    )

            # Seed Issues for Project 1
            Issue.objects.get_or_create(
                project=proj,
                title='Redis replica memory fragmentation exceeds 1.8 ratio during nightly dump',
                defaults={
                    'severity': 'critical',
                    'status': 'investigating',
                    'reported_by': 'Elena Rostova',
                    'assigned_to': 'Alexander Reed',
                    'steps_to_reproduce': '1. Trigger bgrewriteaof on replica pod.\n2. Observe RSS memory climb to 14GB.\n3. Kubernetes OOM killer triggers restart.',
                    'resolution_notes': 'Tuning jemalloc dirty page purging thresholds.',
                }
            )
            Issue.objects.get_or_create(
                project=proj,
                title='VPC Peering DNS resolution timeout on legacy Frankfurt subnet',
                defaults={
                    'severity': 'major',
                    'status': 'open',
                    'reported_by': 'Robert Taylor',
                    'assigned_to': 'Alexander Reed',
                    'steps_to_reproduce': 'Query backend-db.internal from private subnet 10.12.4.0/24.',
                    'resolution_notes': '',
                }
            )

        # Tasks for POS Project 2
        elif code == 'PRJ-AURA-02':
            pos_m1, _ = Milestone.objects.get_or_create(
                project=proj,
                title='Milestone 1: Barcode Scanner Engine & Hardware SDK',
                defaults={
                    'description': 'HID keyboard wedge and WebUSB scanner driver integration.',
                    'due_date': date(2026, 10, 20),
                    'status': 'completed',
                    'progress_percentage': 100,
                    'deliverables': 'WebUSB connector, Zebra 2D scanner profile, test bench harness.',
                }
            )
            pos_m2, _ = Milestone.objects.get_or_create(
                project=proj,
                title='Milestone 2: Offline Cash Register & Split Tender Engine',
                defaults={
                    'description': 'IndexedDB transaction queue with automated online sync when reconnecting.',
                    'due_date': date(2026, 12, 1),
                    'status': 'in_progress',
                    'progress_percentage': 60,
                    'deliverables': 'ServiceWorker offline cache, conflict resolution engine, split payment modal.',
                }
            )

            Task.objects.get_or_create(
                project=proj,
                title='Develop fast touch-friendly product tile grid with category pill filters',
                defaults={
                    'milestone': pos_m1,
                    'status': 'done',
                    'priority': 'high',
                    'task_type': 'feature',
                    'assigned_to': 'David Kim',
                    'estimated_hours': Decimal('24.0'),
                    'logged_hours': Decimal('25.0'),
                    'tags': 'Frontend, UX, React',
                    'due_date': date(2026, 10, 15),
                }
            )
            Task.objects.get_or_create(
                project=proj,
                title='Build multi-tender checkout modal supporting Cash, Card, and Digital QR Wallets',
                defaults={
                    'milestone': pos_m2,
                    'status': 'testing',
                    'priority': 'urgent',
                    'task_type': 'feature',
                    'assigned_to': 'Marcus Vance',
                    'estimated_hours': Decimal('28.0'),
                    'logged_hours': Decimal('26.5'),
                    'tags': 'Payments, POS, UI',
                    'due_date': date(2026, 11, 8),
                }
            )
            Task.objects.get_or_create(
                project=proj,
                title='Implement ESC/POS thermal receipt formatting with digital receipt reprint',
                defaults={
                    'milestone': pos_m2,
                    'status': 'in_progress',
                    'priority': 'medium',
                    'task_type': 'feature',
                    'assigned_to': 'Chloe Zhao',
                    'estimated_hours': Decimal('16.0'),
                    'logged_hours': Decimal('8.0'),
                    'tags': 'Printer, Hardware',
                    'due_date': date(2026, 11, 20),
                }
            )
            Task.objects.get_or_create(
                project=proj,
                title='Daily register drawer opening float and shift reconciliation report',
                defaults={
                    'milestone': pos_m2,
                    'status': 'todo',
                    'priority': 'high',
                    'task_type': 'feature',
                    'assigned_to': 'Marcus Vance',
                    'estimated_hours': Decimal('20.0'),
                    'logged_hours': Decimal('0.0'),
                    'tags': 'Finance, Shift, Audit',
                    'due_date': date(2026, 12, 5),
                }
            )

    print("Project Management System (PMS) seed complete!")

if __name__ == '__main__':
    seed_projects()
