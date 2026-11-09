'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeftRight,
  Plus,
  ArrowLeft,
  Search,
  CheckCircle2,
  X,
  Package,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { StockMovement, Warehouse, ProductModule } from '@/lib/types';
import { getStockMovements, getWarehouses, getProductsForPOS, createStockTransfer } from '@/lib/inventory-pos-api';

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<ProductModule[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal: Inter-warehouse transfer
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    product: '',
    from_warehouse: '',
    to_warehouse: '',
    quantity: '10',
    notes: 'Inter-warehouse replenishment transfer',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [mvtList, whList, prodList] = await Promise.all([
        getStockMovements(selectedType !== 'ALL' ? { type: selectedType } : undefined),
        getWarehouses(),
        getProductsForPOS(),
      ]);
      setMovements(mvtList);
      setWarehouses(whList);
      setProducts(prodList);
      if (!form.product && prodList.length > 0 && prodList[0].id) {
        setForm((prev) => ({
          ...prev,
          product: String(prodList[0].id),
          from_warehouse: whList.length > 0 && whList[0].id ? String(whList[0].id) : '',
          to_warehouse: whList.length > 1 && whList[1].id ? String(whList[1].id) : '',
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedType]);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product || !form.from_warehouse || !form.to_warehouse) return;
    setSubmitting(true);
    try {
      const res = await createStockTransfer({
        product: Number(form.product),
        from_warehouse: Number(form.from_warehouse),
        to_warehouse: Number(form.to_warehouse),
        quantity: parseInt(form.quantity, 10),
        notes: form.notes,
        performed_by: 'Logistics Coordinator',
      });
      if (res && res.error) {
        setToastMessage(`Transfer error: ${res.error}`);
      } else {
        setToastMessage(`Successfully transferred ${form.quantity} units.`);
        setTransferModalOpen(false);
        await loadData();
      }
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to create transfer.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMovements = movements.filter((m) => {
    if (selectedType !== 'ALL' && m.movement_type !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        m.reference_number.toLowerCase().includes(q) ||
        (m.product_name && m.product_name.toLowerCase().includes(q)) ||
        (m.notes && m.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-teal-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Stock Ledger</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ArrowLeftRight className="w-6 h-6 text-teal-400" />
            <span>Stock Movements & Inter-Warehouse Transfers</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of goods receipts, warehouse transfers, customer dispatches, and cycle counts
          </p>
        </div>

        <button
          onClick={() => setTransferModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Transfer</span>
        </button>
      </div>

      {/* Filter and Movements Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search reference #, product, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase mr-1">Type:</span>
            {['ALL', 'receipt', 'transfer', 'adjustment', 'pos_sale'].map((tp) => (
              <button
                key={tp}
                onClick={() => setSelectedType(tp)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition-colors ${
                  selectedType === tp
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tp === 'ALL' ? 'All Types' : tp.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Movements Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/50 text-slate-400 font-mono text-[10px] uppercase border-y border-slate-800">
              <tr>
                <th className="py-3 px-4">Reference #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4">Route / Direction</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4 text-right">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No stock movements found matching filter.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-400">
                      {m.reference_number}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {m.timestamp ? new Date(m.timestamp).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{m.product_name || 'Item'}</div>
                      <div className="font-mono text-[10px] text-slate-500">{m.product_sku}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          m.movement_type === 'receipt'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : m.movement_type === 'transfer'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : m.movement_type === 'adjustment'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}
                      >
                        {m.movement_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {m.from_warehouse_name && m.to_warehouse_name ? (
                        <span className="flex items-center gap-1.5">
                          <span>{m.from_warehouse_name}</span>
                          <ArrowRight className="w-3 h-3 text-teal-400" />
                          <span>{m.to_warehouse_name}</span>
                        </span>
                      ) : m.to_warehouse_name ? (
                        <span>Inbound → {m.to_warehouse_name}</span>
                      ) : (
                        <span>Outbound from {m.from_warehouse_name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                      {m.quantity} units
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {m.performed_by || 'Warehouse Operator'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 truncate max-w-xs">
                      {m.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Inter-Warehouse Transfer */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-teal-400">
                <ArrowLeftRight className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Execute Inter-Warehouse Stock Transfer</h3>
              </div>
              <button
                onClick={() => setTransferModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Transfer SKU / Product</label>
                <select
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-teal-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.sku || `SKU-${p.id}`}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Source Warehouse (From)</label>
                  <select
                    value={form.from_warehouse}
                    onChange={(e) => setForm({ ...form, from_warehouse: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-teal-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        [{w.code}] {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Warehouse (To)</label>
                  <select
                    value={form.to_warehouse}
                    onChange={(e) => setForm({ ...form, to_warehouse: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-teal-500"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        [{w.code}] {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Transfer Quantity (Units)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono font-bold text-base focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Transfer Manifest Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Retail store replenishment dispatch shipment #TRF-9821..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/30 transition-all"
                >
                  {submitting ? 'Executing Transfer...' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
