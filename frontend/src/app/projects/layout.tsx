'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FolderKanban,
  Kanban,
  Milestone as MilestoneIcon,
  Clock,
  Bug,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Plus,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Portfolio Overview', href: '/projects', icon: FolderKanban },
    { name: 'Kanban Board', href: '/projects/kanban', icon: Kanban },
    { name: 'Milestones & Roadmap', href: '/projects/milestones', icon: MilestoneIcon },
    { name: 'Timesheets & Hours', href: '/projects/timesheets', icon: Clock },
    { name: 'Issues & Bugs', href: '/projects/issues', icon: Bug },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white flex flex-col">
      {/* Top Banner: Enterprise Workstation Bar */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-b border-indigo-500/20 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-indigo-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="font-semibold text-white">Aura ERP Project Management System (PMS)</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 hidden sm:inline">Portfolio Governance & Sprints</span>
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
              href="/app/projects"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Project Admin Console</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main PMS Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/projects" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-white tracking-tight">
                    Aura<span className="text-indigo-400">Plan</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    PMS
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">Agile Workstation & Sprints</p>
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
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-xs'
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

          {/* Right Action: Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-800'
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-8 px-4 sm:px-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              A
            </div>
            <span className="font-semibold text-slate-400">Aura ERP Project Management Suite</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/app/projects" className="hover:text-indigo-400 transition-colors">Project Console</Link>
            <Link href="/projects/kanban" className="hover:text-indigo-400 transition-colors">Kanban Board</Link>
            <Link href="/projects/timesheets" className="hover:text-indigo-400 transition-colors">Timesheets</Link>
            <Link href="/docs" className="hover:text-indigo-400 transition-colors">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
