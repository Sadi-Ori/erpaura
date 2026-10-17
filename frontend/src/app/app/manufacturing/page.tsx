'use client';

import React, { useState, useEffect } from 'react';
import {
  Factory,
  Plus,
  Layers,
  Wrench,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  X,
} from 'lucide-react';
import { getBillOfMaterials, getProductionOrders, updateProductionOrder } from '@/lib/erp-api';
import { BillOfMaterials, ProductionOrder } from '@/lib/types';

export default function ManufacturingMRPPage() {
  const [boms, setBoms] = useState<BillOfMaterials[]>([]);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'boms'>('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBillOfMaterials(), getProductionOrders()]).then(([b, o]) => {
      setBoms(b);
      setOrders(o);
      setLoading(false);
    });
  }, []);

  const handleAdvanceStage = async (order: ProductionOrder) => {
    const nextStatus =
      order.status === 'planned' ? 'in_production' :
      order.status === 'in_production' ? 'quality_check' :
      order.status === 'quality_check' ? 'completed' : 'completed';

    const completedUnits = nextStatus === 'completed' ? order.planned_quantity : order.completed_quantity;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: nextStatus, completed_quantity: completedUnits } : o
      )
    );

    if (order.id) {
      try {
        await updateProductionOrder(order.id, {
          status: nextStatus,
          completed_quantity: completedUnits,
        });
      } catch (e) {
        console.error('Failed to update MO stage in Django', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Manufacturing Management (MRP)</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Aureus Shop Floor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bill of Materials (BOM) formulas, work center routing, and shop-floor manufacturing order tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Work Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('boms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'boms' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Bill of Materials ({boms.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Active Work Orders</span>
          <div className="text-2xl font-bold text-white">
            {orders.filter((o) => o.status !== 'completed').length} In Progress
          </div>
          <div className="text-[11px] text-slate-500">Shop floor assembly stations</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Units Planned</span>
          <div className="text-2xl font-bold text-indigo-400">
            {orders.reduce((acc, curr) => acc + curr.planned_quantity, 0)} Units
          </div>
          <div className="text-[11px] text-slate-500">Across active batches</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">BOM Formulas Defined</span>
          <div className="text-2xl font-bold text-purple-400">{boms.length} Finished SKUs</div>
          <div className="text-[11px] text-slate-500">Multi-component assembly recipes</div>
        </div>
      </div>

      {/* Tab 1: Manufacturing / Production Orders */}
      {activeTab === 'orders' ? (
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">Shop Floor Production Orders</h2>
              <p className="text-xs text-slate-400">Scheduled work orders across assembly work centers</p>
            </div>
            <span className="text-xs font-semibold text-purple-400 font-mono">{orders.length} MOs</span>
          </div>

          <div className="space-y-3">
            {orders.map((order) => {
              const progress = Math.round((order.completed_quantity / order.planned_quantity) * 100);

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">{order.order_number}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                        order.status === 'in_production' ? 'bg-indigo-500/20 text-indigo-300' :
                        order.status === 'quality_check' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-white">
                      {order.bom_details?.name || 'Enterprise Server Appliance Assembly'}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Station: <strong className="text-slate-300">{order.assigned_workstation}</strong></span>
                      <span>•</span>
                      <span>Start: <strong className="text-slate-300">{order.start_date}</strong></span>
                    </div>
                  </div>

                  {/* Progress Bar & Actions */}
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="w-36 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>{order.completed_quantity}/{order.planned_quantity} Units</span>
                        <span className="font-bold text-purple-400">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {order.status !== 'completed' && (
                      <button
                        onClick={() => handleAdvanceStage(order)}
                        className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span>
                          {order.status === 'planned' ? 'Start Production →' :
                           order.status === 'in_production' ? 'Send to QA Check →' :
                           'Pass QA & Stock ✓'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Tab 2: Bill of Materials (BOM) */
        <div className="space-y-4">
          {boms.map((bom) => (
            <div key={bom.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-400">[{bom.code}]</span>
                    <h3 className="text-base font-bold text-white">{bom.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{bom.notes}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Estimated Unit Cost</span>
                  <div className="text-lg font-bold text-emerald-400">${parseFloat(String(bom.estimated_cost)).toFixed(2)}</div>
                </div>
              </div>

              {/* Components Recipe Table */}
              <div className="rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Raw Material / Component</th>
                      <th className="py-2.5 px-4">Quantity Required</th>
                      <th className="py-2.5 px-4">Unit Measure</th>
                      <th className="py-2.5 px-4">Unit Cost</th>
                      <th className="py-2.5 px-4 text-right">Sub-total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {bom.components?.map((c) => (
                      <tr key={c.id}>
                        <td className="py-2.5 px-4 font-semibold text-white">{c.material_name}</td>
                        <td className="py-2.5 px-4 font-mono">{c.quantity_required}</td>
                        <td className="py-2.5 px-4 text-slate-400">{c.unit_of_measure}</td>
                        <td className="py-2.5 px-4 font-mono">${parseFloat(String(c.unit_cost)).toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">
                          ${(parseFloat(String(c.quantity_required)) * parseFloat(String(c.unit_cost))).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
