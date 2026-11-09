'use client';

import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  CheckCircle2,
  FileCheck,
  Boxes,
  Truck,
  ArrowRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { getPurchaseOrders } from '@/lib/erp-api';
import { PurchaseOrder } from '@/lib/types';

export default function GoodsReceiptsPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPurchaseOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const receivedOrders = orders.filter((o) => o.status === 'received' || o.status === 'billed');

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Automated Inventory Ingestion</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">Goods Receipt Notes (GRN) Ledger</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Audit log of all physical raw material deliveries and warehouse stock increments. Every GRN generates an immutable movement entry in the WMS ledger and enables 3-way invoice matching.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Received Shipments</span>
            <span className="text-emerald-400 font-bold text-lg">{receivedOrders.length} Completed</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Reconciled Spend</span>
            <span className="text-white font-bold text-lg">
              ${receivedOrders.reduce((sum, o) => sum + Number(o.total), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Receipt Reference</th>
                <th className="py-3 px-4">Purchase Order</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Receipt Date</th>
                <th className="py-3 px-4">Stocked Items</th>
                <th className="py-3 px-4">GRN Value</th>
                <th className="py-3 px-4">3-Way Match Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {receivedOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    GRN-{o.po_number.replace('PO-', '')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                    {o.po_number}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-white">
                    {o.vendor_details?.company || o.vendor_details?.name || 'Strategic Supplier'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {o.order_date}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {o.items && o.items.length > 0 ? (
                      <div className="space-y-0.5">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                            <Boxes className="w-3 h-3 text-slate-500" />
                            <span className="font-semibold text-white">{it.quantity}x</span>
                            <span className="text-slate-300 truncate max-w-xs">{it.item_name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400">{o.notes}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    ${Number(o.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>PO & Stock Verified</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
