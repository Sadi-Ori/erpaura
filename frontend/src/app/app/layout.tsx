'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Clock,
  Users,
  Receipt,
  Store,
  ShoppingCart,
  Boxes,
  Factory,
  Wrench,
  Briefcase,
  Settings,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Search,
  Bell,
  Sparkles,
  Building2,
  CheckCircle2,
} from 'lucide-react';

const erpModules = [
  { name: 'Executive Overview', path: '/app', icon: LayoutDashboard, badge: 'Live' },
  { name: 'Projects & Tasks', path: '/app/projects', icon: FolderKanban, badge: 'PMS' },
  { name: 'Timesheets & Logs', path: '/app/timesheets', icon: Clock, badge: null },
  { name: 'Contacts & CRM', path: '/app/contacts', icon: Users, badge: null },
  { name: 'Sales & Quotations', path: '/app/sales', icon: Receipt, badge: null },
  { name: 'Point of Sale (POS)', path: '/app/pos', icon: Store, badge: 'Register' },
  { name: 'Purchasing (Procurement)', path: '/app/procurement', icon: ShoppingCart, badge: null },
  { name: 'Inventory & Warehouses', path: '/app/inventory', icon: Boxes, badge: 'WMS' },
  { name: 'Manufacturing (MRP)', path: '/app/manufacturing', icon: Factory, badge: 'Shop Floor' },
  { name: 'Maintenance & Assets', path: '/app/maintenance', icon: Wrench, badge: null },
  { name: 'Human Resources (HR)', path: '/app/hr', icon: Briefcase, badge: 'Leaves' },
  { name: 'System Settings', path: '/app/settings', icon: Settings, badge: null },
];

export default function ERPAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar Overlay on Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Enterprise Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand & Organization Header */}
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <Link href="/app" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center text-white font-extrabold text-base shadow-sm shadow-indigo-500/20">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-tight">Aura<span className="text-indigo-400">ERP</span></span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Console</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Django 6.0 Active</span>
              </div>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Company Selector */}
        <div className="px-3 py-2.5 bg-slate-950/50 border-b border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-300 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="font-semibold truncate">Aura Global Inc.</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 shrink-0">HQ-01</span>
          </div>
        </div>

        {/* Modules Nav List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            ERP Modules & Tools
          </div>

          {erpModules.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                  }`} />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                    isActive
                      ? 'bg-indigo-700 text-indigo-100'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 shrink-0 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <span>Public Site & Docs</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center text-white font-bold text-xs shrink-0">
              A
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-semibold text-slate-200 truncate">System Administrator</div>
              <div className="text-[10px] text-slate-500 truncate">admin@auraerp.io</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace View */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Control Bar */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Module Title */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Enterprise Console</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-white font-bold capitalize">
                {erpModules.find((m) => m.path === pathname)?.name || 'Module'}
              </span>
            </div>
          </div>

          {/* Quick Actions & Search */}
          <div className="flex items-center gap-3">
            
            {/* Quick Search Box */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 w-64 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Search ERP records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-hidden text-xs text-slate-200 placeholder-slate-500 w-full"
              />
              <kbd className="px-1 py-0.5 text-[9px] font-mono bg-slate-800 text-slate-400 rounded">Ctrl+K</kbd>
            </div>

            {/* Launch POS Button Shortcut */}
            <Link
              href="/app/pos"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl transition-all"
            >
              <Store className="w-3.5 h-3.5" />
              <span>POS Register</span>
            </Link>

            {/* Quick Log Timesheet Button */}
            <Link
              href="/app/timesheets"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-xl transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Log Hours</span>
            </Link>

            {/* Notifications Icon */}
            <div className="relative">
              <button
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors relative"
                aria-label="System notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500"></span>
              </button>
            </div>

          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
