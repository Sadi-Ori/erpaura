'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Clock,
  Calendar,
  Receipt,
  Award,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function HRSubNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Directory & Org', href: '/app/hr', icon: Users },
    { name: 'Attendance Register', href: '/app/hr/attendance', icon: Clock },
    { name: 'Leave & Time-Off', href: '/app/hr/leave', icon: Calendar },
    { name: 'Payroll & Payslips', href: '/app/hr/payroll', icon: Receipt },
    { name: 'Performance Appraisals', href: '/app/hr/appraisals', icon: Award },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Switch to Employee Self-Service */}
      <div className="flex items-center gap-2">
        <Link
          href="/employees"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Employee Self-Service (ESS)</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}
