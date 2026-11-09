'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Building,
  DollarSign,
  X,
  FileCheck,
  Send,
  Boxes,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  getPurchaseOrders,
  createPurchaseOrder,
  getContacts,
  getProcurementStats,
  sendPurchaseOrder,
  receivePurchaseOrderGoods,
  billPurchaseOrder,
} from '@/lib/erp-api';
import { PurchaseOrder, Contact, ProcurementStats } from '@/lib/types';

export default function ProcurementOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Contact[]>([]);
  const [stats, setStats] = useState<ProcurementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [vendorId, setVendorId] = useState<number>(1);
  const [itemName, setItemName] = useState('High-Density Power Supply Unit 850W');
  const [qty, setQty] = useState(25);
  const [unitCost, setUnitCost] = useState(150);
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('Expedited delivery requested for plant assembly line.');
  const [toastMsg, setToastMsg] = useState('');

  const loadData = async () => {
    try {
      const [poData, contactsData, statsData] = await Promise.all([
        getPurchaseOrders(),
        getContacts(),
        getProcurementStats(),
      ]);
      setOrders(poData);
      const vendorList = contactsData.filter((c) => c.contact_type === 'vendor' || c.contact_type === 'partner');
      setVendors(vendorList.length > 0 ? vendorList : contactsData);
      if (vendorList.length > 0 && vendorList[0].id) {
        setVendorId(vendorList[0].id);
      }
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setExpectedDate(new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]);
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = qty * unitCost;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + tax;
    const poNumber = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await createPurchaseOrder({
        po_number: poNumber,
        vendor: vendorId,
        order_date: new Date().toISOString().split('T')[0],
        expected_date: expectedDate,
        status: 'draft',
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        notes,
      });
      setModalOpen(false);
      showToast(`Purchase Order ${poNumber} created successfully!`);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Error creating Purchase Order');
    }
  };

  const handleSendOrder = async (id: number) => {
    await sendPurchaseOrder(id);
    showToast('Purchase Order dispatched to vendor!');
    loadData();
  };

  const handleReceiveGoods = async (id: number) => {
    const res = await receivePurchaseOrderGoods(id);
    showToast(res.message || 'Goods received and physical inventory credited!');
    loadData();
  };

  const handleBillOrder = async (id: number) => {
    await billPurchaseOrder(id);
    showToast('Purchase Order 3-way matched & recorded as billed!');
    loadData();
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchNo = o.po_number.toLowerCase().includes(q);
      const matchVendor = o.vendor_details?.name.toLowerCase().includes(q) || false;
      if (!matchNo && !matchVendor) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-rose-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Received / Billed Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${stats?.total_spend ? stats.total_spend.toLocaleString() : '69,825'}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Reconciled to Inventory</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Committed POs</span>
            <ShoppingBag className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${stats?.total_committed ? stats.total_committed.toLocaleString() : '98,490'}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Across {stats?.total_orders || orders.length} orders</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Pending Delivery</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {stats?.sent_count ?? 1} Shipments
          </div>
          <span className="text-[11px] text-slate-400">Dispatched from suppliers</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Approved Vendors</span>
            <Building className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats?.vendors_count ?? vendors.length} Vendors
          </div>
          <span className="text-[11px] text-cyan-400">Strategic contracts active</span>
        </div>
      </div>

      {/* Action Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          {['all', 'draft', 'sent', 'received', 'billed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'All Orders' : s === 'draft' ? 'Draft RFQs' : s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search PO or Vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Vendor / Supplier</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Expected Date</th>
                <th className="py-3 px-4">Items / Description</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Lifecycle Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No purchase orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => {
                  const statusColors: Record<string, string> = {
                    draft: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    received: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    billed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                  };

                  return (
                    <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {po.po_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">
                          {po.vendor_details?.name || 'Vendor ID #' + po.vendor}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {po.vendor_details?.company || 'Primary Strategic Vendor'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                        {po.order_date}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {po.expected_date || 'Standard'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                        {po.items && po.items.length > 0 ? (
                          <span>
                            {po.items[0].quantity}x {po.items[0].item_name}
                            {po.items.length > 1 && ` (+${po.items.length - 1} more)`}
                          </span>
                        ) : (
                          <span className="text-slate-500">{po.notes || 'Procurement Order'}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        ${Number(po.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            statusColors[po.status] || 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {po.status === 'draft' && (
                            <button
                              onClick={() => po.id && handleSendOrder(po.id)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/30 text-[11px] font-semibold transition-colors"
                            >
                              Dispatch PO
                            </button>
                          )}
                          {po.status === 'sent' && (
                            <button
                              onClick={() => po.id && handleReceiveGoods(po.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <Boxes className="w-3 h-3" />
                              <span>Receive GRN</span>
                            </button>
                          )}
                          {po.status === 'received' && (
                            <button
                              onClick={() => po.id && handleBillOrder(po.id)}
                              className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <FileCheck className="w-3 h-3" />
                              <span>Match 3-Way</span>
                            </button>
                          )}
                          {po.status === 'billed' && (
                            <span className="text-[11px] text-slate-500 italic">Reconciled</span>
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

      {/* Create Purchase Order Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-rose-400">
              <ShoppingBag className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Create Purchase Order / RFQ</h3>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Vendor</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-rose-500"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.company || v.contact_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Item Name / Part Description</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Order Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Expected Delivery Date</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Procurement Notes / Terms</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Estimated Total (incl. 5% tax):</span>
                <span className="font-bold text-rose-400 text-sm">
                  ${(qty * unitCost * 1.05).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/30"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
