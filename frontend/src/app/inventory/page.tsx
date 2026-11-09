'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  Package,
  DollarSign,
  ArrowRightLeft,
  X,
  Filter,
  Layers,
  Edit3,
} from 'lucide-react';
import { StockItem, Warehouse, InventoryStats } from '@/lib/types';
import { getStockItems, getWarehouses, getInventoryStats, adjustStockItem } from '@/lib/inventory-pos-api';

export default function InventoryStockPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modal: Physical Count Adjustment
  const [adjustItem, setAdjustItem] = useState<StockItem | null>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('Physical cycle count audit');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stocks, whs, st] = await Promise.all([
        getStockItems(selectedWarehouse !== 'ALL' ? { warehouse: selectedWarehouse } : undefined),
        getWarehouses(),
        getInventoryStats(),
      ]);
      setStockItems(stocks);
      setWarehouses(whs);
      setStats(st);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWarehouse]);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem || !adjustItem.id) return;
    setSubmitting(true);
    try {
      await adjustStockItem(adjustItem.id, {
        new_quantity: parseInt(newQuantity, 10),
        reason: adjustReason,
        performed_by: 'Inventory Specialist',
      });
      setToastMessage(`Stock updated to ${newQuantity} units for ${adjustItem.product?.name}`);
      setAdjustItem(null);
      setNewQuantity('');
      await loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to adjust inventory.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = stockItems.filter((item) => {
    if (lowStockOnly && !item.is_low_stock) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        (item.product?.name && item.product.name.toLowerCase().includes(q)) ||
        (item.product?.sku && item.product.sku.toLowerCase().includes(q)) ||
        (item.warehouse_name && item.warehouse_name.toLowerCase().includes(q)) ||
        (item.bin_code && item.bin_code.toLowerCase().includes(q));
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-teal-400" />
            <span>Stock Balances & Multi-Warehouse Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-location inventory levels, safety thresholds, and bin allocations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/inventory/movements"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>New Transfer</span>
          </Link>
          <Link
            href="/inventory/warehouses"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/30 transition-all"
          >
            <span>Warehouse Facilities</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Total Stock on Hand</span>
          <div className="text-2xl font-black font-mono text-white">
            {stats?.total_units?.toLocaleString() ?? 3788} Units
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 4 fulfillment facilities</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Total Inventory Value</span>
          <div className="text-2xl font-black font-mono text-teal-400">
            ${stats ? stats.total_valuation.toLocaleString() : '73,496'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">FIFO weighted landed valuation</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Low Stock Alerts</span>
          <div className="text-2xl font-black font-mono text-amber-400">
            {stats?.low_stock_count ?? 1} SKUs
          </div>
          <p className="text-[11px] text-slate-500 mt-1">At or below reorder threshold</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Active Warehouses</span>
          <div className="text-2xl font-black font-mono text-indigo-400">
            {stats?.total_warehouses ?? 4} Hubs
          </div>
          <p className="text-[11px] text-slate-500 mt-1">US & European logistics depots</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-3xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by SKU, item name, bin code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-hidden focus:border-teal-500 cursor-pointer"
          >
            <option value="ALL">All Warehouses ({warehouses.length})</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                [{w.code}] {w.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setLowStockOnly(!lowStockOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              lowStockOnly
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Only</span>
          </button>
        </div>
      </div>

      {/* Stock Items Ledger Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/50 text-slate-400 font-mono text-[10px] uppercase border-y border-slate-800">
              <tr>
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Bin Location</th>
                <th className="py-3 px-4">On Hand</th>
                <th className="py-3 px-4">Reserved</th>
                <th className="py-3 px-4">Reorder At</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No stock records matching criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{item.product?.name || 'Item'}</div>
                      <div className="font-mono text-[10px] text-teal-400">{item.product?.sku}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="font-mono text-xs font-semibold">{item.warehouse_code}</span>
                      <span className="text-[11px] text-slate-500 block">{item.warehouse_name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {item.bin_code || 'General Staging'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                      {item.quantity_on_hand}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {item.quantity_reserved}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {item.reorder_level} units
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      ${parseFloat(String(item.unit_cost || 0)).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-teal-400">
                      ${(item.total_inventory_value || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.quantity_on_hand <= 0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : item.is_low_stock
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {item.quantity_on_hand <= 0 ? 'Out of Stock' : item.is_low_stock ? 'Low Stock' : 'Optimal'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustItem(item);
                          setNewQuantity(String(item.quantity_on_hand));
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-teal-400" />
                        <span>Audit Count</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Physical Count Stock Adjustment */}
      {adjustItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-teal-400">
                <Edit3 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Physical Count Stock Adjustment</h3>
              </div>
              <button
                onClick={() => setAdjustItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="font-bold text-white text-sm">{adjustItem.product?.name}</div>
              <div className="flex justify-between text-slate-400">
                <span>Warehouse:</span>
                <span className="font-semibold text-slate-200">{adjustItem.warehouse_name} ({adjustItem.warehouse_code})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Current Recorded Quantity:</span>
                <span className="font-mono font-bold text-white">{adjustItem.quantity_on_hand} units</span>
              </div>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">New Physical Counted Quantity</label>
                <input
                  type="number"
                  required
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono font-bold text-lg focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Audit Reconciliation Reason</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustItem(null)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/30 transition-all"
                >
                  {submitting ? 'Updating...' : 'Save Audit Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
