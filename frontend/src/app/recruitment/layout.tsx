'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  UserCheck,
  User,
  FileText,
  Building2,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function RecruitmentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Explore Vacancies', href: '/recruitment', icon: Briefcase },
    { name: 'Reusable Profile', href: '/recruitment/profile', icon: User },
    { name: 'My Applications', href: '/recruitment/applications', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-600 selection:text-white flex flex-col">
      {/* Top Banner: Multi-Entity Organization Bar */}
      <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-900/40 border-b border-purple-500/20 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-purple-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">Aura ERP Careers</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300 hidden sm:inline">Global Multi-Subsidiary Recruitment Network</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-[11px] hidden md:inline">
              4 Active Entities: Tech Inc, Retail Dynamics, Global Logistics, FinTech Ltd
            </span>
            <Link
              href="/app/recruitment"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HR Recruiter Console</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/recruitment" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-white tracking-tight">Aura<span className="text-purple-400">Talent</span></span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    RMS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">Recruitment Management System</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-200 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <span>Back to Aura ERP</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/app/recruitment"
              className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Recruiter Portal</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive ? 'bg-purple-600/20 text-purple-300' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <Link
                href="/app/recruitment"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg bg-purple-600 text-white"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Go to HR Recruiter Console</span>
              </Link>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs text-slate-400 py-1"
              >
                Back to Aura ERP Main Site
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Recruitment Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-8 px-4 sm:px-6 mt-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center text-white text-[10px] font-bold">
              A
            </div>
            <span className="font-semibold text-slate-200">Aura ERP Recruitment & ATS Platform</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/recruitment" className="hover:text-purple-300 transition-colors">Open Positions</Link>
            <Link href="/recruitment/profile" className="hover:text-purple-300 transition-colors">Applicant Profile</Link>
            <Link href="/recruitment/applications" className="hover:text-purple-300 transition-colors">Application Tracker</Link>
            <Link href="/app/recruitment" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">HR Management Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
