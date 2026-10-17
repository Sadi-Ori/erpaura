'use client';

import React from 'react';
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
} from 'lucide-react';

const applications = [
  {
    title: 'PMS (Project Management)',
    slug: 'project-management',
    icon: FolderKanban,
    color: 'from-blue-500 to-indigo-600',
    description: 'Streamline projects, milestones, sprints, and task dependencies with ease.',
  },
  {
    title: 'Contacts Management',
    slug: 'contact-management',
    icon: BookUser,
    color: 'from-indigo-500 to-purple-600',
    description: 'Effortlessly organize customers, suppliers, strategic partners, and lead records.',
  },
  {
    title: 'Purchase Order System',
    slug: 'purchase-order',
    icon: ShoppingBag,
    color: 'from-emerald-500 to-teal-600',
    description: 'Simplify procurement workflows, vendor RFQs, delivery notes, and 3-way matching.',
  },
  {
    title: 'Employee Management',
    slug: 'employee-management',
    icon: Users,
    color: 'from-cyan-500 to-blue-600',
    description: 'Manage workforce details, department hierarchies, contracts, and reviews.',
  },
  {
    title: 'Inventory & Stock Tracking',
    slug: 'inventory-management',
    icon: Boxes,
    color: 'from-amber-500 to-orange-600',
    description: 'Stay on top of stock movements across multiple warehouses with reorder alerts.',
  },
  {
    title: 'Recruitment & ATS',
    slug: 'recruitment-management',
    icon: Briefcase,
    color: 'from-pink-500 to-rose-600',
    description: 'Applicant tracking, interview scoring, and automated candidate hiring pipelines.',
  },
  {
    title: 'Sales & Quoting Engine',
    slug: 'sales-management',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-600',
    description: 'Send quotations, confirm orders, manage price tiers, and invoice clients.',
  },
  {
    title: 'Product Catalog System',
    slug: 'product-management',
    icon: Package,
    color: 'from-violet-500 to-indigo-600',
    description: 'Manage SKU variants, barcodes, digital packages, and automated price rules.',
  },
  {
    title: 'Time Off Management',
    slug: 'time-off-management',
    icon: CalendarClock,
    color: 'from-teal-500 to-cyan-600',
    description: 'Track vacation leaves, holidays, sick time, and multi-tier manager approvals.',
  },
  {
    title: 'Website & Visual CMS',
    slug: 'website-management',
    icon: Globe,
    color: 'from-blue-600 to-indigo-700',
    description: 'Build, edit, and publish high-converting public customer-facing web pages.',
  },
  {
    title: 'Invoice & Billing System',
    slug: 'invoice-management',
    icon: Receipt,
    color: 'from-rose-500 to-red-600',
    description: 'Simplify automated recurring billing, tax compliance, and online payments.',
  },
  {
    title: 'Accounting & Ledger',
    slug: 'accounting-management',
    icon: Calculator,
    color: 'from-emerald-600 to-teal-700',
    description: 'Manage charts of accounts, journal vouchers, balance sheets, and tax reports.',
  },
  {
    title: 'Blog & Content Hub',
    slug: 'blog-management',
    icon: FileText,
    color: 'from-amber-500 to-yellow-600',
    description: 'Create, schedule, and distribute articles, technical documentation, and news.',
  },
  {
    title: 'Manufacturing & MRP',
    slug: 'manufacturing-management',
    icon: Factory,
    color: 'from-indigo-600 to-purple-700',
    description: 'Multi-level BOMs, work centers, routing steps, and shop floor tracking.',
  },
  {
    title: 'Point of Sale (POS)',
    slug: 'point-of-sale',
    icon: Store,
    color: 'from-orange-500 to-red-600',
    description: 'Fast cashier checkout, barcode scanning, split payments, and offline capability.',
  },
];

export default function ApplicationsGrid() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-3 border border-indigo-200/60 dark:border-indigo-800/60">
            <span>Modular Enterprise Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Aura ERP Applications
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Next-gen Open Source ERP software built to simplify business processes. Aura ERP offers specialized modules for inventory management, warehouse logistics, manufacturing, and PMS, ensuring real-time automation and maximum efficiency.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {applications.map((app, idx) => {
            const Icon = app.icon;
            return (
              <Link
                key={idx}
                href={`/modules/${app.slug}`}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-2xs hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-200"
              >
                <div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${app.color} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {app.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                  <span>Explore Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
