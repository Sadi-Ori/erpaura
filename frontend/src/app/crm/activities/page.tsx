'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity as ActivityIcon,
  Phone,
  Mail,
  Calendar,
  FileText,
  Plus,
  CheckCircle2,
  X,
  User,
  Clock,
} from 'lucide-react';
import { getActivities, getContacts, createActivity } from '@/lib/erp-api';
import { Activity, Contact } from '@/lib/types';

export default function CRMActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form
  const [contactId, setContactId] = useState<number>(1);
  const [type, setType] = useState<'call' | 'meeting' | 'email' | 'note'>('call');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [performer, setPerformer] = useState('Senior Solutions Executive');
  const [toastMsg, setToastMsg] = useState('');

  const loadData = async () => {
    try {
      const [actData, conData] = await Promise.all([
        getActivities(),
        getContacts(),
      ]);
      setActivities(actData);
      setContacts(conData);
      if (conData.length > 0 && conData[0].id) {
        setContactId(conData[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createActivity({
        contact: contactId,
        activity_type: type,
        summary,
        details,
        performed_by: performer,
        performed_at: new Date().toISOString(),
      });
      setModalOpen(false);
      setToastMsg('Activity logged successfully!');
      setTimeout(() => setToastMsg(''), 4000);
      setSummary('');
      setDetails('');
      loadData();
    } catch (err) {
      console.error(err);
      setToastMsg('Failed to log activity.');
    }
  };

  const getIcon = (actType: string) => {
    switch (actType) {
      case 'call':
        return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'email':
        return <Mail className="w-4 h-4 text-blue-400" />;
      default:
        return <FileText className="w-4 h-4 text-amber-400" />;
    }
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

      {/* Header Info Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
            <ActivityIcon className="w-3.5 h-3.5" />
            <span>Customer Touchpoints & Engagement</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">Interaction Activity Timeline</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Audit history of all scheduled calls, executive meetings, quotation emails, and deal notes recorded across client accounts.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Activity</span>
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        {activities.map((act) => (
          <div
            key={act.id}
            className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              {getIcon(act.activity_type)}
            </div>

            <div className="flex-1 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{act.summary}</span>
                <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(act.performed_at).toLocaleDateString()}</span>
                </span>
              </div>

              <div className="text-slate-400">
                Contact: <strong className="text-purple-300">{act.contact_name || 'Account'}</strong>
                {act.lead_title && <span> • Deal: <strong className="text-slate-300">{act.lead_title}</strong></span>}
              </div>

              {act.details && (
                <p className="text-slate-300 text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800/60 mt-2">
                  {act.details}
                </p>
              )}

              <div className="text-[11px] text-slate-500 pt-1">
                Recorded by: <span className="text-slate-400 font-medium">{act.performed_by}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-purple-400">
              <ActivityIcon className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Log Interaction Touchpoint</h3>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Account / Contact</label>
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

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Activity Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                >
                  <option value="call">Phone Call</option>
                  <option value="meeting">Client Meeting / Demo</option>
                  <option value="email">Email Dispatched</option>
                  <option value="note">Internal Account Note</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Summary Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Executive Architecture Alignment Call"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Meeting Notes / Minutes</label>
                <textarea
                  rows={3}
                  placeholder="Discussed pricing tiers, custom connectors, rollout timelines..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Account Executive / Representative</label>
                <input
                  type="text"
                  value={performer}
                  onChange={(e) => setPerformer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
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
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
