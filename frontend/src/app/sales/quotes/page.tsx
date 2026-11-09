'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  ArrowRight,
  DollarSign,
  Boxes,
  X,
  Building,
  Sparkles,
} from 'lucide-react';
import {
  getQuotations,
  getContacts,
  createQuotation,
  acceptQuotation,
  declineQuotation,
  convertQuotationToOrder,
} from '@/lib/erp-api';
import { Quotation, Contact } from '@/lib/types';

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState<number>(1);
  const [itemName, setItemName] = useState('Aura ERP Discrete MRP Shop Floor Extension');
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState(15000);
  const [notes, setNotes] = useState('Comprehensive commercial software estimate valid for 30 days.');
  const [toastMsg, setToastMsg] = useState('');

  const loadData = async () => {
    try {
      const [qData, cData] = await Promise.all([
        getQuotations(),
        getContacts(),
      ]);
      setQuotes(qData);
      setContacts(cData);
      if (cData.length > 0 && cData[0].id) {
        setCustomerId(cData[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = qty * unitPrice;
    const tax = Math.round(subtotal * 0.10 * 100) / 100;
    const total = subtotal + tax;
    const quoteNo = `QTN-2026-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await createQuotation({
        quote_number: quoteNo,
        customer: customerId,
        issue_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        notes,
      });
      setModalOpen(false);
      showToast(`Quotation ${quoteNo} generated!`);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Error creating quotation');
    }
  };

  const handleAccept = async (id: number) => {
    const res = await acceptQuotation(id);
    showToast(res.message || 'Quotation accepted!');
    loadData();
  };

  const handleDecline = async (id: number) => {
    const res = await declineQuotation(id);
    showToast(res.message || 'Quotation declined.');
    loadData();
  };

  const handleConvert = async (id: number) => {
    const res = await convertQuotationToOrder(id);
    showToast(res.message || 'Converted to Sales Order & Invoice!');
    loadData();
  };

  const filteredQuotes = quotes.filter((q) => {
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      const matchNo = q.quote_number.toLowerCase().includes(term);
      const matchCustomer = q.customer_name?.toLowerCase().includes(term) || false;
      if (!matchNo && !matchCustomer) return false;
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
            { id: 'all', label: 'All Quotations' },
            { id: 'draft', label: 'Drafts' },
            { id: 'sent', label: 'Sent' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'converted', label: 'Converted 🎉' },
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

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search Quote or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Quotation</span>
          </button>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Quote Number</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Line Items Preview</th>
                <th className="py-3 px-4">Quote Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No quotations match criteria.
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((q) => {
                  const statusColors: Record<string, string> = {
                    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    accepted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    converted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    declined: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                  };

                  return (
                    <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {q.quote_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {q.customer_name || 'Customer ID #' + q.customer}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {q.issue_date}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                        {q.items && q.items.length > 0 ? (
                          <span>
                            {q.items[0].quantity}x {q.items[0].item_name}
                            {q.items.length > 1 && ` (+${q.items.length - 1} more)`}
                          </span>
                        ) : (
                          <span>{q.notes || 'Commercial Proposal'}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white font-mono">
                        ${Number(q.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            statusColors[q.status] || 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {q.status === 'sent' && (
                            <>
                              <button
                                onClick={() => q.id && handleAccept(q.id)}
                                className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-[11px] font-semibold transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => q.id && handleDecline(q.id)}
                                className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 text-[11px]"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          {q.status === 'accepted' && (
                            <button
                              onClick={() => q.id && handleConvert(q.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-[11px] font-bold transition-colors flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Convert to Order</span>
                            </button>
                          )}
                          {q.status === 'draft' && (
                            <button
                              onClick={() => q.id && handleAccept(q.id)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 text-[11px] font-semibold transition-colors"
                            >
                              Finalize & Accept
                            </button>
                          )}
                          {q.status === 'converted' && (
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Order Active</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Quote Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-emerald-400">
              <FileCheck className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Generate Quotation Estimate</h3>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Customer</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-emerald-500"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company || c.contact_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Deliverable Item / Service Scope</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Quantity / Licenses</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Unit Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Quote Terms / Validity</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total with 10% Standard Tax:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  ${(qty * unitPrice * 1.1).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30"
                >
                  Generate Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
