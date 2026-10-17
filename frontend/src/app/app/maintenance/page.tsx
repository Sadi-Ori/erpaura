'use client';

import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Cpu,
  MapPin,
  X,
} from 'lucide-react';
import { getEquipment, getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest } from '@/lib/erp-api';
import { Equipment, MaintenanceRequest } from '@/lib/types';

export default function MaintenancePage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'equipment'>('requests');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [equipmentId, setEquipmentId] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [technician, setTechnician] = useState('Marcus Vance');

  useEffect(() => {
    Promise.all([getEquipment(), getMaintenanceRequests()]).then(([eq, reqs]) => {
      setEquipmentList(eq);
      setRequests(reqs);
      if (eq.length > 0) setEquipmentId(eq[0].id || 1);
      setLoading(false);
    });
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const targetEq = equipmentList.find((e) => e.id === equipmentId);
    const ticketNo = `MTR-2026-${Math.floor(100 + Math.random() * 900)}`;

    try {
      const created = await createMaintenanceRequest({
        ticket_number: ticketNo,
        equipment: equipmentId,
        title,
        description: description || 'Routine inspection ticket',
        priority,
        status: 'open',
        reported_by: 'Shift Lead',
        assigned_technician: technician,
        scheduled_date: new Date().toISOString().split('T')[0],
      });
      setRequests((prev) => [created, ...prev]);
      resetForm();
    } catch (e) {
      const local: MaintenanceRequest = {
        id: Date.now(),
        ticket_number: ticketNo,
        equipment: equipmentId,
        equipment_details: targetEq,
        title,
        description: description || 'Routine inspection ticket',
        priority,
        status: 'open',
        reported_by: 'Shift Lead',
        assigned_technician: technician,
        scheduled_date: new Date().toISOString().split('T')[0],
      };
      setRequests((prev) => [local, ...prev]);
      resetForm();
    }
  };

  const handleResolve = async (reqId?: number) => {
    if (!reqId) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'resolved' } : r))
    );

    try {
      await updateMaintenanceRequest(reqId, { status: 'resolved' });
    } catch (e) {
      console.error('Failed to update ticket in Django', e);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Maintenance & Asset Registry</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Aureus Maintenance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track industrial equipment, schedule preventive maintenance calibrations, and log machine breakdown tickets.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Repair Ticket</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'requests' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Maintenance Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'equipment' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Equipment Assets ({equipmentList.length})
        </button>
      </div>

      {/* Tab 1: Maintenance Requests Table */}
      {activeTab === 'requests' ? (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">Active Service Tickets</h2>
              <p className="text-xs text-slate-400">Scheduled technician work orders</p>
            </div>
            <span className="text-xs font-semibold text-amber-400 font-mono">
              {requests.filter((r) => r.status !== 'resolved').length} Open
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Ticket #</th>
                  <th className="py-2.5 px-4">Equipment</th>
                  <th className="py-2.5 px-4">Issue Description</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Technician</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">{r.ticket_number}</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {r.equipment_details?.name || 'Heavy Equipment'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{r.title}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.priority === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        r.priority === 'high' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">{r.assigned_technician || 'Marcus Vance'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' :
                        r.status === 'in_progress' ? 'bg-indigo-500/20 text-indigo-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {r.status !== 'resolved' ? (
                        <button
                          onClick={() => handleResolve(r.id)}
                          className="px-2.5 py-1 rounded text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                        >
                          Resolve Ticket ✓
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold">Closed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 2: Equipment Assets */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipmentList.map((eq) => (
            <div key={eq.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-400">[{eq.code}]</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{eq.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  eq.status === 'operational' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {eq.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="text-slate-200">{eq.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="text-slate-200">{eq.location}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inspection Frequency:</span>
                  <span className="capitalize text-indigo-400 font-semibold">{eq.maintenance_frequency}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] flex justify-between text-slate-500">
                <span>In-charge: {eq.technician_in_charge || 'Staff Engineer'}</span>
                <span>Next: {eq.next_maintenance_date || 'Upcoming'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Maintenance Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Log Maintenance Request</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Equipment Asset</label>
                <select
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      [{eq.code}] {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spindle Vibration or Hydraulic Pressure Drop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="low">Low (Routine)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical (Breakdown)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Technician</label>
                  <select
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Marcus Vance">Marcus Vance</option>
                    <option value="Elena Rostova">Elena Rostova</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Diagnostic Notes</label>
                <textarea
                  rows={2}
                  placeholder="Details of symptoms or scheduled checklist..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
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
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
