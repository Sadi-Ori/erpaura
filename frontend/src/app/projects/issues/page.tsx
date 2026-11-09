'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bug,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowLeft,
  X,
  Search,
  Filter,
  User,
  Calendar,
  Layers,
  FileQuestion,
} from 'lucide-react';
import { Issue, Project, Task } from '@/lib/types';
import { getIssues, getProjects, getTasks, createIssue, resolveIssue } from '@/lib/projects-api';

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [resolveModalIssue, setResolveModalIssue] = useState<Issue | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    project: '',
    title: '',
    description: '',
    severity: 'minor',
    reported_by: 'QA Engineer',
    assigned_to: '',
    steps_to_reproduce: '',
  });

  const [resolutionNotes, setResolutionNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [issueList, projList, taskList] = await Promise.all([
        getIssues(selectedSeverity !== 'ALL' ? { severity: selectedSeverity } : undefined),
        getProjects(),
        getTasks(),
      ]);
      setIssues(issueList);
      setProjects(projList);
      setTasks(taskList);
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
  }, [selectedSeverity]);

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.project) return;
    setSubmitting(true);
    try {
      await createIssue({
        project: Number(form.project),
        title: form.title,
        description: form.description,
        severity: form.severity,
        status: 'open',
        reported_by: form.reported_by,
        assigned_to: form.assigned_to,
        steps_to_reproduce: form.steps_to_reproduce,
      });
      setToastMessage('Defect logged in issue tracker.');
      setReportModalOpen(false);
      setForm({
        project: projects.length > 0 && projects[0].id ? String(projects[0].id) : '',
        title: '',
        description: '',
        severity: 'minor',
        reported_by: 'QA Engineer',
        assigned_to: '',
        steps_to_reproduce: '',
      });
      await loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to report issue.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalIssue || !resolveModalIssue.id) return;
    try {
      await resolveIssue(resolveModalIssue.id, resolutionNotes);
      setToastMessage(`Issue #${resolveModalIssue.id} marked as resolved.`);
      setResolveModalIssue(null);
      setResolutionNotes('');
      await loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to resolve issue.');
    }
  };

  // Filtered issues
  const filteredIssues = issues.filter((iss) => {
    if (selectedStatus !== 'ALL' && iss.status !== selectedStatus) return false;
    if (selectedSeverity !== 'ALL' && iss.severity !== selectedSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        iss.title.toLowerCase().includes(q) ||
        (iss.project_code && iss.project_code.toLowerCase().includes(q)) ||
        (iss.reported_by && iss.reported_by.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const criticalCount = issues.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
  const openCount = issues.filter((i) => i.status === 'open' || i.status === 'investigating').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length;

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
            <Bug className="w-6 h-6 text-rose-400" />
            <span>Bug & Issue Tracking Register</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Capture defect reproduction steps, assign engineering ownership, and track resolution workflows
          </p>
        </div>

        <button
          onClick={() => setReportModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report Defect</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Open Issues</span>
          <div className="text-2xl font-black font-mono text-white">{openCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Requiring engineering investigation</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-rose-400 font-semibold block mb-1">Critical Blockers</span>
          <div className="text-2xl font-black font-mono text-rose-400">{criticalCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Production impact / P0 severity</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Resolved Defects</span>
          <div className="text-2xl font-black font-mono text-emerald-400">{resolvedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Verified by QA test suite</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Resolution Rate</span>
          <div className="text-2xl font-black font-mono text-indigo-400">
            {issues.length > 0 ? Math.round((resolvedCount / issues.length) * 100) : 100}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Defect turnaround velocity</p>
        </div>
      </div>

      {/* Filter and Issues List */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search defects by title, reporter, project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase mr-1">Severity:</span>
            {['ALL', 'critical', 'major', 'minor'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition-colors ${
                  selectedSeverity === sev
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs italic">
              No defect tickets matching filter criteria.
            </div>
          ) : (
            filteredIssues.map((iss) => (
              <div
                key={iss.id}
                className="p-5 rounded-2xl bg-slate-950/60 border border-slate-850 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        iss.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : iss.severity === 'major'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {iss.severity}
                    </span>

                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {iss.project_code || 'PRJ'}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        iss.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : iss.status === 'investigating'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {iss.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">{iss.title}</h4>

                  {iss.steps_to_reproduce && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono text-[11px] whitespace-pre-line">
                      {iss.steps_to_reproduce}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span>Reported by: <strong className="text-slate-300">{iss.reported_by}</strong></span>
                    <span>•</span>
                    <span>Assigned to: <strong className="text-slate-300">{iss.assigned_to || 'Unassigned'}</strong></span>
                  </div>
                </div>

                <div className="shrink-0">
                  {iss.status !== 'resolved' ? (
                    <button
                      onClick={() => setResolveModalIssue(iss)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      Resolve Defect
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Report Defect */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <Bug className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Log Defect / Issue Ticket</h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportIssue} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Project</label>
                <select
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-rose-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Issue Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory leak in background worker queue during batch export"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-rose-500"
                  >
                    <option value="critical">Critical (Blocker)</option>
                    <option value="major">Major Defect</option>
                    <option value="minor">Minor Issue</option>
                    <option value="cosmetic">Cosmetic / Trivial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assigned Developer</label>
                  <input
                    type="text"
                    placeholder="e.g. Alexander Reed"
                    value={form.assigned_to}
                    onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Steps to Reproduce</label>
                <textarea
                  rows={3}
                  required
                  placeholder="1. Open checkout modal&#10;2. Apply 50% coupon&#10;3. Observe rounding mismatch..."
                  value={form.steps_to_reproduce}
                  onChange={(e) => setForm({ ...form, steps_to_reproduce: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-rose-500 font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all"
                >
                  {submitting ? 'Reporting...' : 'Submit Defect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolve Defect */}
      {resolveModalIssue && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Resolve Defect Ticket</h3>
              </div>
              <button
                onClick={() => setResolveModalIssue(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <span className="font-bold text-white">{resolveModalIssue.title}</span>
            </div>

            <form onSubmit={handleResolveIssue} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Resolution & Fix Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the code fix, commit hash, and verification steps in testing..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResolveModalIssue(null)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
