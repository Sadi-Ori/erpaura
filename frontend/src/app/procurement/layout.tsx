'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  FileText,
  Users,
  PackageCheck,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function ProcurementLayout({ children }: Props) {
  const pathname = usePathname();

  const navLinks = [
    { label: 'Orders & RFQs', href: '/procurement', icon: FileText, exact: true },
    { label: 'Vendors & Suppliers', href: '/procurement/vendors', icon: Users, exact: false },
    { label: 'Goods Receipts (GRN)', href: '/procurement/grn', icon: PackageCheck, exact: false },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Enterprise Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/modules/purchase-order"
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Back to Module Catalog"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-tight text-white">
                    Aura Procurement
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Supply Chain
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Vendor RFQs, Purchase Orders & 3-Way GRN Reconciliation
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app/procurement"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Console Workspace</span>
            </Link>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="border-t border-slate-800/80 bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2">
            {navLinks.map((tab) => {
              const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
