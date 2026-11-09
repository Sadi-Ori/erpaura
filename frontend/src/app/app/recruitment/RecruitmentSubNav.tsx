'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Columns3,
  Calendar,
  Users,
  ExternalLink,
  Plus,
  Sparkles,
} from 'lucide-react';

export default function RecruitmentSubNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/app/recruitment', icon: LayoutDashboard },
    { name: 'Vacancies', href: '/app/recruitment/vacancies', icon: Briefcase },
    { name: 'Candidate Pipeline', href: '/app/recruitment/pipeline', icon: Columns3 },
    { name: 'Interviews & Scorecards', href: '/app/recruitment/interviews', icon: Calendar },
    { name: 'Candidate Directory', href: '/app/recruitment/candidates', icon: Users },
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
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Career Portal Switcher */}
      <div className="flex items-center gap-2">
        <Link
          href="/recruitment"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 hover:border-purple-500 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Candidate Career Portal</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}
