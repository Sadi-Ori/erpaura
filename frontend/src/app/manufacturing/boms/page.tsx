'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  Package,
  Boxes,
  X,
  ExternalLink,
} from 'lucide-react';
import { getBillOfMaterials, createBillOfMaterials } from '@/lib/erp-api';
import { BillOfMaterials } from '@/lib/types';

export default function BOMsPage() {
  const [boms, setBoms] = useState<BillOfMaterials[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('450.00');
  const [notes, setNotes] = useState('Standard production discrete bill of materials.');
  const [toastMsg, setToastMsg] = useState('');

  const loadBOMs = async () => {
    try {
      const data = await getBillOfMaterials();
      setBoms(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBOMs();
  }, []);

  const handleCreateBOM = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBillOfMaterials({
        code,
        name,
        finished_product: 1,
        quantity_produced: 1,
        estimated_cost: estimatedCost,
        is_active: true,
        notes,
      });
      setModalOpen(false);
      setToastMsg(`BOM ${code} created successfully!`);
      setTimeout(() => setToastMsg(''), 4000);
      setCode('');
      setName('');
      loadBOMs();
    } catch (err) {
      console.error(err);
      setToastMsg('Failed to create Bill of Materials.');
    }
  };

  const filtered = boms.filter((b) => {
    if (search) {
      const q = search.toLowerCase();
      return b.code.toLowerCase().includes(q) || b.name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white">Bills of Materials (BOM) Architecture</h2>
          <p className="text-xs text-slate-400">
            Multi-level sub-assemblies, raw component lists, unit quantities, and costing rollups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search BOM code or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => {
              setCode(`BOM-AURA-${Math.floor(100 + Math.random() * 900)}`);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create BOM</span>
          </button>
        </div>
      </div>

      {/* BOM Cards */}
      <div className="space-y-4">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                    {b.code}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">• Active Standard Release</span>
                </div>
                <h3 className="text-base font-bold text-white">{b.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{b.notes || 'Engineering BOM specification'}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Standard Unit Cost</span>
                <span className="text-xl font-black text-white">
                  ${Number(b.estimated_cost).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Sub-Components / Component Items */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                <span>Raw Components & Sub-Assemblies</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {b.components && b.components.length > 0 ? (
                  b.components.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="font-medium text-slate-200 truncate pr-2">
                        {c.material_name}
                      </div>
                      <div className="flex items-center gap-3 shrink-0 font-mono">
                        <span className="text-slate-400">
                          {c.quantity_required} {c.unit_of_measure}
                        </span>
                        <span className="font-bold text-indigo-300">
                          ${Number(c.unit_cost).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-xs text-slate-500 italic p-3">
                    Multi-level component items configured automatically via production routing.
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
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

            <div className="flex items-center gap-2 mb-4 text-indigo-400">
              <Layers className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Create Bill of Materials</h3>
            </div>

            <form onSubmit={handleCreateBOM} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">BOM Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">BOM Name / Finished Product Description</label>
                <input
                  type="text"
                  placeholder="e.g. Aura High-Performance Cluster Assembly"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Estimated Unit Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Engineering Notes</label>
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
                  Save Bill of Materials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
