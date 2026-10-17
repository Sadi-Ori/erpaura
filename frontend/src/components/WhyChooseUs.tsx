'use client';

import React from 'react';
import { Smile, Sliders, ShieldCheck, Headphones } from 'lucide-react';

const reasons = [
  {
    title: 'User Friendliness',
    description: 'An intuitive, clean responsive design engineered to make enterprise workflows simple and reduce onboarding time.',
    icon: Smile,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60',
  },
  {
    title: 'Deep Customization',
    description: '100% open source framework allowing tailored business logic, custom models, and modular extensions without lock-in.',
    icon: Sliders,
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60',
  },
  {
    title: 'Security & Compliance',
    description: 'Cryptographic data encryption, role-based access control, automated backups, and alignment with ISO 27001 & SOC 2.',
    icon: ShieldCheck,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
  },
  {
    title: '24/7 Dedicated Support',
    description: 'Our global team of core maintainers and enterprise engineers is standing by to resolve challenges and ensure uptime.',
    icon: Headphones,
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/60',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 mb-3 border border-emerald-200/60 dark:border-emerald-800/60">
            <span>Enterprise Advantage</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Why Choose Aura ERP?
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Aura ERP is recognized as a modern Open Source ERP platform for providing top-notch, flexible, and reliable solutions that meet diverse business requirements across the globe.
          </p>
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-500/50 transition-all flex flex-col items-center text-center group"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-5 shadow-xs group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
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
