'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Truck,
  Building,
  DollarSign,
  X,
  FileCheck,
} from 'lucide-react';
import { getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, getContacts } from '@/lib/erp-api';
import { PurchaseOrder, Contact } from '@/lib/types';

export default function ProcurementPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [vendorId, setVendorId] = useState<number>(1);
  const [itemName, setItemName] = useState('DDR5 64GB ECC Server Memory Modules');
  const [qty, setQty] = useState(50);
  const [unitCost, setUnitCost] = useState(160);
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('Standard vendor delivery terms.');

  useEffect(() => {
    setExpectedDate(new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]);
    Promise.all([getPurchaseOrders(), getContacts()]).then(([po, c]) => {
      setOrders(po);
      const vendorList = c.filter((item) => item.contact_type === 'vendor' || item.contact_type === 'partner');
      setVendors(vendorList.length > 0 ? vendorList : c);
      if (vendorList.length > 0) setVendorId(vendorList[0].id || 1);
      setLoading(false);
    });
  }, []);

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find((v) => v.id === vendorId);
    const subtotal = qty * unitCost;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + tax;
    const poNumber = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const created = await createPurchaseOrder({
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
      setOrders((prev) => [created, ...prev]);
      setModalOpen(false);
    } catch (e) {
      const local: PurchaseOrder = {
        id: Date.now(),
        po_number: poNumber,
        vendor: vendorId,
        vendor_details: vendor,
        order_date: new Date().toISOString().split('T')[0],
        expected_date: expectedDate,
        status: 'draft',
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        notes,
      };
      setOrders((prev) => [local, ...prev]);
      setModalOpen(false);
    }
  };

  const handleAdvanceStatus = async (order: PurchaseOrder) => {
    const nextStatus =
      order.status === 'draft' ? 'sent' :
      order.status === 'sent' ? 'received' :
      order.status === 'received' ? 'billed' : 'received';

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o))
    );

    if (order.id) {
      try {
        await updatePurchaseOrder(order.id, { status: nextStatus });
      } catch (e) {
        console.error('Failed to update PO status in Django', e);
      }
    }
  };

  const totalProcured = orders.reduce((acc, curr) => acc + parseFloat(String(curr.total || 0)), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Purchase Order System (Procurement)</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Aureus Supply Chain
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage vendor relations, generate purchase orders, track inbound shipments and GRN receipts.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Purchase Commitment</span>
          <div className="text-2xl font-bold text-white">${totalProcured.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">{orders.length} active purchase orders</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Goods In-Transit</span>
          <div className="text-2xl font-bold text-sky-400">
            {orders.filter((o) => o.status === 'sent').length} Orders
          </div>
          <div className="text-[11px] text-slate-500">Awaiting dock warehouse check-in</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Received & Stocked</span>
          <div className="text-2xl font-bold text-emerald-400">
            {orders.filter((o) => o.status === 'received' || o.status === 'billed').length} Orders
          </div>
          <div className="text-[11px] text-slate-500">Verified against GRN inspection</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white">Purchase Orders Registry</h2>
            <p className="text-xs text-slate-400">Vendor supply agreements and fulfillment tracking</p>
          </div>
          <span className="text-xs font-semibold text-sky-400 font-mono">{orders.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">PO #</th>
                <th className="py-2.5 px-4">Supplier / Vendor</th>
                <th className="py-2.5 px-4">Order Date</th>
                <th className="py-2.5 px-4">Expected Date</th>
                <th className="py-2.5 px-4">Total</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {orders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">{po.po_number}</td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {po.vendor_details?.name || 'Global Hardware Supplies'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{po.order_date}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{po.expected_date || '—'}</td>
                  <td className="py-3 px-4 font-bold text-white">${parseFloat(String(po.total)).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      po.status === 'received' || po.status === 'billed' ? 'bg-emerald-500/20 text-emerald-300' :
                      po.status === 'sent' ? 'bg-sky-500/20 text-sky-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleAdvanceStatus(po)}
                      className="px-2.5 py-1 rounded text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                    >
                      {po.status === 'draft' ? 'Send PO →' :
                       po.status === 'sent' ? 'Receive Goods ✓' :
                       po.status === 'received' ? 'Bill Vendor' : 'Completed'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Order Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Purchase Order (RFQ)</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Vendor</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.company || 'Vendor'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Material / Component Sourced</label>
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
                  <label className="block text-slate-400 mb-1 font-semibold">Unit Cost ($)</label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Expected Delivery Date</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Cost Summary Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>${(qty * unitCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax (5%):</span>
                  <span>${((qty * unitCost) * 0.05).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
                  <span>Total Order Commitment:</span>
                  <span className="text-sky-400">${((qty * unitCost) * 1.05).toFixed(2)}</span>
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
