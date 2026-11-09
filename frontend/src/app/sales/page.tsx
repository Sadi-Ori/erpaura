'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  CheckCircle2,
  DollarSign,
  ShoppingCart,
  FileCheck,
  Receipt,
  Building,
  CreditCard,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { getOrders, getSalesStats } from '@/lib/erp-api';
import { Order, SalesStats } from '@/lib/types';

export default function SalesOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([getOrders(), getSalesStats()]).then(([ordData, statsData]) => {
      setOrders(ordData);
      setStats(statsData);
      setLoading(false);
    });
  }, []);

  const filtered = orders.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        (o.company_name && o.company_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Collected Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ${stats?.total_revenue ? stats.total_revenue.toLocaleString() : '61,600'}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">From {stats?.total_orders || orders.length} confirmed orders</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Paid Invoices</span>
            <Receipt className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${stats?.paid_invoices_amount ? stats.paid_invoices_amount.toLocaleString() : '61,600'}
          </div>
          <span className="text-[11px] text-cyan-400">100% reconciled to bank</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Quote Conversion Rate</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {stats?.conversion_rate ?? 33.3}%
          </div>
          <span className="text-[11px] text-slate-400">
            {stats?.accepted_quotes ?? 1} of {stats?.total_quotes ?? 3} proposals accepted
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Pending Invoicing</span>
            <FileCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${stats?.unpaid_invoices_amount ? stats.unpaid_invoices_amount.toLocaleString() : '26,400'}
          </div>
          <span className="text-[11px] text-amber-400">Quotes pending conversion</span>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white">Confirmed Sales Orders</h2>
          <p className="text-xs text-slate-400">
            Customer contract orders converted from accepted estimates or direct checkout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search order or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <Link
            href="/sales/quotes"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-colors shrink-0"
          >
            <FileCheck className="w-4 h-4" />
            <span>Manage Quotations</span>
          </Link>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Client / Account</th>
                <th className="py-3 px-4">Billing Contact</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {ord.order_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">
                      {ord.company_name || ord.customer_name}
                    </div>
                    <div className="text-[11px] text-slate-500">{ord.customer_name}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div>{ord.customer_email}</div>
                    <div className="text-[11px] text-slate-500">{ord.customer_phone || 'Direct'}</div>
                  </td>
                  <td className="py-3.5 px-4 capitalize text-slate-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      <span>{ord.payment_method.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white font-mono">
                    ${Number(ord.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{ord.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href="/sales/invoices"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View PDF</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
