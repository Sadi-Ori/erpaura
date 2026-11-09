'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Store,
  Receipt,
  Boxes,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  DollarSign,
  User,
  Clock,
  Sparkles,
  Lock,
  Unlock,
  X,
  Menu,
} from 'lucide-react';
import { POSStats } from '@/lib/types';
import { getPOSStats, closePOSShift, openPOSShift } from '@/lib/inventory-pos-api';

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [stats, setStats] = useState<POSStats | null>(null);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [floatAmount, setFloatAmount] = useState('250.00');

  const loadStats = async () => {
    try {
      const data = await getPOSStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleShift = async () => {
    if (!stats?.active_register) return;
    const reg = stats.active_register;
    try {
      if (reg.is_open) {
        await closePOSShift(reg.id || 1, parseFloat(floatAmount));
      } else {
        await openPOSShift(reg.id || 1, parseFloat(floatAmount));
      }
      setShiftModalOpen(false);
      await loadStats();
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { name: 'Register Terminal', href: '/pos', icon: Store },
    { name: 'Transaction History', href: '/pos/transactions', icon: Receipt },
  ];

  const register = stats?.active_register;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-600 selection:text-white flex flex-col">
      {/* Top Banner: Retail Store Bar */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-b border-emerald-500/20 py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2 text-emerald-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">Aura ERP Retail POS Terminal</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 hidden sm:inline">
              Store: {register?.store_location || 'Downtown Flagship'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/inventory"
              className="text-slate-400 hover:text-white transition-colors text-[11px] hidden md:inline-flex items-center gap-1"
            >
              <Boxes className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inventory Hub</span>
            </Link>

            <Link
              href="/app/pos"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>POS Console</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Terminal Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/pos" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-white tracking-tight">
                    Aura<span className="text-emerald-400">POS</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Terminal #01
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">Fast Cashier Checkout System</p>
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

          {/* Cashier & Register Drawer Info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-2xl text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">{register?.active_cashier || 'Sarah Jenkins'}</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
                <DollarSign className="w-3.5 h-3.5" />
                <span>${parseFloat(String(register?.current_cash || '1420.50')).toLocaleString()} in Drawer</span>
              </div>
            </div>

            <button
              onClick={() => setShiftModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {register?.is_open ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Shift Open</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Shift Closed</span>
                </>
              )}
            </button>

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

      {/* Main Cashier Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Modal: Shift Reconciliation */}
      {shiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <Store className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Cash Register Shift Manager</h3>
              </div>
              <button
                onClick={() => setShiftModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Terminal:</span>
                <span className="font-bold text-white">{register?.name || 'Counter Terminal #01'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Cashier:</span>
                <span className="font-bold text-white">{register?.active_cashier || 'Sarah Jenkins'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Cash in Drawer:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ${parseFloat(String(register?.current_cash || '1420.50')).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Today&apos;s Total Sales:</span>
                <span className="font-mono font-semibold text-white">
                  ${stats ? stats.total_sales.toLocaleString() : '0.00'} ({stats?.transactions_count || 0} orders)
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-400 font-semibold">
                {register?.is_open ? 'Final Counted Cash Float ($):' : 'Opening Cash Float ($):'}
              </label>
              <input
                type="number"
                step="0.01"
                value={floatAmount}
                onChange={(e) => setFloatAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setShiftModalOpen(false)}
                className="px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleShift}
                className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md transition-all ${
                  register?.is_open
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                }`}
              >
                {register?.is_open ? 'Close Register Shift' : 'Open Register Shift'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
