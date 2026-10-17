'use client';

import React from 'react';
import { LineChart, Zap, Globe2, Building2, TrendingUp, CheckCircle } from 'lucide-react';

export default function ResultsBento() {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 mb-3 border border-emerald-200/60 dark:border-emerald-800/60">
            <span>High Performance Engineering</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Crafted for Efficiency and Results
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            The ultimate Open Source ERP Software built with modern Python Django backend and Next.js reactive frontend to optimize your business operations and eliminate friction.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Bento Card 1: Real Time Data Insights */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-indigo-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Real Time Data Insights
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Make smart, confident choices with up-to-the-second metrics on sales pipelines, purchase orders, warehouse stock movements, and employee time utilization.
              </p>
            </div>

            {/* Interactive Mock Data Visualizer */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>Revenue Growth (Q3-Q4)</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" /> +34.8%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div className="h-full bg-indigo-600 w-3/4 rounded-full" />
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
                <span>Target: $1.2M</span>
                <span>Current: $980k</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: End to End Business Automation */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-indigo-500/40 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                End to End Business Automation
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Automate your entire process across cross-functional departments — from procurement and inventory receipt to sales, recurring invoices, and general ledger reconciliation.
              </p>
            </div>

            {/* Visual Workflow Steps */}
            <div className="mt-6 space-y-2">
              {[
                'Automated 3-Way Purchase Order Matching',
                'Instant Reorder Alert on Min Threshold',
                'One-Click Quotation to Invoice Conversion',
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bento Card 3: Flexibility for Localization */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-indigo-500/40 transition-colors md:col-span-2 lg:col-span-1">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Flexibility for Localization
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                With built-in flexibility for localization, Aura ERP adapts effortlessly to regional tax laws, multi-currency transactions, timezones, and multilingual interface options.
              </p>
            </div>

            {/* Language & Currency badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              {['USD ($)', 'EUR (€)', 'GBP (£)', 'JPY (¥)', 'English', 'Español', 'Français', 'Deutsch'].map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Bento Card 4: Centralized Multi-Company Management (Full Width) */}
          <div className="md:col-span-2 lg:col-span-3 p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-300 border border-white/10 mb-4">
                <Building2 className="w-3.5 h-3.5" />
                <span>Multi-Tenant & Multi-Branch Architecture</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Centralized Console for Multi-Company Management
              </h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Operate different entities, legal subsidiaries, regional fulfillment branches, or brands from one consolidated administrative console. Switch between organizations seamlessly while retaining unified roll-up financial statements.
              </p>
            </div>

            <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row gap-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[140px]">
                <div className="text-3xl font-extrabold text-indigo-400">99.99%</div>
                <div className="text-xs text-slate-300 mt-1">Uptime Availability</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[140px]">
                <div className="text-3xl font-extrabold text-emerald-400">&lt;50ms</div>
                <div className="text-xs text-slate-300 mt-1">API Query Latency</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center min-w-[140px]">
                <div className="text-3xl font-extrabold text-purple-400">100%</div>
                <div className="text-xs text-slate-300 mt-1">Open Source MIT</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
