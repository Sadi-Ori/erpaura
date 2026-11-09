'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { getEquipmentList } from '@/lib/erp-api';
import { Equipment } from '@/lib/types';

export default function PreventiveSchedulePage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEquipmentList().then((data) => {
      setEquipment(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Condition-Based & Calendar Intervals</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">Preventive Maintenance Schedule</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Proactive service schedule to prevent catastrophic machinery breakdowns, maximize Mean Time Between Failures (MTBF), and enforce manufacturer warranty inspections.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Scheduled Assets</span>
            <span className="text-amber-400 font-bold text-lg">{equipment.length} Tracked</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Compliance Rate</span>
            <span className="text-emerald-400 font-bold text-lg">98.5%</span>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Asset Code</th>
                <th className="py-3 px-4">Equipment Description</th>
                <th className="py-3 px-4">Frequency</th>
                <th className="py-3 px-4">Last Service Completed</th>
                <th className="py-3 px-4">Next Inspection Window</th>
                <th className="py-3 px-4">Assigned Tech</th>
                <th className="py-3 px-4">Readiness Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {equipment.map((eq) => (
                <tr key={eq.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                    {eq.code}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{eq.name}</div>
                    <div className="text-[11px] text-slate-500">{eq.location}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-300 capitalize">
                    {eq.maintenance_frequency}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                    {eq.last_maintenance_date || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-white text-[11px]">
                    {eq.next_maintenance_date || 'Upcoming Sunday Window'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {eq.technician_in_charge || 'Plant Lead'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>On Schedule</span>
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
