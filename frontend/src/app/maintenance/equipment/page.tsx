'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  Search,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  X,
  MapPin,
  Calendar,
  Zap,
} from 'lucide-react';
import { getEquipmentList, registerEquipment, toggleEquipmentStatus } from '@/lib/erp-api';
import { Equipment } from '@/lib/types';

export default function EquipmentRegisterPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('CNC Machining');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('Building 1 - Bay 4');
  const [frequency, setFrequency] = useState('monthly');
  const [technician, setTechnician] = useState('Mark Sullivan');
  const [toastMsg, setToastMsg] = useState('');

  const loadEquipment = async () => {
    try {
      const data = await getEquipmentList();
      setEquipment(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerEquipment({
        code,
        name,
        category,
        serial_number: serialNumber,
        location,
        maintenance_frequency: frequency,
        status: 'operational',
        technician_in_charge: technician,
      });
      setModalOpen(false);
      showToast(`Asset ${code} registered successfully!`);
      setCode('');
      setName('');
      setSerialNumber('');
      loadEquipment();
    } catch (err) {
      console.error(err);
      showToast('Error registering equipment.');
    }
  };

  const handleToggle = async (id: number) => {
    const res = await toggleEquipmentStatus(id);
    showToast(res.message || 'Status updated.');
    loadEquipment();
  };

  const filtered = equipment.filter((eq) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        eq.code.toLowerCase().includes(q) ||
        eq.name.toLowerCase().includes(q) ||
        eq.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-amber-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white">Plant Machinery & Asset Registry</h2>
          <p className="text-xs text-slate-400">
            Real-time physical asset health, locations, service frequencies, and lead technicians.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search asset, code, bay..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => {
              setCode(`EQ-AURA-${Math.floor(100 + Math.random() * 900)}`);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((eq) => {
          const isOperational = eq.status === 'operational';
          return (
            <div
              key={eq.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                    {eq.code}
                  </span>
                  <button
                    onClick={() => eq.id && handleToggle(eq.id)}
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-colors ${
                      isOperational
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                    title="Click to toggle operational status"
                  >
                    <Zap className="w-3 h-3" />
                    <span>{isOperational ? 'Operational' : 'Maintenance'}</span>
                  </button>
                </div>

                <h3 className="text-base font-bold text-white">{eq.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{eq.category}</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{eq.location}</span>
                </div>
                {eq.serial_number && (
                  <div className="font-mono text-[11px] text-slate-500">
                    S/N: {eq.serial_number}
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Frequency: <strong className="text-white capitalize">{eq.maintenance_frequency}</strong></span>
                  <span>Tech: <strong className="text-slate-200">{eq.technician_in_charge || 'Unassigned'}</strong></span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Last: {eq.last_maintenance_date || 'N/A'}</span>
                <span>Next: {eq.next_maintenance_date || 'Scheduled'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-amber-400">
              <Cpu className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Register Plant Machinery</h3>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Asset Tag Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Equipment Name / Model</label>
                <input
                  type="text"
                  placeholder="e.g. Haas VF-4SS Super-Speed Vertical Mill"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Asset Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Serial Number</label>
                  <input
                    type="text"
                    placeholder="MFR-12345"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Plant Location / Bay</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Maintenance Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Assigned Tech Lead</label>
                  <input
                    type="text"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
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
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
