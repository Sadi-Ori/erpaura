'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  DollarSign,
  FileText,
  X,
  Printer,
  Calendar,
} from 'lucide-react';
import { getQuotations, createQuotation, getContacts } from '@/lib/erp-api';
import { getLiveInvoices } from '@/lib/api';
import { Quotation, Invoice, Contact } from '@/lib/types';

export default function SalesModulePage() {
  const [activeTab, setActiveTab] = useState<'quotes' | 'invoices'>('quotes');
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // New Quote Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState<number>(1);
  const [itemName, setItemName] = useState('Enterprise ERP Cloud Instance');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(2500);
  const [notes, setNotes] = useState('Net-30 payment terms upon acceptance.');

  useEffect(() => {
    Promise.all([getQuotations(), getLiveInvoices(), getContacts()]).then(([q, inv, c]) => {
      setQuotes(q);
      setInvoices(inv);
      setContacts(c.filter((contact) => contact.contact_type === 'customer' || contact.contact_type === 'lead'));
      if (c.length > 0) setCustomerId(c[0].id || 1);
      setLoading(false);
    });
  }, []);

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = contacts.find((c) => c.id === customerId);
    const subtotal = qty * price;
    const tax = roundToTwo(subtotal * 0.05);
    const total = roundToTwo(subtotal + tax);

    try {
      const created = await createQuotation({
        quote_number: `QTN-2026-${Math.floor(100 + Math.random() * 900)}`,
        customer: customerId,
        issue_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        notes: notes,
      });
      setQuotes((prev) => [created, ...prev]);
      setModalOpen(false);
    } catch (e) {
      const local: Quotation = {
        id: Date.now(),
        quote_number: `QTN-2026-${Math.floor(100 + Math.random() * 900)}`,
        customer: customerId,
        customer_name: customer?.name || 'Acme Global',
        issue_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        notes: notes,
      };
      setQuotes((prev) => [local, ...prev]);
      setModalOpen(false);
    }
  };

  const roundToTwo = (num: number) => Math.round(num * 100) / 100;

  const totalQuotesValue = quotes.reduce((acc, curr) => acc + parseFloat(String(curr.total || 0)), 0);
  const totalInvoicedValue = invoices.reduce((acc, curr) => acc + parseFloat(String(curr.total || 0)), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Sales & Quotations Management</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Aureus Sales
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Send commercial proposals, convert accepted quotations to orders, and manage invoice accounts.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Quotation Pipeline</span>
          <div className="text-2xl font-bold text-white">${totalQuotesValue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">{quotes.length} active estimates issued</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Billed Invoices</span>
          <div className="text-2xl font-bold text-emerald-400">${totalInvoicedValue.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">{invoices.length} invoices generated</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Average Deal Size</span>
          <div className="text-2xl font-bold text-indigo-400">
            ${quotes.length ? Math.round(totalQuotesValue / quotes.length).toLocaleString() : '0'}
          </div>
          <div className="text-[11px] text-slate-500">Commercial enterprise average</div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'quotes'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Quotations ({quotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'invoices'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Invoices ({invoices.length})</span>
        </button>
      </div>

      {/* Main Table View */}
      {activeTab === 'quotes' ? (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">{q.quote_number}</td>
                  <td className="py-3 px-4 font-semibold text-white">{q.customer_name || 'Acme Global Tech'}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{q.issue_date}</td>
                  <td className="py-3 px-4">${parseFloat(String(q.subtotal)).toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">${parseFloat(String(q.total)).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      q.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300' :
                      q.status === 'sent' ? 'bg-indigo-500/20 text-indigo-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setQuotes((prev) =>
                          prev.map((item) => (item.id === q.id ? { ...item, status: 'accepted' } : item))
                        );
                      }}
                      className="px-2 py-1 rounded text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                    >
                      Accept Quote
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">INV-{inv.invoice_number}</td>
                  <td className="py-3 px-4 font-semibold text-white">{inv.customer_name}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{inv.issue_date}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{inv.due_date}</td>
                  <td className="py-3 px-4 font-bold text-white">${parseFloat(String(inv.total)).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Quote Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Sales Quotation</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Customer</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company || 'Direct'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Line Item Description</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Unit Price ($)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Live Price Calculator */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>${(qty * price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Tax (5%):</span>
                  <span>${((qty * price) * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
                  <span>Total Proposal:</span>
                  <span className="text-emerald-400">${((qty * price) * 1.05).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-sm"
                >
                  Issue Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
