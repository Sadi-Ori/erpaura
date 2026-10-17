'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  BookUser,
  ShoppingBag,
  Users,
  Boxes,
  Briefcase,
  TrendingUp,
  Package,
  CalendarClock,
  Globe,
  Receipt,
  Calculator,
  FileText,
  Factory,
  Store,
  ArrowRight,
  Search,
} from 'lucide-react';

const allModules = [
  {
    title: 'Project Management System (PMS)',
    slug: 'project-management',
    category: 'Operations',
    icon: FolderKanban,
    color: 'from-blue-500 to-indigo-600',
    description: 'Plan projects, break them into tasks and track progress with stages, milestones, and real-time team workload balancing.',
    features: ['Interactive Kanban Board', 'Gantt Chart Dependencies', 'Milestone Tracking', 'Worker Timesheet Logging'],
  },
  {
    title: 'Inventory & Warehouse Management',
    slug: 'inventory-management',
    category: 'Supply Chain',
    icon: Boxes,
    color: 'from-amber-500 to-orange-600',
    description: 'Track stock balances, lots, serial numbers, multi-warehouse transfers, and automated safety stock reorder levels.',
    features: ['Multi-Warehouse Bins', 'Serial & Batch Tracking', 'Automated Reorder Alerts', 'Physical Inventory Audits'],
  },
  {
    title: 'Sales & Quoting Engine',
    slug: 'sales-management',
    category: 'Revenue',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-600',
    description: 'Send quotations, confirm sales orders, manage customer tiers, discount rules, and automated recurring billing.',
    features: ['Quotation to Order in 1-Click', 'Tiered Customer Pricing', 'Digital PDF Invoicing', 'Revenue Forecasting'],
  },
  {
    title: 'Employee & HR Management',
    slug: 'employee-management',
    category: 'Human Resources',
    icon: Users,
    color: 'from-cyan-500 to-blue-600',
    description: 'Oversee employee directory, departmental structure, contracts, compensation history, and digital personnel files.',
    features: ['Personnel Records Directory', 'Department Hierarchy Tree', 'Role & Skill Matrices', 'Self-Service Employee Portal'],
  },
  {
    title: 'Purchase Order System',
    slug: 'purchase-order',
    category: 'Supply Chain',
    icon: ShoppingBag,
    color: 'from-rose-500 to-pink-600',
    description: 'Streamline procurement, send Requests for Quotation (RFQs), receive vendor shipments, and execute 3-way matching.',
    features: ['Vendor Scorecards', 'RFQ Automated Bidding', '3-Way Invoice Matching', 'Approval Hierarchies'],
  },
  {
    title: 'Recruitment & Applicant Tracking (ATS)',
    slug: 'recruitment-management',
    category: 'Human Resources',
    icon: Briefcase,
    color: 'from-purple-500 to-indigo-600',
    description: 'Publish job openings, organize candidate resumes, schedule panel interviews, and extend competitive employment offers.',
    features: ['Visual Candidate Pipeline', 'Scorecard Ratings', 'Resume Parsing', 'Offer Letter Generator'],
  },
  {
    title: 'Point of Sale (POS)',
    slug: 'point-of-sale',
    category: 'Retail',
    icon: Store,
    color: 'from-orange-500 to-amber-600',
    description: 'Lightning-fast touch cashier terminal with offline register mode, barcode scanning, and multi-tender split checkout.',
    features: ['Touchscreen Cashier UI', 'Barcode Scanner Support', 'Split Cash & Card Tenders', 'Offline Local Resilience'],
  },
  {
    title: 'Manufacturing & MRP Engine',
    slug: 'manufacturing-management',
    category: 'Operations',
    icon: Factory,
    color: 'from-indigo-600 to-purple-700',
    description: 'Multi-level Bills of Materials (BOMs), work centers, routing steps, scrap rates, and shop floor operator timers.',
    features: ['Multi-Level BOM Architecture', 'Work Center Capacity', 'Shop Floor Tablet Mode', 'Production Cost Variance'],
  },
  {
    title: 'Product Catalog System',
    slug: 'product-management',
    category: 'Operations',
    icon: Package,
    color: 'from-violet-500 to-indigo-600',
    description: 'Manage SKU variants, barcodes, digital packages, and automated price rules.',
    features: ['Variant Attributes Matrix', 'Universal Barcode System', 'Digital Asset Downloads', 'Bulk CSV Data Import'],
  },
  {
    title: 'Time Off & Leave Management',
    slug: 'time-off-management',
    category: 'Human Resources',
    icon: CalendarClock,
    color: 'from-teal-500 to-emerald-600',
    description: 'Track vacation requests, sick time, parental leave, holiday calendars, and multi-tier manager approvals.',
    features: ['PTO Balance Calculation', 'Manager Approval Queue', 'Statutory Holiday Calendar', 'Calendar Subscription Sync'],
  },
  {
    title: 'Invoice & Recurring Billing',
    slug: 'invoice-management',
    category: 'Revenue',
    icon: Receipt,
    color: 'from-red-500 to-rose-600',
    description: 'Automate subscription billing, issue localized tax invoices, manage debit/credit notes, and accept payment gateways.',
    features: ['Automated Recurring Invoices', 'Payment Gateway Integration', 'Multi-Currency Tax Rules', 'Dunning Email Sequences'],
  },
  {
    title: 'Accounting & General Ledger',
    slug: 'accounting-management',
    category: 'Finance',
    icon: Calculator,
    color: 'from-emerald-600 to-teal-700',
    description: 'Chart of accounts, double-entry journal vouchers, trial balance, profit & loss, and balance sheet roll-ups.',
    features: ['Double-Entry Ledger', 'Multi-Currency Revaluation', 'Fiscal Year Closures', 'Automated Bank Feeds'],
  },
  {
    title: 'Website Management & Visual CMS',
    slug: 'website-management',
    category: 'Content',
    icon: Globe,
    color: 'from-blue-600 to-indigo-700',
    description: 'Design, edit, and publish modern customer portals, landing pages, and lead capture forms with visual controls.',
    features: ['Visual Section Builder', 'SEO Meta Management', 'Media Asset Library', 'Custom Domain Routing'],
  },
  {
    title: 'Blog & Technical Documentation',
    slug: 'blog-management',
    category: 'Content',
    icon: FileText,
    color: 'from-amber-500 to-yellow-600',
    description: 'Author and distribute technical tutorials, enterprise updates, case studies, and corporate announcements.',
    features: ['Markdown & WYSIWYG Editor', 'Category & Tag Taxonomy', 'Author Profiles', 'Newsletter Syndication'],
  },
  {
    title: 'Contact Management & CRM',
    slug: 'contact-management',
    category: 'Revenue',
    icon: BookUser,
    color: 'from-indigo-500 to-purple-600',
    description: 'Organize customers, suppliers, strategic partners, and lead records with full communication history.',
    features: ['Customer 360 View', 'Activity Timeline Logging', 'Opportunity Pipeline', 'Vendor Contract Files'],
  },
];

export default function ModulesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Operations', 'Supply Chain', 'Revenue', 'Human Resources', 'Finance', 'Retail', 'Content'];

  const filtered = allModules.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || m.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-950/80 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-3 border border-indigo-200/60 dark:border-indigo-800/60">
            <span>Modular Enterprise Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Aura ERP Modules Catalog
          </h1>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Every department in your enterprise powered by a unified data model. Install and enable only the modules you need for your business workflows.
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search modules by name or functionality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-sm text-slate-900 dark:text-white"
            />
          </div>

          {/* Category Tabs */}
          <div className="mt-6 flex flex-wrap justify-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={`/modules/${item.slug}`}
                className="group p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-5 space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    {item.features.map((feat, fIdx) => (
                      <div key={fIdx} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore Architecture & Specs</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
