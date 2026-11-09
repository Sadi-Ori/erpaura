'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  X,
  DollarSign,
  Filter,
  User,
  Calendar,
  Layers,
} from 'lucide-react';
import { Timesheet, Project, Task } from '@/lib/types';
import { getTimesheets, getProjects, getTasks, approveTimesheet, rejectTimesheet, logTaskTime } from '@/lib/projects-api';

export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    task_id: '',
    worker_name: 'Current User',
    hours: '4.0',
    work_date: new Date().toISOString().split('T')[0],
    hourly_rate: '85.00',
    is_billable: true,
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [tsList, projList, taskList] = await Promise.all([
        getTimesheets(selectedStatus !== 'ALL' ? { status: selectedStatus } : undefined),
        getProjects(),
        getTasks(),
      ]);
      setTimesheets(tsList);
      setProjects(projList);
      setTasks(taskList);
      if (!form.task_id && taskList.length > 0 && taskList[0].id) {
        setForm((prev) => ({ ...prev, task_id: String(taskList[0].id) }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const handleApprove = async (id: number | undefined) => {
    if (!id) return;
    try {
      await approveTimesheet(id, 'Project Director');
      setToastMessage('Timesheet approved and added to billable ledger.');
      await loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: number | undefined) => {
    if (!id) return;
    try {
      await rejectTimesheet(id, 'Project Director');
      setToastMessage('Timesheet rejected.');
      await loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.task_id) return;
    setSubmitting(true);
    try {
      await logTaskTime(form.task_id, {
        worker_name: form.worker_name,
        hours: parseFloat(form.hours),
        work_date: form.work_date,
        hourly_rate: parseFloat(form.hourly_rate),
        is_billable: form.is_billable,
        notes: form.notes,
      });
      setToastMessage(`Logged ${form.hours} hours successfully.`);
      setModalOpen(false);
      setForm({
        task_id: tasks.length > 0 && tasks[0].id ? String(tasks[0].id) : '',
        worker_name: 'Current User',
        hours: '4.0',
        work_date: new Date().toISOString().split('T')[0],
        hourly_rate: '85.00',
        is_billable: true,
        notes: '',
      });
      await loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to submit timesheet.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered timesheets
  const filteredTimesheets = timesheets.filter((ts) => {
    if (selectedStatus !== 'ALL' && ts.approval_status !== selectedStatus) return false;
    return true;
  });

  const totalHours = timesheets.reduce((acc, curr) => acc + (parseFloat(String(curr.hours || 0)) || 0), 0);
  const totalCost = timesheets.reduce((acc, curr) => acc + (parseFloat(String(curr.total_cost || 0)) || 0), 0);
  const pendingCount = timesheets.filter((t) => t.approval_status === 'pending').length;

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
            <Clock className="w-6 h-6 text-indigo-400" />
            <span>Timesheets & Billable Hours Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track consultant hours, billable rates, project costs, and manager approval queues
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Work Hours</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Total Hours Logged</span>
          <div className="text-2xl font-black font-mono text-white">{totalHours.toFixed(1)} hrs</div>
          <p className="text-[11px] text-slate-500 mt-1">Across all project sprints</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Billable Value</span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            ${totalCost.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Direct labor costs accrued</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Pending Approvals</span>
          <div className="text-2xl font-black font-mono text-amber-400">{pendingCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting PM authorization</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Average Rate</span>
          <div className="text-2xl font-black font-mono text-indigo-400">$85 / hr</div>
          <p className="text-[11px] text-slate-500 mt-1">Blended consultant billing</p>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div>
            <h3 className="text-sm font-bold text-white">Work Session Entries</h3>
            <p className="text-xs text-slate-400">Audit trail of individual time cards and approval decisions</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Status:</span>
            {['ALL', 'pending', 'approved', 'rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition-colors ${
                  selectedStatus === st
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/50 text-slate-400 font-mono text-[10px] uppercase border-y border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Worker</th>
                <th className="py-3 px-4">Project & Task</th>
                <th className="py-3 px-4">Hours</th>
                <th className="py-3 px-4">Rate / Cost</th>
                <th className="py-3 px-4">Billable</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTimesheets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No timesheet records found matching filter.
                  </td>
                </tr>
              ) : (
                filteredTimesheets.map((ts) => (
                  <tr key={ts.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{ts.work_date}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">{ts.worker_name}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{ts.task_title || 'Sprint Task'}</div>
                      <div className="text-[11px] font-mono text-indigo-400">{ts.project_code}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                      {ts.hours} hrs
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      ${parseFloat(String(ts.hourly_rate || 75)).toLocaleString()}/h • ${parseFloat(String(ts.total_cost || 0)).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {ts.is_billable ? 'Billable' : 'Non-Billable'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ts.approval_status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : ts.approval_status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {ts.approval_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {ts.approval_status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(ts.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(ts.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Work Hours */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <Clock className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Log Work Session Time</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogTime} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Task</label>
                <select
                  value={form.task_id}
                  onChange={(e) => setForm({ ...form, task_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.project_code || 'PRJ'}] {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Worker Name</label>
                  <input
                    type="text"
                    required
                    value={form.worker_name}
                    onChange={(e) => setForm({ ...form, worker_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Work Date</label>
                  <input
                    type="date"
                    required
                    value={form.work_date}
                    onChange={(e) => setForm({ ...form, work_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hours Spent</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={form.hours}
                    onChange={(e) => setForm({ ...form, hours: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    required
                    value={form.hourly_rate}
                    onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Work Description & Notes</label>
                <textarea
                  rows={3}
                  placeholder="Summary of commit, code review, or client deliverables..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                  {submitting ? 'Submitting...' : 'Log Time Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
