'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Boxes,
  ArrowLeftRight,
  Warehouse as WarehouseIcon,
  Store,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Package,
  Layers,
  Menu,
  X,
} from 'lucide-react';
import { InventoryStats } from '@/lib/types';
import { getInventoryStats } from '@/lib/inventory-pos-api';

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    getInventoryStats().then(setStats).catch(console.error);
  }, []);

  const navLinks = [
    { name: 'Stock Levels', href: '/inventory', icon: Boxes },
    { name: 'Movements & Transfers', href: '/inventory/movements', icon: ArrowLeftRight },
    { name: 'Warehouses & Bins', href: '/inventory/warehouses', icon: WarehouseIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-600 selection:text-white flex flex-col">
      {/* Top Banner: Multi-Warehouse WMS Bar */}
      <div className="bg-gradient-to-r from-teal-950/80 via-slate-900 to-indigo-950/80 border-b border-teal-500/20 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-teal-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="font-semibold text-white">Aura ERP Warehouse Management System (WMS)</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 hidden sm:inline">
              {stats?.total_warehouses || 4} Global Fulfillment Facilities Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pos"
              className="text-slate-400 hover:text-white transition-colors text-[11px] hidden md:inline-flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span>POS Terminal</span>
            </Link>

            <Link
              href="/app/inventory"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-600/30 hover:bg-teal-600 text-teal-200 hover:text-white border border-teal-500/40 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>WMS Console</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Inventory Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/inventory" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-white tracking-tight">
                    Aura<span className="text-teal-400">Stock</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    WMS Hub
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">Multi-Facility Inventory & Bin Locations</p>
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
                        ? 'bg-teal-600/20 text-teal-300 border border-teal-500/30 shadow-xs'
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

          {/* Right Header Stats */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-2xl text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Package className="w-3.5 h-3.5 text-teal-400" />
                <span>{stats?.total_units?.toLocaleString() || 3788} Units</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5 font-mono text-teal-400 font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                <span>${stats ? stats.total_valuation.toLocaleString() : '73,496'} Value</span>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
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
                    isActive ? 'bg-teal-600/20 text-teal-300' : 'text-slate-300 hover:bg-slate-800'
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

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-8 px-4 sm:px-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
              A
            </div>
            <span className="font-semibold text-slate-400">Aura ERP Multi-Warehouse & WMS Suite</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/inventory" className="hover:text-teal-400 transition-colors">Stock Levels</Link>
            <Link href="/inventory/movements" className="hover:text-teal-400 transition-colors">Transfers</Link>
            <Link href="/pos" className="hover:text-teal-400 transition-colors">Retail POS</Link>
            <Link href="/docs" className="hover:text-teal-400 transition-colors">Documentation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
