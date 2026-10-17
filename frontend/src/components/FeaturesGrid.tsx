'use client';

import React from 'react';
import {
  Code2,
  Layers3,
  Boxes,
  BarChart3,
  MapPin,
  Workflow,
  Languages,
  ShieldAlert,
} from 'lucide-react';

const features = [
  {
    title: 'Customizable',
    description: 'Full open-source code access under MIT license to shape models and workflows your way.',
    icon: Code2,
  },
  {
    title: 'Modular Architecture',
    description: 'Enable only the modules your business actually needs to keep runtime lean and responsive.',
    icon: Layers3,
  },
  {
    title: 'Inventory Tracking',
    description: 'Track stock balances, lots, serial numbers, and inter-warehouse moves in real time.',
    icon: Boxes,
  },
  {
    title: 'Dynamic Reporting',
    description: 'Generate interactive financial statements, sales reports, and exportable charts in one click.',
    icon: BarChart3,
  },
  {
    title: 'Multi-Location Support',
    description: 'Handle all distribution centers, branches, and regional offices from one unified console.',
    icon: MapPin,
  },
  {
    title: 'Automated Workflows',
    description: 'Automate repetitive tasks like order approvals, invoice reminders, and stock reordering.',
    icon: Workflow,
  },
  {
    title: 'Multi-Language & Currency',
    description: 'Localized tax templates, multiple foreign currencies, and multilingual user profiles.',
    icon: Languages,
  },
  {
    title: 'Role-Based Access Control',
    description: 'Granular permissions, team roles, and comprehensive immutable audit log tracking.',
    icon: ShieldAlert,
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-3 border border-indigo-200/60 dark:border-indigo-800/60">
            <span>Core Architectural Blocks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Aura ERP Features
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Aura ERP features advanced solutions for invoicing, inventory, sales, HR, and project management. Its intuitive interface and customizable architecture enhance efficiency and support real-time operational growth.
          </p>
        </div>

        {/* 8 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-lg hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-200 flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
