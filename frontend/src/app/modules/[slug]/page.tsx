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
      'Gantt chart visualization with auto-adjusting milestone dependencies',
      'Task estimation vs actual hours logged with timesheet approvals',
      'Direct integration with Customer Contacts and Billing Invoices',
      'Task assignment notifications, priority tagging, and checklist sub-items',
      'Exportable project velocity charts and team resource utilization',
    ],
    architecture: {
      djangoModels: ['Project', 'Task', 'Timesheet', 'ProjectStage', 'Milestone'],
      endpoints: ['/api/projects/projects/', '/api/projects/tasks/', '/api/projects/timesheets/'],
      databaseTables: ['projects_project', 'projects_task', 'projects_timesheet'],
    },
  },
  'inventory-management': {
    title: 'Inventory & Warehouse Management',
    category: 'Supply Chain',
    icon: Boxes,
    tagline: 'Stay on top of your stock levels with real-time multi-warehouse operations.',
    description: 'Track stock balances, lots, serial numbers, multi-warehouse transfers, and automated safety stock reorder levels. Fully integrated with procurement purchase orders and sales dispatch.',
    features: [
      'Multi-warehouse and multi-bin location management',
      'Batch and serial number traceability from vendor receipt to customer delivery',
      'Automated minimum stock alerts and automated purchase order generation',
      'Cycle count audits, inventory adjustment vouchers, and scrap reconciliation',
      'Real-time valuation based on FIFO, LIFO, or Weighted Average Costing',
      'Barcode and QR code mobile scanning support for warehouse operators',
    ],
    architecture: {
      djangoModels: ['Warehouse', 'StockItem', 'StockMovement', 'BinLocation'],
      endpoints: ['/api/inventory/warehouses/', '/api/inventory/stock/', '/api/inventory/movements/'],
      databaseTables: ['inventory_warehouse', 'inventory_stockitem', 'inventory_stockmovement'],
    },
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
  },
  'employee-management': {
    title: 'Employee & HR Management',
    category: 'Human Resources',
    icon: Users,
    tagline: 'Manage and track employee details, contracts, department trees, and performance.',
    description: 'Centralize your workforce records in a secure, role-governed repository. Maintain employee contracts, emergency contacts, organizational hierarchy charts, salary history, and performance appraisal milestones.',
    features: [
      'Comprehensive digital personnel files with document attachment vaults',
      'Dynamic organizational hierarchy tree and reporting chain visualizer',
      'Department budget allocation and headcount planning tools',
      'Employee self-service portal for profile updates and time off requests',
      'Skill competency matrix and role certification tracking',
      'Granular role-based security ensuring sensitive payroll data isolation',
    ],
    architecture: {
      djangoModels: ['Department', 'Employee', 'TimeOffRequest', 'Contract'],
      endpoints: ['/api/hr/departments/', '/api/hr/employees/', '/api/hr/timeoffs/'],
      databaseTables: ['hr_department', 'hr_employee', 'hr_timeoffrequest'],
    },
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
      djangoModels: ['PurchaseOrder', 'PurchaseItem', 'VendorReceipt', 'VendorBill'],
      endpoints: ['/api/purchase/orders/', '/api/purchase/vendors/'],
      databaseTables: ['purchase_order', 'purchase_item'],
    },
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
      djangoModels: ['BillOfMaterial', 'WorkCenter', 'ManufacturingOrder', 'WorkOrder'],
      endpoints: ['/api/manufacturing/boms/', '/api/manufacturing/orders/'],
      databaseTables: ['mfg_bom', 'mfg_workcenter', 'mfg_manufacturingorder'],
    },
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
      'Offline local cache with automated background syncing when internet returns',
      'Shift opening and closing cash float drawer reconciliation reports',
      'Customer loyalty points earning and redemption at checkout',
    ],
    architecture: {
      djangoModels: ['PosSession', 'PosRegister', 'PosOrder', 'PosPayment'],
      endpoints: ['/api/pos/sessions/', '/api/pos/orders/'],
      databaseTables: ['pos_session', 'pos_order'],
    },
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
      djangoModels: ['Contact', 'Lead', 'Activity', 'Opportunity'],
      endpoints: ['/api/crm/contacts/', '/api/crm/leads/'],
      databaseTables: ['crm_contact', 'crm_lead'],
    },
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
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Test in Live Interactive Demo</span>
              </Link>
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
