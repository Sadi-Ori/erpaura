'use client';

import React, { useState, useEffect } from 'react';
import {
  Factory,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Play,
  CheckCheck,
  Cpu,
  Layers,
  X,
  Boxes,
  Activity,
  AlertCircle,
} from 'lucide-react';
import {
  getProductionOrders,
  getBillOfMaterials,
  createProductionOrder,
  startProductionOrder,
  completeProductionOrderQA,
  completeProductionOrder,
  getManufacturingStats,
  getWorkCenters,
} from '@/lib/erp-api';
import { ProductionOrder, BillOfMaterials, ManufacturingStats, WorkCenter } from '@/lib/types';

export default function ManufacturingOrdersPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [boms, setBoms] = useState<BillOfMaterials[]>([]);
  const [workcenters, setWorkcenters] = useState<WorkCenter[]>([]);
  const [stats, setStats] = useState<ManufacturingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [bomId, setBomId] = useState<number>(1);
  const [plannedQty, setPlannedQty] = useState(25);
  const [workstation, setWorkstation] = useState('Precision Assembly Cell A');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('Scheduled standard shift production run.');
  const [toastMsg, setToastMsg] = useState('');

  const loadData = async () => {
    try {
      const [ordData, bomData, wcData, statsData] = await Promise.all([
        getProductionOrders(),
        getBillOfMaterials(),
        getWorkCenters(),
        getManufacturingStats(),
      ]);
      setOrders(ordData);
      setBoms(bomData);
      if (bomData.length > 0 && bomData[0].id) {
        setBomId(bomData[0].id);
      }
      setWorkcenters(wcData);
      if (wcData.length > 0) {
        setWorkstation(wcData[0].name);
      }
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderNumber = `MO-2026-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await createProductionOrder({
        order_number: orderNumber,
        bom: bomId,
        planned_quantity: plannedQty,
        completed_quantity: 0,
        status: 'planned',
        start_date: new Date().toISOString().split('T')[0],
        due_date: dueDate,
        assigned_workstation: workstation,
        notes,
      });
      setModalOpen(false);
      showToast(`Production Order ${orderNumber} created!`);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Error creating Production Order');
    }
  };

  const handleStartWork = async (id: number) => {
    await startProductionOrder(id);
    showToast('Work order started on shop floor terminal!');
    loadData();
  };

  const handleQA = async (id: number) => {
    await completeProductionOrderQA(id);
    showToast('Production batch moved to QA Inspection!');
    loadData();
  };

  const handleComplete = async (id: number, planned: number) => {
    const res = await completeProductionOrder(id, planned);
    showToast(res.message || 'Run complete & finished goods auto-stocked!');
    loadData();
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchNo = o.order_number.toLowerCase().includes(q);
      const matchBom = o.bom_details?.name.toLowerCase().includes(q) || false;
      const matchWc = o.assigned_workstation.toLowerCase().includes(q);
      if (!matchNo && !matchBom && !matchWc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>On Shop Floor</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats?.in_progress_count ?? 1} Active Runs
          </div>
          <span className="text-[11px] text-indigo-400 font-medium">Workstation timers running</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Completed Finished Goods</span>
            <Boxes className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {stats?.total_completed_units ?? 68} Units
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Stocked to WMS Inventory</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Quality Inspection</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {stats?.qa_count ?? 1} Batches
          </div>
          <span className="text-[11px] text-slate-400">Optical metrology stress testing</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Work Centers</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats?.workcenters_count ?? 4} Work Centers
          </div>
          <span className="text-[11px] text-cyan-400">88.4% capacity utilization</span>
        </div>
      </div>

      {/* Action Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'planned', label: 'Planned' },
            { id: 'in_progress', label: 'In Production' },
            { id: 'quality_check', label: 'QA Inspection' },
            { id: 'completed', label: 'Completed' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-colors ${
                statusFilter === s.id
                  ? 'bg-indigo-600 text-white'
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
              placeholder="Search MO, BOM, or Cell..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Production Run</span>
          </button>
        </div>
      </div>

      {/* Production Orders Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Bill of Materials / Product</th>
                <th className="py-3 px-4">Work Center Cell</th>
                <th className="py-3 px-4">Output Units</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Stage Status</th>
                <th className="py-3 px-4 text-right">Shop Floor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No production orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((mo) => {
                  const statusColors: Record<string, string> = {
                    planned: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    in_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                    quality_check: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  };

                  const progressPct =
                    mo.planned_quantity > 0
                      ? Math.min(100, Math.round((mo.completed_quantity / mo.planned_quantity) * 100))
                      : 0;

                  return (
                    <tr key={mo.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {mo.order_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">
                          {mo.bom_details?.name || 'Standard Assembly BOM'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {mo.bom_details?.code || 'BOM-001'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {mo.assigned_workstation}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white">
                            {mo.completed_quantity} / {mo.planned_quantity}
                          </span>
                          <span className="text-[10px] text-slate-400">({progressPct}%)</span>
                        </div>
                        <div className="w-24 bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${mo.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] font-mono text-slate-400">
                        <div>Start: {mo.start_date}</div>
                        <div>Due: {mo.due_date || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            statusColors[mo.status] || 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {mo.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {mo.status === 'planned' && (
                            <button
                              onClick={() => mo.id && handleStartWork(mo.id)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" />
                              <span>Release to Floor</span>
                            </button>
                          )}
                          {mo.status === 'in_progress' && (
                            <button
                              onClick={() => mo.id && handleQA(mo.id)}
                              className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Submit QA</span>
                            </button>
                          )}
                          {mo.status === 'quality_check' && (
                            <button
                              onClick={() => mo.id && handleComplete(mo.id, mo.planned_quantity)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <CheckCheck className="w-3 h-3" />
                              <span>Pass & Auto-Stock</span>
                            </button>
                          )}
                          {mo.status === 'completed' && (
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Finished & Stocked</span>
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

      {/* New Production Order Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <Factory className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Create Manufacturing Work Order</h3>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Bill of Materials (BOM)</label>
                <select
                  value={bomId}
                  onChange={(e) => setBomId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {boms.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.code}] {b.name} (${Number(b.estimated_cost).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Planned Output Units</label>
                  <input
                    type="number"
                    min="1"
                    value={plannedQty}
                    onChange={(e) => setPlannedQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Due Target Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Assigned Work Center</label>
                <select
                  value={workstation}
                  onChange={(e) => setWorkstation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {workcenters.map((w) => (
                    <option key={w.id} value={w.name}>
                      [{w.code}] {w.name} (${w.hourly_rate}/hr)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Production Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500"
                />
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30"
                >
                  Schedule Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
