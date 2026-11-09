'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Milestone as MilestoneIcon,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  X,
  FileCheck2,
  Layers,
} from 'lucide-react';
import { Project, Milestone } from '@/lib/types';
import { getProjects, getMilestones, createMilestone } from '@/lib/projects-api';

export default function MilestonesPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    project: '',
    title: '',
    description: '',
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    deliverables: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [projList, msList] = await Promise.all([
        getProjects(),
        getMilestones(selectedProjectId !== 'ALL' ? { project: selectedProjectId } : undefined),
      ]);
      setProjects(projList);
      setMilestones(msList);
      if (!form.project && projList.length > 0 && projList[0].id) {
        setForm((prev) => ({ ...prev, project: String(projList[0].id) }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createMilestone({
        project: Number(form.project),
        title: form.title,
        description: form.description,
        due_date: form.due_date,
        deliverables: form.deliverables,
        status: 'pending',
        progress_percentage: 0,
      });
      setToastMessage('Milestone phase added to project roadmap.');
      setModalOpen(false);
      setForm({
        project: projects.length > 0 && projects[0].id ? String(projects[0].id) : '',
        title: '',
        description: '',
        due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        deliverables: '',
      });
      await loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to create milestone.');
    } finally {
      setSubmitting(false);
    }
  };

  const completedCount = milestones.filter((m) => m.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portfolio</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MilestoneIcon className="w-6 h-6 text-indigo-400" />
            <span>Milestones & Release Roadmap</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Phase gates, deliverable criteria, release targets, and contractual milestones
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.code}] {p.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Total Milestones</span>
          <div className="text-2xl font-black font-mono text-white">{milestones.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across active portfolio roadmaps</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Delivered Gates</span>
          <div className="text-2xl font-black font-mono text-emerald-400">{completedCount} Completed</div>
          <p className="text-[11px] text-slate-500 mt-1">Signed off by stakeholders</p>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Roadmap Progress</span>
          <div className="text-2xl font-black font-mono text-indigo-400">
            {milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Cumulative delivery velocity</p>
        </div>
      </div>

      {/* Milestones Timeline List */}
      <div className="space-y-4">
        {milestones.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
            No milestones configured for the selected project.
          </div>
        ) : (
          milestones.map((m, idx) => (
            <div
              key={m.id || idx}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-slate-700 transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {m.project_code || 'PROJECT'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      m.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : m.status === 'in_progress'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {m.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{m.title}</h3>
                <p className="text-xs text-slate-400">{m.description || 'Target release phase.'}</p>

                {m.deliverables && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 text-xs text-slate-300 flex items-start gap-2 mt-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 block">Deliverables Criteria</span>
                      <span>{m.deliverables}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Progress Meter & Due Date */}
              <div className="w-full sm:w-64 space-y-2 shrink-0 sm:text-right">
                <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">Due Date:</span>
                  <span className="font-mono font-semibold text-white">{m.due_date}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between sm:justify-end gap-2 text-xs">
                    <span className="text-slate-400 text-[11px]">Completion:</span>
                    <span className="font-mono font-bold text-emerald-400">{m.progress_percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${m.progress_percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: New Milestone */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <MilestoneIcon className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Add Project Milestone</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Project</label>
                <select
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Milestone Phase Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phase 2: Production DNS Cutover"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Due Date</label>
                <input
                  type="date"
                  required
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Scope & Objective</label>
                <textarea
                  rows={2}
                  placeholder="High-level description of this milestone..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Key Deliverables & Acceptance Criteria</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Terraform manifests, security sign-off, canary 100% traffic..."
                  value={form.deliverables}
                  onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
                >
                  {submitting ? 'Adding Milestone...' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
