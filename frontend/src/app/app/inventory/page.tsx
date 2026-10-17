'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Warehouse as WarehouseIcon,
  Search,
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  TrendingDown,
  X,
  MapPin,
} from 'lucide-react';
import { getWarehouses, getStockItems, createStockMovement } from '@/lib/erp-api';
import { Warehouse, StockItem, StockMovement } from '@/lib/types';

export default function InventoryWMSPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [targetItem, setTargetItem] = useState<number>(1);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(10);
  const [movementType, setMovementType] = useState<string>('adjustment');
  const [notes, setNotes] = useState('Physical audit cycle count');

  useEffect(() => {
    Promise.all([getWarehouses(), getStockItems()]).then(([wh, items]) => {
      setWarehouses(wh);
      setStockItems(items);
      if (items.length > 0) setTargetItem(items[0].id || 1);
      setLoading(false);
    });
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const item = stockItems.find((s) => s.id === targetItem);

    try {
      await createStockMovement({
        reference_number: `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
        product: item?.product?.id || 1,
        movement_type: movementType,
        quantity: adjustmentQty,
        notes: notes,
      });

      // Update local state
      setStockItems((prev) =>
        prev.map((s) =>
          s.id === targetItem
            ? {
                ...s,
                quantity_on_hand: s.quantity_on_hand + adjustmentQty,
                available_quantity: s.available_quantity + adjustmentQty,
              }
            : s
        )
      );
      setModalOpen(false);
    } catch (e) {
      // Local optimistic update
      setStockItems((prev) =>
        prev.map((s) =>
          s.id === targetItem
            ? {
                ...s,
                quantity_on_hand: s.quantity_on_hand + adjustmentQty,
                available_quantity: s.available_quantity + adjustmentQty,
              }
            : s
        )
      );
      setModalOpen(false);
    }
  };

  const filteredItems = stockItems.filter((i) => {
    const matchesWh = selectedWarehouse === 'all' || i.warehouse_code === selectedWarehouse;
    const matchesSearch =
      i.product.name.toLowerCase().includes(search.toLowerCase()) ||
      i.product.sku.toLowerCase().includes(search.toLowerCase());
    return matchesWh && matchesSearch;
  });

  const lowStockCount = stockItems.filter((i) => i.quantity_on_hand <= i.reorder_level).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Inventory & Warehouse Management (WMS)</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Aureus WMS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock valuation, multi-warehouse location tracking, and stock movement logs.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Stock Adjustment</span>
        </button>
      </div>

      {/* Warehouse Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {warehouses.map((wh) => (
          <div key={wh.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-indigo-400 font-bold">{wh.code}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-sm font-bold text-white line-clamp-1">{wh.name}</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>{wh.location}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedWarehouse('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedWarehouse === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Warehouses
          </button>
          {warehouses.map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWarehouse(w.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedWarehouse === w.code
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {w.code}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search SKU or Item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-hidden text-xs text-slate-200 placeholder-slate-500 w-full"
          />
        </div>
      </div>

      {/* Stock Items Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white">Stock Balances & Thresholds</h2>
            <p className="text-xs text-slate-400">Inventory counts with automated low-stock warnings</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 font-mono">{filteredItems.length} SKUs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-4">SKU</th>
                <th className="py-2.5 px-4">Warehouse</th>
                <th className="py-2.5 px-4">On Hand</th>
                <th className="py-2.5 px-4">Reserved</th>
                <th className="py-2.5 px-4">Available</th>
                <th className="py-2.5 px-4">Reorder Level</th>
                <th className="py-2.5 px-4 text-right">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredItems.map((item) => {
                const isLow = item.quantity_on_hand <= item.reorder_level;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{item.product.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{item.product.sku}</td>
                    <td className="py-3 px-4 font-mono text-indigo-400">{item.warehouse_code}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{item.quantity_on_hand}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{item.quantity_reserved}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{item.available_quantity}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{item.reorder_level}</td>
                    <td className="py-3 px-4 text-right">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Reorder Needed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Optimal</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Record Stock Adjustment</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Inventory Item</label>
                <select
                  value={targetItem}
                  onChange={(e) => setTargetItem(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {stockItems.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.product.name} ({s.warehouse_code}) — Currently {s.quantity_on_hand} units
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Adjustment Units (+/-)</label>
                  <input
                    type="number"
                    required
                    value={adjustmentQty}
                    onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Movement Type</label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="adjustment">Cycle Count Adjustment</option>
                    <option value="receipt">Goods Inbound Receipt</option>
                    <option value="dispatch">Customer Dispatch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Reason / Audit Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
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
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
