'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Clock,
  DollarSign,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { getWorkCenters } from '@/lib/erp-api';
import { WorkCenter } from '@/lib/types';

export default function WorkCentersPage() {
  const [centers, setCenters] = useState<WorkCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkCenters().then((data) => {
      setCenters(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>Shop Floor Cells & Machining Bays</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">Work Centers & Capacity Planning</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Directory of discrete work cells, assembly lines, automated SMT lines, and QA inspection bays with standard costing rates and daily throughput hours.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Active Cells</span>
            <span className="text-indigo-400 font-bold text-lg">{centers.length} Operational</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Total Shift Capacity</span>
            <span className="text-white font-bold text-lg">
              {centers.reduce((sum, c) => sum + Number(c.capacity_hours_per_day), 0)} hrs/day
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Work Centers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {centers.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  {c.code}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Online & Ready</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{c.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{c.category}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Standard Labor Rate</span>
                <span className="text-base font-bold text-white">${Number(c.hourly_rate).toFixed(2)}/hr</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Shift Availability</span>
                <span className="text-base font-bold text-indigo-300">{Number(c.capacity_hours_per_day)} hrs/day</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Overall Equipment Effectiveness (OEE): 92.4%</span>
              <span className="text-emerald-400 font-semibold">Calibrated</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
