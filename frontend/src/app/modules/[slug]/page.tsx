'use client';

import React, { use, useContext } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  FolderKanban,
  Boxes,
  TrendingUp,
  Users,
  ShoppingBag,
  Briefcase,
  Store,
  Factory,
  Package,
  CalendarClock,
  Receipt,
  Calculator,
  Globe,
  FileText,
  BookUser,
  ShieldCheck,
  PlayCircle,
  Download,
  Server,
  Layers,
} from 'lucide-react';
import { CartContext } from '@/components/AppShell';

interface Props {
  params: Promise<{ slug: string }>;
}

const moduleDetails: Record<string, any> = {
  'project-management': {
    title: 'Project Management System (PMS)',
    category: 'Operations',
    icon: FolderKanban,
    tagline: 'Plan projects, break them into tasks and track progress with stages and milestones.',
    description: 'Aura PMS provides an enterprise-ready workspace where engineering, product, and client delivery teams coordinate seamlessly. From high-level milestone roadmaps to detailed daily timesheet accounting, everything is synchronized directly with customer contracts and billing.',
    features: [
      'Interactive Kanban boards with customizable stage columns and WIP limits',
      'Milestone & Release Roadmap tracker with phase criteria and deliverables',
      'Task estimation vs actual hours logged with timesheet approvals',
      'Comprehensive Bug & Issue tracker with severity classification and reproduction steps',
      'Task assignment notifications, priority tagging, and checklist sub-items',
      'Exportable project velocity charts and team resource utilization',
    ],
    architecture: {
      djangoModels: ['Project', 'Milestone', 'Task', 'TaskChecklist', 'Timesheet', 'Issue'],
      endpoints: ['/api/projects/projects/', '/api/projects/tasks/', '/api/projects/milestones/', '/api/projects/timesheets/', '/api/projects/issues/'],
      databaseTables: ['projects_project', 'projects_milestone', 'projects_task', 'projects_timesheet', 'projects_issue'],
    },
    launchPortalUrl: '/projects',
    launchConsoleUrl: '/app/projects',
    launchPortalLabel: 'Launch Project Workstation',
    launchConsoleLabel: 'Open Project Console',
  },
  'inventory-management': {
    title: 'Inventory & Warehouse Management',
    category: 'Supply Chain',
    icon: Boxes,
    tagline: 'Stay on top of your stock levels with real-time multi-warehouse operations.',
    description: 'Track stock balances, lots, serial numbers, multi-warehouse transfers, and automated safety stock reorder levels. Fully integrated with procurement purchase orders and sales dispatch.',
    features: [
      'Multi-warehouse and multi-bin location management across 4 global facilities',
      'Automated minimum stock alerts and automated purchase order generation',
      'Inter-warehouse transfer execution with instant source/destination reconciliation',
      'Cycle count audits, inventory adjustment vouchers, and scrap reconciliation',
      'Real-time valuation based on FIFO, LIFO, or Weighted Average Costing',
      'Barcode and QR code mobile scanning support for warehouse operators',
    ],
    architecture: {
      djangoModels: ['Warehouse', 'BinLocation', 'StockItem', 'StockMovement'],
      endpoints: ['/api/inventory/warehouses/', '/api/inventory/stock/', '/api/inventory/movements/', '/api/inventory/stats/'],
      databaseTables: ['inventory_warehouse', 'inventory_binlocation', 'inventory_stockitem', 'inventory_stockmovement'],
    },
    launchPortalUrl: '/inventory',
    launchConsoleUrl: '/app/inventory',
    launchPortalLabel: 'Launch Multi-Warehouse Hub',
    launchConsoleLabel: 'Open WMS Console',
  },
  'sales-management': {
    title: 'Sales & Quoting Engine',
    category: 'Revenue',
    icon: TrendingUp,
    tagline: 'Send quotations, confirm orders, manage products and prices, and invoice customers.',
    description: 'Accelerate your deal velocity with a pipeline that turns leads into paying accounts. Generate branded PDF quotes, enforce margin approval rules, and trigger automated dispatch and invoice creation upon customer sign-off.',
    features: [
      'Visual quotation builder with line items, tax rules, and volume discounts',
      'One-click conversion from confirmed Quotation to Sales Order and Invoice',
      'Customer-specific price lists and tiered wholesale pricing rules',
      'Sales rep commission tracking and regional revenue quota reporting',
      'Digital signature capture and online quote acceptance link',
      'Automated payment gateway reconciliation (Stripe, Bank Wire, Cards)',
    ],
    architecture: {
      djangoModels: ['Order', 'OrderItem', 'Invoice', 'Coupon', 'Quotation'],
      endpoints: ['/api/sales/orders/', '/api/sales/invoices/', '/api/sales/cart/'],
      databaseTables: ['sales_order', 'sales_orderitem', 'sales_invoice'],
    },
    launchPortalUrl: '/sales',
    launchConsoleUrl: '/app/sales',
    launchPortalLabel: 'Launch Sales & Invoicing Hub',
    launchConsoleLabel: 'Open Sales Console',
  },
  'employee-management': {
    title: 'Employee & Payroll Management System (HRMS)',
    category: 'Human Resources',
    icon: Users,
    tagline: 'Staff directory, real-time punch clock attendance, leave quota management, automated salary payroll batching, and performance appraisals.',
    description: 'An enterprise-grade Human Resource Management and Online Payroll System (HRMS) built for Aura ERP. Centralizes organizational hierarchy, department designations, digital employee 360 profiles, live attendance clocking, time-off leave balances, monthly automated payroll batch execution with itemized allowances and statutory tax deductions, printable digital payslips, and 360 performance reviews.',
    features: [
      '360 Personnel Records: Complete staff directory with designations, salary grades, reporting managers, and emergency contacts',
      'Live Punch Clock & Attendance Tracking: Daily clock-in/out registers with late minute calculation and working hours tally',
      'Time-Off & Leave Quota Management: Multi-type leave balance accounts (Annual, Sick, Casual) with 1-click HR approval workflow',
      'Automated Monthly Batch Payroll: 1-click batch calculation with allowances (housing 20%, medical 10%, transport) and deductions (tax 15%, provident fund 8%, health insurance)',
      'Printable Digital Payslips: Branded salary vouchers with itemized earnings, deductions, and payment status tracking',
      '360 Performance Appraisals: Multi-metric evaluation rubrics (technical, communication, punctuality, leadership) and promotion tracking',
      'Dual-Experience Architecture: HR Management Administration Console and Employee Self-Service (ESS) Portal',
    ],
    architecture: {
      djangoModels: ['Department', 'Designation', 'Employee', 'AttendanceRecord', 'TimeOffRequest', 'LeaveBalance', 'PayrollEntry', 'PerformanceReview'],
      endpoints: ['/api/hr/employees/', '/api/hr/attendance/', '/api/hr/time-off/', '/api/hr/payroll/', '/api/hr/reviews/', '/api/hr/stats/'],
      databaseTables: ['hr_department', 'hr_designation', 'hr_employee', 'hr_attendancerecord', 'hr_timeoffrequest', 'hr_leavebalance', 'hr_payrollentry', 'hr_performancereview'],
    },
    launchPortalUrl: '/employees',
    launchConsoleUrl: '/app/hr',
    launchPortalLabel: 'Launch Employee Self-Service (ESS)',
    launchConsoleLabel: 'Open HR Administration Console',
  },
  'purchase-order': {
    title: 'Purchase Order & Procurement',
    category: 'Supply Chain',
    icon: ShoppingBag,
    tagline: 'Simplify and track your purchases with our robust Purchase Order system.',
    description: 'Modernize supplier procurement with automated Requests for Quotation (RFQs), multi-currency vendor price books, receipt verification, and automated 3-way matching before invoice settlement.',
    features: [
      'Vendor management directory with performance ratings and terms',
      'Automated RFQ generation dispatched to multiple approved vendors',
      'Multi-level purchase order sign-off approval workflows based on budget thresholds',
      '3-way matching between Purchase Order, Goods Receipt Note (GRN), and Vendor Bill',
      'Automated landed cost calculation including customs, freight, and insurance',
      'Recurring blanket purchase orders for raw materials and cloud services',
    ],
    architecture: {
      djangoModels: ['PurchaseOrder', 'PurchaseOrderItem'],
      endpoints: ['/api/procurement/orders/', '/api/procurement/items/', '/api/procurement/stats/'],
      databaseTables: ['procurement_purchaseorder', 'procurement_purchaseorderitem'],
    },
    launchPortalUrl: '/procurement',
    launchConsoleUrl: '/app/procurement',
    launchPortalLabel: 'Launch Procurement Hub',
    launchConsoleLabel: 'Open Procurement Console',
  },
  'manufacturing-management': {
    title: 'Manufacturing & MRP Engine',
    category: 'Operations',
    icon: Factory,
    tagline: 'Plan production, manage BoMs, and track work orders on the shop floor.',
    description: 'Engineered for discrete and process manufacturing. Define multi-level Bills of Materials (BOM), schedule work centers, issue manufacturing orders, and record labor durations with shop floor tablet terminals.',
    features: [
      'Multi-level BOMs with phantom items, scrap factors, and component alternatives',
      'Work center capacity planning, maintenance downtime schedules, and OEE tracking',
      'Shop floor tablet execution terminal with barcode operator badge logins',
      'Work order step routing with labor timers and quality check inspections',
      'Automated raw material reservations and finished goods stock receipts',
      'Real-time manufacturing cost variance analysis (standard vs actual cost)',
    ],
    architecture: {
      djangoModels: ['BillOfMaterials', 'BOMItem', 'ProductionOrder', 'WorkCenter'],
      endpoints: ['/api/manufacturing/boms/', '/api/manufacturing/orders/', '/api/manufacturing/stats/'],
      databaseTables: ['manufacturing_billofmaterials', 'manufacturing_bomitem', 'manufacturing_productionorder'],
    },
    launchPortalUrl: '/manufacturing',
    launchConsoleUrl: '/app/manufacturing',
    launchPortalLabel: 'Launch Manufacturing Terminal',
    launchConsoleLabel: 'Open Shop Floor MRP',
  },
  'point-of-sale': {
    title: 'Point of Sale (POS)',
    category: 'Retail',
    icon: Store,
    tagline: 'Run registers and retail floors, take orders and accept payments with offline sync.',
    description: 'Blazing fast touch cashier register designed for physical stores, showrooms, and warehouse counters. Scans barcodes, handles split tenders, prints receipts, and maintains local indexedDB resilience during network drops.',
    features: [
      'Touchscreen-optimized cashier register with quick product keys',
      'Universal USB & Bluetooth barcode scanner and scale hardware integration',
      'Split payment support (Cash, Card, Gift Voucher, Customer Account)',
      'Instant branded 80mm digital printable receipt generation',
      'Shift opening and closing cash float drawer reconciliation reports',
      'Automatic inventory deduction and stock movement sync on checkout',
    ],
    architecture: {
      djangoModels: ['POSRegister', 'POSTransaction', 'StockItem', 'StockMovement'],
      endpoints: ['/api/sales/pos/', '/api/sales/pos-registers/', '/api/sales/pos-stats/'],
      databaseTables: ['sales_posregister', 'sales_postransaction'],
    },
    launchPortalUrl: '/pos',
    launchConsoleUrl: '/app/pos',
    launchPortalLabel: 'Launch Touch POS Terminal',
    launchConsoleLabel: 'Open POS Sales Console',
  },
  'contact-management': {
    title: 'Contact Management & CRM',
    category: 'Revenue',
    icon: BookUser,
    tagline: 'Effortlessly manage and organize your contacts with our intuitive system.',
    description: 'Gain a complete 360-degree perspective on every customer, vendor, partner, and prospect. Track interaction history, open support tickets, sales quotations, and contracts all in one place.',
    features: [
      'Customer 360 view aggregating orders, invoices, support, and projects',
      'Visual drag-and-drop lead and opportunity pipeline stage board',
      'Activity logging for phone calls, meetings, notes, and emails',
      'Company domain enrichment and automated social profile lookups',
      'Custom tags, segments, and filtered mailing list exports',
      'REST API and webhook triggers on contact lifecycle stage updates',
    ],
    architecture: {
      djangoModels: ['Contact', 'Lead', 'Activity', 'RecruitmentApplicant'],
      endpoints: ['/api/crm/contacts/', '/api/crm/leads/', '/api/crm/activities/', '/api/crm/stats/'],
      databaseTables: ['crm_contact', 'crm_lead', 'crm_activity'],
    },
    launchPortalUrl: '/crm',
    launchConsoleUrl: '/app/contacts',
    launchPortalLabel: 'Launch CRM Pipeline Hub',
    launchConsoleLabel: 'Open Contact Directory',
  },
  'maintenance-management': {
    title: 'Computerized Maintenance (CMMS)',
    category: 'Operations',
    icon: Factory,
    tagline: 'Track plant equipment, preventive maintenance schedules, and breakdown work orders.',
    description: 'Ensure maximum plant operational uptime and asset reliability. Log equipment breakdowns, dispatch maintenance technicians, schedule calibration cycles, and verify ISO audit compliance.',
    features: [
      'Comprehensive plant machinery and equipment asset registry with serial tags',
      'Breakdown work order ticketing with priority matrix (Critical to Low)',
      'Technician assignment and live work order status tracking',
      'Preventive maintenance schedules with recurring inspection windows',
      'Spare parts hold and resolution verification workflows',
      'Mean Time Between Failures (MTBF) and operational availability reporting',
    ],
    architecture: {
      djangoModels: ['Equipment', 'MaintenanceRequest'],
      endpoints: ['/api/maintenance/equipment/', '/api/maintenance/requests/', '/api/maintenance/stats/'],
      databaseTables: ['maintenance_equipment', 'maintenance_maintenancerequest'],
    },
    launchPortalUrl: '/maintenance',
    launchConsoleUrl: '/app/maintenance',
    launchPortalLabel: 'Launch CMMS Workstation',
    launchConsoleLabel: 'Open Maintenance Console',
  },
  'invoice-management': {
    title: 'Invoicing & Recurring Billing',
    category: 'Revenue',
    icon: Receipt,
    tagline: 'Generate branded PDF tax invoices, track payments, and reconcile accounts receivable.',
    description: 'Automate customer billing with localized tax rates, payment status tracking, and 1-click printable PDF generation.',
    features: [
      'Instant branded printable PDF invoice generation with window.print()',
      'Automated line item tax calculations and multi-currency billing',
      'Accounts receivable aging and overdue invoice tracking',
      '1-click payment reconciliation with bank wire, card, and check tenders',
    ],
    architecture: {
      djangoModels: ['Invoice', 'Order', 'Quotation'],
      endpoints: ['/api/sales/invoices-manage/', '/api/sales/stats/'],
      databaseTables: ['sales_invoice'],
    },
    launchPortalUrl: '/sales/invoices',
    launchConsoleUrl: '/app/sales',
    launchPortalLabel: 'Launch Digital Billing Hub',
    launchConsoleLabel: 'Open Invoices Console',
  },
  'recruitment-management': {
    title: 'Recruitment & Applicant Tracking (ATS)',
    category: 'Human Resources',
    icon: Briefcase,
    tagline: 'Multi-entity vacancy management, reusable applicant profiles, screening questions, and interview scorecards.',
    description: 'A full-stack recruitment management system built to simplify the process of creating vacancies, receiving applications, screening candidates, managing interviews, and tracking recruitment progress across a company and its subsidiaries.',
    features: [
      'Multi-subsidiary vacancy governance across legal entities and departments',
      'Universal reusable applicant profile (Education, Experience, Skills, CV attachments)',
      'Vacancy-specific custom screening questions (Single line, Paragraph, Yes/No, Multi-choice)',
      'Candidate draft saving and real-time application status tracker',
      'Visual recruitment pipeline Kanban board across stages',
      'Interview scheduler with Google Meet links and panelist assignment',
      'Structured 1-5 star rubric evaluation scorecard with hire/reject recommendations',
      'Internal recruiter notes and confidential activity logging',
    ],
    architecture: {
      djangoModels: ['Subsidiary', 'Vacancy', 'VacancyQuestion', 'ApplicantProfile', 'JobApplication', 'Interview', 'InterviewEvaluation', 'RecruitmentNote'],
      endpoints: ['/api/recruitment/vacancies/', '/api/recruitment/applications/', '/api/recruitment/interviews/', '/api/recruitment/profiles/'],
      databaseTables: ['recruitment_subsidiary', 'recruitment_vacancy', 'recruitment_jobapplication', 'recruitment_interview'],
    },
    launchPortalUrl: '/recruitment',
    launchConsoleUrl: '/app/recruitment',
  },
};

function ModuleDetailContent({ params }: Props) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { openContact } = useContext(CartContext);

  const mod = moduleDetails[slug] || {
    title: slug.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    category: 'Enterprise Module',
    icon: Layers,
    tagline: 'Enterprise module engineered for modular scalability in Aura ERP.',
    description: 'This module is fully integrated with the core Aura ERP data model, providing specialized automation, audit logs, and RESTful API endpoints.',
    features: [
      'Modular plug-and-play installation via Django backend',
      'Complete role-based access control and audit tracking',
      'Exportable data reports and real-time dashboard widgets',
      'Full REST API coverage with OpenAPI documentation',
    ],
    architecture: {
      djangoModels: ['CoreModel', 'ItemRecord', 'TransactionEntry'],
      endpoints: [`/api/${slug}/items/`, `/api/${slug}/records/`],
      databaseTables: [`${slug.replace(/-/g, '_')}_record`],
    },
  };

  const Icon = mod.icon;

  return (
    <div className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950/80 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/modules"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All 15 Modules</span>
        </Link>

        {/* Hero Banner for Module */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                {mod.category}
              </span>
              <span className="text-xs text-slate-400">• Open Source MIT</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Icon className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {mod.title}
              </h1>
            </div>

            <p className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
              {mod.tagline}
            </p>

            <p className="mt-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {mod.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {mod.launchPortalUrl ? (
                <>
                  <Link
                    href={mod.launchPortalUrl}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30 hover:-translate-y-0.5 transition-all"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{mod.launchPortalLabel || 'Launch Candidate Career Portal'}</span>
                  </Link>
                  <Link
                    href={mod.launchConsoleUrl}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 rounded-xl transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{mod.launchConsoleLabel || 'Open HR Recruiter Console'}</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Test in Live Interactive Demo</span>
                </Link>
              )}
              <button
                onClick={openContact}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <span>Request Customization</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature List & Architectural Specifications */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Capabilities Checklist */}
          <div className="lg:col-span-2 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Enterprise Capabilities & Workflows
            </h2>

            <div className="space-y-4">
              {mod.features.map((feat: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right 1 Col: Backend Technical Specifications */}
          <div className="space-y-6">
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Server className="w-5 h-5" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Django Backend Architecture
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">ORM Models</span>
                  <div className="flex flex-wrap gap-1.5">
                    {mod.architecture.djangoModels.map((m: string, idx: number) => (
                      <code key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-indigo-600 dark:text-indigo-400 text-[11px]">
                        {m}
                      </code>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">REST API Endpoints</span>
                  <div className="space-y-1">
                    {mod.architecture.endpoints.map((ep: string, idx: number) => (
                      <code key={idx} className="block px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                        {ep}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Role-Based Access Control (RBAC) Enabled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick deployment callout */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-900 to-slate-900 text-white shadow-lg space-y-3 text-xs">
              <h4 className="font-bold text-sm text-indigo-200">Deploy this Module to Cloud</h4>
              <p className="text-slate-300 leading-relaxed">
                Start on our managed cloud tier with automated Postgres provisioning and daily backups.
              </p>
              <Link
                href="/pricing"
                className="inline-block w-full py-2.5 text-center font-bold text-slate-900 bg-white rounded-xl hover:bg-slate-100 transition-colors"
              >
                View Cloud Pricing
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function ModuleDetailPage(props: Props) {
  return (
    <React.Suspense fallback={<div className="py-24 text-center text-xs text-slate-400">Loading module...</div>}>
      <ModuleDetailContent {...props} />
    </React.Suspense>
  );
}
