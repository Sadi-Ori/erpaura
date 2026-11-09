'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Clock,
  CalendarCheck2,
  FileSpreadsheet,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Building2,
  Sparkles,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';
import { EmployeeProvider, useEmployee } from './EmployeeContext';

function HeaderContent() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { employees, selectedEmployee, selectedEmployeeId, setSelectedEmployeeId, todayAttendance } = useEmployee();

  const navLinks = [
    { name: 'My Overview', href: '/employees', icon: Users },
    { name: 'Attendance & Punch Clock', href: '/employees/attendance', icon: Clock },
    { name: 'Time-Off & Leaves', href: '/employees/leave', icon: CalendarCheck2 },
    { name: 'Payslips & Salary', href: '/employees/payslips', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Top Multi-Entity Organization Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border-b border-emerald-500/20 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">Aura ERP Employee Self-Service (ESS)</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 hidden sm:inline">Connected to Django HRMS Core</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition-colors text-[11px] hidden md:inline-flex items-center gap-1"
            >
              <span>Back to Aura ERP</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>

            <Link
              href="/app/hr"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HR Admin Console</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main ESS Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/employees" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-white tracking-tight">
                    Aura<span className="text-emerald-400">Talent</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ESS Portal
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">Employee Self-Service</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
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
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
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

          {/* Right: Employee Persona Switcher */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-300">
                {selectedEmployee ? `${selectedEmployee.first_name[0]}${selectedEmployee.last_name[0]}` : 'EM'}
              </div>
              <div className="flex flex-col text-left mr-1">
                <span className="text-[10px] uppercase font-mono text-slate-400 leading-none">Logged In As</span>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(parseInt(e.target.value, 10))}
                  className="bg-transparent text-xs font-semibold text-white focus:outline-hidden cursor-pointer"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">
                      {emp.full_name} ({emp.job_title})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-2">
            <div className="pb-2 border-b border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Active Employee Persona</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-semibold text-white"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.job_title})
                  </option>
                ))}
              </select>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-emerald-600/20 text-emerald-300' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>
    </>
  );
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmployeeProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
        <HeaderContent />

        {/* Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-900/50 py-8 px-4 sm:px-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                A
              </div>
              <span className="font-semibold text-slate-400">Aura ERP Human Resource Management & Payroll Suite</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <Link href="/app/hr" className="hover:text-emerald-400 transition-colors">HR Admin Console</Link>
              <Link href="/recruitment" className="hover:text-emerald-400 transition-colors">Recruitment System</Link>
              <Link href="/docs" className="hover:text-emerald-400 transition-colors">System Documentation</Link>
            </div>
          </div>
        </footer>
      </div>
    </EmployeeProvider>
  );
}
