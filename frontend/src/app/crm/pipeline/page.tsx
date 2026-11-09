'use client';

import React, { useState, useEffect } from 'react';
import {
  Kanban,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Building,
  Sparkles,
} from 'lucide-react';
import { getLeads, moveLeadStage, markLeadWon, markLeadLost } from '@/lib/erp-api';
import { Lead } from '@/lib/types';

const STAGES = [
  { id: 'new', label: 'New Lead', color: 'border-blue-500/30 bg-blue-500/5' },
  { id: 'qualification', label: 'Qualification', color: 'border-indigo-500/30 bg-indigo-500/5' },
  { id: 'demo_scheduled', label: 'Live Demo', color: 'border-cyan-500/30 bg-cyan-500/5' },
  { id: 'proposal', label: 'Proposal Sent', color: 'border-amber-500/30 bg-amber-500/5' },
  { id: 'negotiation', label: 'Negotiation', color: 'border-purple-500/30 bg-purple-500/5' },
  { id: 'won', label: 'Closed Won 🎉', color: 'border-emerald-500/30 bg-emerald-500/5' },
];

export default function PipelineKanbanPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  const loadLeads = async () => {
    try {
      const data = await getLeads();
      setLeads(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleMove = async (leadId: number, newStage: string) => {
    const res = await moveLeadStage(leadId, newStage);
    showToast(res.message || 'Stage updated');
    loadLeads();
  };

  const handleWon = async (leadId: number) => {
    const res = await markLeadWon(leadId);
    showToast(res.message || 'Deal closed as Won! 🎉');
    loadLeads();
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-purple-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
            <Kanban className="w-3.5 h-3.5" />
            <span>Interactive Deal Board</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">Visual Opportunity Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Track deal stages from first touch qualification through executive proposal and final contract negotiation. Shift deals across stages in 1-click.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Active Pipeline</span>
            <span className="text-purple-400 font-bold text-lg">
              ${leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost').reduce((sum, l) => sum + Number(l.estimated_value), 0).toLocaleString()}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Closed Won</span>
            <span className="text-emerald-400 font-bold text-lg">
              ${leads.filter((l) => l.stage === 'won').reduce((sum, l) => sum + Number(l.estimated_value), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 6-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start overflow-x-auto pb-4">
        {STAGES.map((col, colIdx) => {
          const colLeads = leads.filter((l) => l.stage === col.id);
          const colTotal = colLeads.reduce((sum, l) => sum + Number(l.estimated_value), 0);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-3 flex flex-col space-y-3 min-w-[220px] ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <span className="text-xs font-bold text-white block">{col.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ${colTotal.toLocaleString()}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {colLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2.5">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-sm transition-all space-y-2 text-xs"
                  >
                    <div className="font-bold text-white leading-snug">{lead.title}</div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                      <Building className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{lead.contact_name || 'Enterprise Account'}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
                      <span className="font-bold text-white">
                        ${Number(lead.estimated_value).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-purple-400 font-semibold">
                        {lead.probability_percentage}% win
                      </span>
                    </div>

                    {/* Left/Right Shift Buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                      {colIdx > 0 ? (
                        <button
                          onClick={() => lead.id && handleMove(lead.id, STAGES[colIdx - 1].id)}
                          className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white"
                          title={`Move to ${STAGES[colIdx - 1].label}`}
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      ) : (
                        <div />
                      )}

                      {col.id !== 'won' && (
                        <button
                          onClick={() => lead.id && handleWon(lead.id)}
                          className="text-[10px] font-bold text-emerald-400 hover:underline px-1"
                        >
                          Win 🎉
                        </button>
                      )}

                      {colIdx < STAGES.length - 1 ? (
                        <button
                          onClick={() => lead.id && handleMove(lead.id, STAGES[colIdx + 1].id)}
                          className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white"
                          title={`Move to ${STAGES[colIdx + 1].label}`}
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
