'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck2,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  X,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useEmployee } from '../EmployeeContext';
import { createTimeOffRequest } from '@/lib/hr-payroll-api';

export default function EmployeeLeavePage() {
  const {
    selectedEmployee,
    leaveBalances,
    recentLeaves,
    refreshData,
    loading,
  } = useEmployee();

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    leave_type: 'ANNUAL',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reason: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedEmployee.id) return;
    setSubmitting(true);
    try {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      await createTimeOffRequest({
        employee: selectedEmployee.id,
        leave_type: form.leave_type as any,
        start_date: form.start_date,
        end_date: form.end_date,
        days_requested: diffDays > 0 ? diffDays : 1,
        reason: form.reason,
      });

      setToastMessage('Time-off request submitted to management for review.');
      setModalOpen(false);
      setForm({
        leave_type: 'ANNUAL',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        reason: '',
      });
      await refreshData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setToastMessage('Submission failed. Check network or server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !selectedEmployee) {
    return (
      <div className="py-24 text-center text-sm text-slate-400">
        Loading time-off balances...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/employees"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to ESS Overview</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck2 className="w-6 h-6 text-emerald-400" />
            <span>Time-Off & Leave Quota Portal</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track annual entitlements, monitor pending manager approvals, and apply for time away
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Time-Off</span>
        </button>
      </div>

      {/* Leave Quota Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Annual Leave */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono text-emerald-400 font-semibold block">
                Annual Vacation Quota
              </span>
              <h3 className="text-base font-bold text-white">Paid Annual Leave</h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-emerald-400">
                {leaveBalances?.annual_remaining ?? 15}
              </span>
              <span className="text-xs text-slate-500 block">Days Left</span>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (((leaveBalances?.annual_remaining ?? 15) / (leaveBalances?.annual_quota ?? 20)) * 100)
                )}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span>Quota: {leaveBalances?.annual_quota ?? 20} days</span>
            <span>Used: {leaveBalances?.annual_used ?? 5} days</span>
          </div>
        </div>

        {/* Sick Leave */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono text-indigo-400 font-semibold block">
                Health & Wellness
              </span>
              <h3 className="text-base font-bold text-white">Medical / Sick Leave</h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-indigo-400">
                {leaveBalances?.sick_remaining ?? 8}
              </span>
              <span className="text-xs text-slate-500 block">Days Left</span>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (((leaveBalances?.sick_remaining ?? 8) / (leaveBalances?.sick_quota ?? 10)) * 100)
                )}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span>Quota: {leaveBalances?.sick_quota ?? 10} days</span>
            <span>Used: {leaveBalances?.sick_used ?? 2} days</span>
          </div>
        </div>

        {/* Casual Leave */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono text-purple-400 font-semibold block">
                Personal Contingency
              </span>
              <h3 className="text-base font-bold text-white">Casual Leave</h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-purple-400">
                {leaveBalances?.casual_remaining ?? 4}
              </span>
              <span className="text-xs text-slate-500 block">Days Left</span>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (((leaveBalances?.casual_remaining ?? 4) / (leaveBalances?.casual_quota ?? 5)) * 100)
                )}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span>Quota: {leaveBalances?.casual_quota ?? 5} days</span>
            <span>Used: {leaveBalances?.casual_used ?? 1} days</span>
          </div>
        </div>
      </div>

      {/* Leave Application History Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Leave Application History</h3>
          <p className="text-xs text-slate-400">Submitted requests, reviewer status, and managerial comments</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/50 text-slate-400 font-mono text-[10px] uppercase border-y border-slate-800">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Reviewer Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No time-off requests submitted yet.
                  </td>
                </tr>
              ) : (
                recentLeaves.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white capitalize">
                      {req.leave_type.toLowerCase()} Leave
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {req.start_date} → {req.end_date}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {req.days_requested} {req.days_requested === 1 ? 'day' : 'days'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : req.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 italic">
                      {req.manager_comment || 'Pending manager evaluation'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Apply for Time-Off */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <CalendarCheck2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Apply for Time-Off / Leave</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Leave Category</label>
                <select
                  value={form.leave_type}
                  onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="ANNUAL">Annual Paid Vacation ({leaveBalances?.annual_remaining ?? 15} Available)</option>
                  <option value="SICK">Medical & Sick Leave ({leaveBalances?.sick_remaining ?? 8} Available)</option>
                  <option value="CASUAL">Casual Personal Leave ({leaveBalances?.casual_remaining ?? 4} Available)</option>
                  <option value="UNPAID">Unpaid Leave</option>
                  <option value="MATERNITY">Maternity / Paternity Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Reason & Coverage Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the context of your leave and any arrangements made with colleagues..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
