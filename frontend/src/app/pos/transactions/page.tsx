'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Search,
  Printer,
  ArrowLeft,
  DollarSign,
  CreditCard,
  Banknote,
  QrCode,
  X,
  Filter,
  Calendar,
  Store,
} from 'lucide-react';
import { POSTransaction, POSStats } from '@/lib/types';
import { getPOSTransactions, getPOSStats } from '@/lib/inventory-pos-api';

export default function POSTransactionsPage() {
  const [transactions, setTransactions] = useState<POSTransaction[]>([]);
  const [stats, setStats] = useState<POSStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [selectedReceipt, setSelectedReceipt] = useState<POSTransaction | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [txList, statsData] = await Promise.all([
        getPOSTransactions(),
        getPOSStats(),
      ]);
      setTransactions(txList);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (selectedMethod !== 'ALL' && tx.payment_method !== selectedMethod) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        tx.receipt_number.toLowerCase().includes(q) ||
        tx.customer_name.toLowerCase().includes(q) ||
        tx.cashier_name.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/pos"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to POS Register</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-emerald-400" />
            <span>POS Sales & Transaction Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical retail register tickets, tender audit trails, and receipt reprints
          </p>
        </div>

        <Link
          href="/pos"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Store className="w-4 h-4" />
          <span>Open Register Terminal</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Total POS Sales</span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            ${stats ? stats.total_sales.toLocaleString() : '0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Today&apos;s cumulative retail gross</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Transactions Count</span>
          <div className="text-2xl font-black font-mono text-white">
            {stats?.transactions_count ?? transactions.length} Orders
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Average basket: ${stats?.avg_basket || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Cash Tender Sales</span>
          <div className="text-2xl font-black font-mono text-teal-400">
            ${stats ? stats.cash_sales.toLocaleString() : '0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Deposited into physical drawer</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Card / Digital Sales</span>
          <div className="text-2xl font-black font-mono text-indigo-400">
            ${stats ? (stats.card_sales + stats.qr_sales).toLocaleString() : '0.00'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Settled electronically</p>
        </div>
      </div>

      {/* Search & Method Filter */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by receipt #, customer, cashier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase mr-1">Tender:</span>
            {['ALL', 'card', 'cash', 'qr'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMethod(m)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition-colors ${
                  selectedMethod === m
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {m === 'ALL' ? 'All Tenders' : m}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/50 text-slate-400 font-mono text-[10px] uppercase border-y border-slate-800">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4 text-right">Reprint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No transactions found matching filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {tx.receipt_number}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {tx.created_at ? new Date(tx.created_at).toLocaleTimeString() : 'Recent'}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">{tx.customer_name}</td>
                    <td className="py-3 px-4 text-slate-300">{tx.cashier_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {tx.items_data.reduce((acc: number, it: any) => acc + (it.qty || it.quantity || 1), 0)} items
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-200 border border-slate-700">
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                      ${parseFloat(String(tx.total_amount)).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(tx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Voucher</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Reprint 80mm Receipt Voucher */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto font-mono text-xs print:p-0 print:shadow-none">
            {/* Header with Print & Close buttons (hidden on print) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden font-sans">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">Receipt Voucher Reprint</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 80mm Receipt Body */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
              <h2 className="text-base font-black tracking-tight text-slate-900">AURA ERP RETAIL</h2>
              <p className="text-[11px] text-slate-600">Downtown Flagship Store #01</p>
              <p className="text-[10px] text-slate-500">450 Market Street • San Francisco, CA</p>
              <p className="text-[10px] text-slate-500">Tel: (415) 392-8810</p>
            </div>

            <div className="space-y-1 text-[11px] text-slate-700 pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-bold">{selectedReceipt.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{selectedReceipt.cashier_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{selectedReceipt.customer_name}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-1.5 py-2 border-b border-dashed border-slate-300 text-[11px]">
              <div className="flex justify-between font-bold text-slate-900 pb-1 border-b border-slate-200">
                <span>Item</span>
                <span>Total</span>
              </div>
              {selectedReceipt.items_data.map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between text-slate-700">
                  <span className="truncate pr-2">
                    {it.qty || it.quantity || 1}x {it.name}
                  </span>
                  <span className="shrink-0 font-bold">
                    ${(parseFloat(String(it.price)) * (it.qty || it.quantity || 1)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px] text-slate-700 pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${parseFloat(String(selectedReceipt.subtotal)).toLocaleString()}</span>
              </div>
              {parseFloat(String(selectedReceipt.discount)) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-${parseFloat(String(selectedReceipt.discount)).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Sales Tax:</span>
                <span>${parseFloat(String(selectedReceipt.tax)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span>${parseFloat(String(selectedReceipt.total_amount)).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-slate-700 pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between uppercase">
                <span>Method:</span>
                <span className="font-bold">{selectedReceipt.payment_method}</span>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400 font-sans">
              <p>Certified Duplicate Copy • Aura POS Engine</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
