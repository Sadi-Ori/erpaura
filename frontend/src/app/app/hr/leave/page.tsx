'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Plus,
  Users,
  Clock,
  AlertCircle,
  X,
  Send,
  MessageSquare,
} from 'lucide-react';
import HRSubNav from '../HRSubNav';
import { TimeOffRequest, Employee } from '@/lib/types';
import {
  getTimeOffRequests,
  getEmployees,
  approveTimeOffRequest,
  rejectTimeOffRequest,
  createTimeOffRequest,
} from '@/lib/hr-payroll-api';

export default function LeaveManagementPage() {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Submit modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<number>(1);
  const [leaveType, setLeaveType] = useState('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [daysRequested, setDaysRequested] = useState(3);
  const [leaveReason, setLeaveReason] = useState('Personal time off');

  useEffect(() => {
    const today = new Date();
    setStartDate(today.toISOString().split('T')[0]);
    const future = new Date(today.getTime() + 3 * 86400000);
    setEndDate(future.toISOString().split('T')[0]);
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [reqs, emps] = await Promise.all([getTimeOffRequests(), getEmployees()]);
    setRequests(reqs);
    setEmployees(emps);
    if (emps.length > 0) setSelectedEmpId(emps[0].id || 1);
    setLoading(false);
  };

  const handleApprove = async (id: number) => {
    const res = await approveTimeOffRequest(id, 'Approved by Management');
    if (res) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
    }
  };

  const handleReject = async (id: number) => {
    const res = await rejectTimeOffRequest(id, 'Declined due to sprint delivery coverage');
    if (res) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)));
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await createTimeOffRequest({
      employee: selectedEmpId,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      days_requested: Number(daysRequested),
      reason: leaveReason,
      status: 'pending',
    });
    setSaving(false);
    if (res) {
      loadData();
      setCreateModalOpen(false);
    }
  };

  const filtered = requests.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Leave & Time-Off Approvals
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Absence Governance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review employee time-off applications, audit leave entitlement quotas, and approve annual PTO or medical leaves.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Submit Leave Application</span>
        </button>
      </div>

      <HRSubNav />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">Filter By Status:</span>
        {['all', 'pending', 'approved', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-all ${
              statusFilter === st
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Leave Requests Queue */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs animate-pulse">
            Loading leave applications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No time-off requests in this queue</h3>
            <p className="text-xs text-slate-400">All pending employee absence requests have been reviewed.</p>
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">{req.employee_name}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700 capitalize">
                    {req.leave_type} Leave
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    req.status === 'approved'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                      : req.status === 'rejected'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                      : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-3">
                  <span>Duration: <strong className="text-white">{req.start_date}</strong> to <strong className="text-white">{req.end_date}</strong> ({req.days_requested} days)</span>
                  <span>&bull;</span>
                  <span>Department: <strong className="text-slate-300">{req.employee_department}</strong></span>
                </div>

                {req.reason && (
                  <p className="text-xs text-slate-300 italic pt-1">
                    &quot;{req.reason}&quot;
                  </p>
                )}

                {req.manager_comment && (
                  <p className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span>Manager Note: {req.manager_comment}</span>
                  </p>
                )}
              </div>

              {/* Approval Actions */}
              {req.status === 'pending' && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReject(req.id!)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                  <button
                    onClick={() => handleApprove(req.id!)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Request</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* Leave Balances Matrix */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Annual Employee Leave Quotas & Entitlements (2026)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Annual PTO Quota</th>
                <th className="py-2.5 px-3">PTO Used</th>
                <th className="py-2.5 px-3">PTO Balance</th>
                <th className="py-2.5 px-3">Sick Leave Balance</th>
                <th className="py-2.5 px-3">Casual Leave Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-white">
                    {emp.first_name} {emp.last_name} ({emp.employee_id})
                  </td>
                  <td className="py-3 px-3 font-mono">{emp.leave_balance?.annual_quota ?? 22} days</td>
                  <td className="py-3 px-3 font-mono text-amber-400">{emp.leave_balance?.annual_used ?? 3} days</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    {emp.leave_balance?.annual_remaining ?? 19} days
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {emp.leave_balance?.sick_remaining ?? 9} / {emp.leave_balance?.sick_quota ?? 10} days
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {emp.leave_balance?.casual_remaining ?? 5} / {emp.leave_balance?.casual_quota ?? 5} days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Submit Leave Modal */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Submit Staff Leave Application</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Employee *</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} ({e.job_title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Leave Classification</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                >
                  <option value="paid">Paid Annual Vacation (PTO)</option>
                  <option value="sick">Medical / Sick Leave</option>
                  <option value="casual">Casual / Emergency Day</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="parental">Parental Care</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Days Count</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={daysRequested}
                    onChange={(e) => setDaysRequested(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Absence Reason</label>
                <textarea
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Reason for time off..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  {saving ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
