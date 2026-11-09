'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Warehouse as WarehouseIcon,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Boxes,
  Layers,
  Sparkles,
  DollarSign,
  Package,
} from 'lucide-react';
import { Warehouse, InventoryStats } from '@/lib/types';
import { getWarehouses, getInventoryStats } from '@/lib/inventory-pos-api';

export default function WarehousesFacilitiesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getWarehouses(), getInventoryStats()])
      .then(([whs, st]) => {
        setWarehouses(whs);
        setStats(st);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
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
            <WarehouseIcon className="w-6 h-6 text-teal-400" />
            <span>Warehouse Facilities & Bin Locations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global distribution centers, zone aisles, shelving tiers, and cubic capacity utilization
          </p>
        </div>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {warehouses.map((wh) => {
          const occ = wh.current_occupancy_pct || 65;
          const val = wh.total_valuation || 0;

          return (
            <div
              key={wh.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-6 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-400 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
                      {wh.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active Facility
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white pt-1">{wh.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{wh.address || wh.location}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Total Capacity</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {wh.capacity_sqft.toLocaleString()} sqft
                  </span>
                </div>
              </div>

              {/* Occupancy Meter */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Cubic Space Occupancy:</span>
                  <span className="font-mono font-bold text-teal-400">{occ}% Filled</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      occ > 80 ? 'bg-amber-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${occ}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>SKU Lines: {wh.stock_items_count || 5}</span>
                  <span>Bin Locations: {wh.bins_count || 3}</span>
                  <span>Stored Value: ${val.toLocaleString()}</span>
                </div>
              </div>

              {/* Facility Contacts */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-800 text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">Lead: {wh.manager || 'Operations Director'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">{wh.contact_phone || '+1 (555) 019-2000'}</span>
                </div>
              </div>

              {/* Bin Location Codes */}
              <div className="space-y-2 pt-1 border-t border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-500 block">
                  Configured Storage Zones & Bins
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    `${wh.code}-ZoneA-01-1`,
                    `${wh.code}-ZoneB-03-2`,
                    `${wh.code}-ZoneC-05-1`,
                  ].map((b, idx) => (
                    <code
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-teal-300 font-mono text-[11px]"
                    >
                      {b}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
