'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Users,
  Target,
  X,
  ArrowRight,
  Sparkles,
  Kanban,
} from 'lucide-react';
import Link from 'next/link';
import {
  getLeads,
  getContacts,
  createLead,
  moveLeadStage,
  markLeadWon,
  markLeadLost,
  getCRMStats,
} from '@/lib/erp-api';
import { Lead, Contact, CRMStats } from '@/lib/types';

export default function CRMOverviewPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [contactId, setContactId] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [estimatedValue, setEstimatedValue] = useState(25000);
  const [stage, setStage] = useState('new');
  const [probability, setProbability] = useState(50);
  const [source, setSource] = useState('Inbound Website Request');
  const [notes, setNotes] = useState('Prospect evaluated cloud vs on-premise deployment.');
  const [toastMsg, setToastMsg] = useState('');

  const loadData = async () => {
    try {
      const [leadsData, contactsData, statsData] = await Promise.all([
        getLeads(),
        getContacts(),
        getCRMStats(),
      ]);
      setLeads(leadsData);
      setContacts(contactsData);
      if (contactsData.length > 0 && contactsData[0].id) {
        setContactId(contactsData[0].id);
      }
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead({
        title,
        contact: contactId,
        estimated_value: estimatedValue,
        stage,
        probability_percentage: probability,
        source,
      });
      setModalOpen(false);
      showToast(`Deal '${title}' registered in pipeline!`);
      setTitle('');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Error registering opportunity.');
    }
  };

  const handleWon = async (id: number) => {
    const res = await markLeadWon(id);
    showToast(res.message || 'Deal closed as Won! 🎉');
    loadData();
  };

  const handleLost = async (id: number) => {
    const res = await markLeadLost(id);
    showToast(res.message || 'Deal marked as Lost.');
    loadData();
  };

  const handleAdvance = async (lead: Lead) => {
    if (!lead.id) return;
    const flow = ['new', 'qualification', 'demo_scheduled', 'proposal', 'negotiation', 'won'];
    const currIdx = flow.indexOf(lead.stage);
    if (currIdx !== -1 && currIdx < flow.length - 1) {
      const nextStage = flow[currIdx + 1];
      const res = await moveLeadStage(lead.id, nextStage);
      showToast(res.message || `Moved to ${nextStage}`);
      loadData();
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (stageFilter !== 'all' && l.stage !== stageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = l.title.toLowerCase().includes(q);
      const matchContact = l.contact_name?.toLowerCase().includes(q) || false;
      const matchSource = l.source.toLowerCase().includes(q);
      if (!matchTitle && !matchContact && !matchSource) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-purple-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${stats?.total_pipeline_value ? stats.total_pipeline_value.toLocaleString() : '154,000'}
          </div>
          <span className="text-[11px] text-purple-400 font-medium">Weighted enterprise deals</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Closed Won Revenue</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ${stats?.won_revenue ? stats.won_revenue.toLocaleString() : '32,000'}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Won: {stats?.won_count ?? 1} closed deals</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Win Conversion Rate</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">
            {stats?.win_rate ?? 100}%
          </div>
          <span className="text-[11px] text-slate-400">High-intent enterprise pipeline</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Customer 360 Accounts</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats?.contacts_count ?? 6} Accounts
          </div>
          <span className="text-[11px] text-amber-400">{stats?.customers_count ?? 2} active clients</span>
        </div>
      </div>

      {/* Action Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Deals' },
            { id: 'new', label: 'New' },
            { id: 'qualification', label: 'Qualification' },
            { id: 'demo_scheduled', label: 'Live Demo' },
            { id: 'proposal', label: 'Proposal' },
            { id: 'negotiation', label: 'Negotiation' },
            { id: 'won', label: 'Won 🎉' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStageFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-colors ${
                stageFilter === s.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search deal or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <Link
            href="/crm/pipeline"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Kanban className="w-4 h-4 text-purple-400" />
            <span>Kanban Board</span>
          </Link>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Deals Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Deal / Opportunity Title</th>
                <th className="py-3 px-4">Customer Contact</th>
                <th className="py-3 px-4">Lead Source</th>
                <th className="py-3 px-4">Estimated Deal Value</th>
                <th className="py-3 px-4">Win Probability</th>
                <th className="py-3 px-4">Pipeline Stage</th>
                <th className="py-3 px-4 text-right">Quick Advance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No deals match the selected stage filter.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const stageColors: Record<string, string> = {
                    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                    qualification: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
                    demo_scheduled: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                    proposal: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    negotiation: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                    won: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    lost: 'bg-slate-800 text-slate-400 border-slate-700',
                  };

                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{lead.title}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">
                          {lead.contact_name || 'Contact ID #' + lead.contact}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {lead.source}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white font-mono">
                        ${Number(lead.estimated_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-purple-300 font-semibold">
                        {lead.probability_percentage}%
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            stageColors[lead.stage] || 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {lead.stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.stage !== 'won' && lead.stage !== 'lost' && (
                            <>
                              <button
                                onClick={() => handleAdvance(lead)}
                                className="px-2 py-1 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                                title="Advance Stage"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => lead.id && handleWon(lead.id)}
                                className="px-2 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                              >
                                Won 🎉
                              </button>
                              <button
                                onClick={() => lead.id && handleLost(lead.id)}
                                className="px-1.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 text-[11px]"
                              >
                                Lost
                              </button>
                            </>
                          )}
                          {lead.stage === 'won' && (
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Closed Won</span>
                            </span>
                          )}
                          {lead.stage === 'lost' && (
                            <span className="text-[11px] text-slate-500 italic">Closed Lost</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Lead Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-purple-400">
              <TrendingUp className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Create New Opportunity</h3>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Deal / Opportunity Title</label>
                <input
                  type="text"
                  placeholder="e.g. Multi-Site WMS Terminal Expansion"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Associated Customer / Account</label>
                <select
                  value={contactId}
                  onChange={(e) => setContactId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company || c.contact_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Estimated Value ($)</label>
                  <input
                    type="number"
                    step="100"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Win Probability (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={probability}
                    onChange={(e) => setProbability(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Initial Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="new">New Opportunity</option>
                    <option value="qualification">Qualification</option>
                    <option value="demo_scheduled">Live Demo</option>
                    <option value="proposal">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Lead Source</label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
