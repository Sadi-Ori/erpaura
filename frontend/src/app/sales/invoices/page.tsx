'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  CheckCircle2,
  Printer,
  X,
  CreditCard,
  Building,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { getInvoices, markInvoicePaid } from '@/lib/erp-api';
import { Invoice } from '@/lib/types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Print Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadInvoices = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleMarkPaid = async (id: number) => {
    const res = await markInvoicePaid(id);
    showToast(res.message || 'Invoice marked as Paid!');
    loadInvoices();
  };

  const filtered = invoices.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        i.invoice_number.toLowerCase().includes(q) ||
        i.customer_name.toLowerCase().includes(q) ||
        (i.customer_company && i.customer_company.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Bar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Invoices' },
            { id: 'paid', label: 'Paid' },
            { id: 'sent', label: 'Sent' },
            { id: 'overdue', label: 'Overdue' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-colors ${
                statusFilter === s.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search invoice number or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Tax (10%)</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Invoice Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((inv) => {
                const isPaid = inv.status === 'paid';
                return (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {inv.invoice_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {inv.customer_company || inv.customer_name}
                      </div>
                      <div className="text-[11px] text-slate-500">{inv.customer_email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {inv.issue_date}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 text-[11px]">
                      {inv.due_date}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      ${Number(inv.tax).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white font-mono text-sm">
                      ${Number(inv.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isPaid && inv.id && (
                          <button
                            onClick={() => handleMarkPaid(inv.id!)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3 text-emerald-400" />
                          <span>Print PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 print:hidden"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Print Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-6">
              <div>
                <div className="text-2xl font-black tracking-tight text-slate-900">AURA ERP</div>
                <div className="text-xs text-slate-500 mt-1">Enterprise Cloud Systems Inc.</div>
                <div className="text-xs text-slate-500">100 Enterprise Way, Suite 400, Austin, TX</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-mono font-extrabold text-indigo-600">
                  {selectedInvoice.invoice_number}
                </div>
                <div className="text-xs text-slate-500 mt-1">Issue Date: {selectedInvoice.issue_date}</div>
                <div className="text-xs text-slate-500">Due Date: {selectedInvoice.due_date}</div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Billed To:</span>
              <div className="text-sm font-bold text-slate-900">
                {selectedInvoice.customer_company || selectedInvoice.customer_name}
              </div>
              <div className="text-slate-600">{selectedInvoice.customer_name}</div>
              <div className="text-slate-600">{selectedInvoice.customer_email}</div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Item & Description</th>
                    <th className="py-2.5 px-4 text-right">Tax Rate</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">Aura Enterprise Platform Subscriptions</div>
                      <div className="text-[11px] text-slate-500">Full stack modular ERP license deployment</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">10.0%</td>
                    <td className="py-3 px-4 text-right font-bold font-mono">
                      ${Number(selectedInvoice.subtotal).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end text-xs mb-8">
              <div className="w-64 space-y-2 border-t border-slate-200 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">${Number(selectedInvoice.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax Amount:</span>
                  <span className="font-mono">${Number(selectedInvoice.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total Due:</span>
                  <span className="font-mono text-indigo-600">
                    ${Number(selectedInvoice.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions for modal */}
            <div className="flex justify-end gap-3 print:hidden border-t border-slate-200 pt-4">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
