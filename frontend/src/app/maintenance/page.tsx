'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Cpu,
  X,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  User,
} from 'lucide-react';
import {
  getMaintenanceRequests,
  getEquipmentList,
  createMaintenanceRequest,
  startMaintenanceWork,
  markWaitingParts,
  resolveMaintenanceRequest,
  getMaintenanceStats,
} from '@/lib/erp-api';
import { MaintenanceRequest, Equipment, MaintenanceStats } from '@/lib/types';

export default function MaintenanceRequestsPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [equipmentId, setEquipmentId] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('high');
  const [technician, setTechnician] = useState('Mark Sullivan');
  const [toastMsg, setToastMsg] = useState('');

  const loadData = async () => {
    try {
      const [reqData, eqData, statsData] = await Promise.all([
        getMaintenanceRequests(),
        getEquipmentList(),
        getMaintenanceStats(),
      ]);
      setRequests(reqData);
      setEquipment(eqData);
      if (eqData.length > 0 && eqData[0].id) {
        setEquipmentId(eqData[0].id);
      }
      setStats(statsData);
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

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticketNo = `MREQ-2026-${Math.floor(100 + Math.random() * 900)}`;

    try {
      await createMaintenanceRequest({
        ticket_number: ticketNo,
        equipment: equipmentId,
        title,
        description,
        priority,
        status: 'open',
        reported_by: 'Floor Supervisor',
        assigned_technician: technician,
        scheduled_date: new Date().toISOString().split('T')[0],
      });
      setModalOpen(false);
      showToast(`Maintenance Ticket ${ticketNo} created!`);
      setTitle('');
      setDescription('');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Error creating maintenance request');
    }
  };

  const handleStartWork = async (id: number) => {
    const res = await startMaintenanceWork(id);
    showToast(res.message || 'Work order started!');
    loadData();
  };

  const handleHoldParts = async (id: number) => {
    const res = await markWaitingParts(id);
    showToast(res.message || 'Ticket put on hold for parts.');
    loadData();
  };

  const handleResolve = async (id: number) => {
    const notes = prompt('Enter technician resolution notes:', 'Repaired, calibrated, and safety tested.');
    if (notes === null) return;
    const res = await resolveMaintenanceRequest(id, notes);
    showToast(res.message || 'Ticket resolved and equipment restored to service!');
    loadData();
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchNo = r.ticket_number.toLowerCase().includes(q);
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchEq = r.equipment_details?.name.toLowerCase().includes(q) || false;
      if (!matchNo && !matchTitle && !matchEq) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-amber-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Plant Operational Availability</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats?.operational_rate ?? 80.0}%
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">
            {stats?.operational_count ?? 4} of {stats?.total_equipment ?? 5} assets operational
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Critical Breakdowns</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">
            {stats?.critical_requests ?? 1} Critical
          </div>
          <span className="text-[11px] text-slate-400">Immediate technician response</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Under Maintenance / Hold</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {(stats?.in_progress_requests || 0) + (stats?.waiting_parts_requests || 0)} Tickets
          </div>
          <span className="text-[11px] text-slate-400">In shop or waiting on parts</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Resolved This Period</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats?.resolved_requests ?? 1} Closed
          </div>
          <span className="text-[11px] text-cyan-400">Verified and restored</span>
        </div>
      </div>

      {/* Action Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Tickets' },
            { id: 'open', label: 'Open' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'waiting_parts', label: 'Waiting Parts' },
            { id: 'resolved', label: 'Resolved' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-colors ${
                statusFilter === s.id
                  ? 'bg-amber-600 text-white'
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
              placeholder="Search Ticket, Title, Asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Report Breakdown</span>
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Equipment / Asset</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assigned Tech</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Maintenance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No maintenance tickets match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const priorityColors: Record<string, string> = {
                    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-extrabold',
                    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30 font-bold',
                    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    low: 'bg-slate-800 text-slate-400 border-slate-700',
                  };

                  const statusColors: Record<string, string> = {
                    open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    waiting_parts: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                  };

                  return (
                    <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {req.ticket_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">
                          {req.equipment_details?.name || 'Equipment ID #' + req.equipment}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {req.equipment_details?.code || 'ASSET-001'} • {req.equipment_details?.location || 'Plant Floor'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-semibold text-white truncate">{req.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">{req.description}</div>
                        {req.notes && (
                          <div className="text-[10px] text-emerald-400 font-mono mt-0.5 truncate">
                            {req.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${
                            priorityColors[req.priority] || 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {req.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 font-medium">
                        {req.assigned_technician || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            statusColors[req.status] || 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {req.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.status === 'open' && (
                            <button
                              onClick={() => req.id && handleStartWork(req.id)}
                              className="px-2.5 py-1 rounded-lg bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white border border-amber-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" />
                              <span>Start Repair</span>
                            </button>
                          )}
                          {req.status === 'in_progress' && (
                            <>
                              <button
                                onClick={() => req.id && handleHoldParts(req.id)}
                                className="px-2 py-1 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                                title="Hold for Parts"
                              >
                                <Pause className="w-3 h-3" />
                                <span>Parts Hold</span>
                              </button>
                              <button
                                onClick={() => req.id && handleResolve(req.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Resolve</span>
                              </button>
                            </>
                          )}
                          {req.status === 'waiting_parts' && (
                            <button
                              onClick={() => req.id && handleStartWork(req.id)}
                              className="px-2.5 py-1 rounded-lg bg-amber-600/20 text-amber-400 hover:bg-amber-600 hover:text-white border border-amber-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Resume Work</span>
                            </button>
                          )}
                          {req.status === 'resolved' && (
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Restored</span>
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

      {/* New Maintenance Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-amber-400">
              <Wrench className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Report Equipment Breakdown / Service</h3>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Equipment Asset</label>
                <select
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                >
                  {equipment.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      [{eq.code}] {eq.name} ({eq.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Issue Summary / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Spindle Vibration and Thermal Sensor Overheating"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Priority Severity</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="critical">Critical (Machine Breakdown)</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low (Routine)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Assigned Technician</label>
                  <input
                    type="text"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Detailed Symptoms / Failure Notes</label>
                <textarea
                  rows={3}
                  placeholder="Observed error codes, fluid leaks, noise signatures..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  required
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
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-600/30"
                >
                  Dispatch Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
