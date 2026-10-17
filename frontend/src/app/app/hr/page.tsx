'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Building,
  Mail,
  Clock,
  X,
} from 'lucide-react';
import { getEmployees, getDepartments, getTimeOffRequests, updateTimeOffRequest, createTimeOffRequest } from '@/lib/erp-api';
import { Employee, Department, TimeOffRequest } from '@/lib/types';

export default function HRPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [timeOffs, setTimeOffs] = useState<TimeOffRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'employees' | 'timeoff'>('employees');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Leave Request Form
  const [employeeId, setEmployeeId] = useState<number>(1);
  const [leaveType, setLeaveType] = useState('paid');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState(3);
  const [reason, setReason] = useState('Personal time off');

  useEffect(() => {
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);
    Promise.all([getEmployees(), getDepartments(), getTimeOffRequests()]).then(([emp, dept, to]) => {
      setEmployees(emp);
      setDepartments(dept);
      setTimeOffs(to);
      if (emp.length > 0) setEmployeeId(emp[0].id || 1);
      setLoading(false);
    });
  }, []);

  const handleUpdateStatus = async (requestId: number, newStatus: 'approved' | 'rejected') => {
    setTimeOffs((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
    );

    try {
      await updateTimeOffRequest(requestId, { status: newStatus });
    } catch (e) {
      console.error('Failed to update leave in Django', e);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === employeeId);

    try {
      const created = await createTimeOffRequest({
        employee: employeeId,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        days_requested: days,
        reason,
        status: 'pending',
      });
      setTimeOffs((prev) => [created, ...prev]);
      setModalOpen(false);
    } catch (e) {
      const local: TimeOffRequest = {
        id: Date.now(),
        employee: employeeId,
        employee_name: emp?.full_name || 'Staff Member',
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        days_requested: days,
        reason,
        status: 'pending',
      };
      setTimeOffs((prev) => [local, ...prev]);
      setModalOpen(false);
    }
  };

  const pendingLeaves = timeOffs.filter((to) => to.status === 'pending');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Human Resources & Workforce (HR)</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Aureus Workforce
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Employee directory, department hierarchies, leave approvals, and talent management.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Request Leave</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Total Workforce</span>
          <div className="text-2xl font-bold text-white">{employees.length} Active Staff</div>
          <div className="text-[11px] text-slate-500">Across {departments.length} departments</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Pending Leave Approvals</span>
          <div className="text-2xl font-bold text-purple-400">{pendingLeaves.length} Requests</div>
          <div className="text-[11px] text-slate-500">Requires supervisor signoff</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Operating Departments</span>
          <div className="text-2xl font-bold text-indigo-400">{departments.length} Divisions</div>
          <div className="text-[11px] text-slate-500">Engineering, Ops & MRP</div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'employees' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Employees ({employees.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('timeoff')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'timeoff' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Leave & Time-Off ({timeOffs.length})</span>
        </button>
      </div>

      {/* Tab 1: Employee Directory */}
      {activeTab === 'employees' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div key={emp.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={emp.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={emp.full_name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">{emp.full_name}</h3>
                  <div className="text-xs text-indigo-400 font-medium">{emp.job_title}</div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Department:</span>
                  <span className="text-slate-200">{emp.department_name || 'Engineering'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="text-slate-200 truncate max-w-[170px]">{emp.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hire Date:</span>
                  <span className="font-mono text-slate-400">{emp.hire_date}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                  {emp.status}
                </span>
                <span className="text-slate-500">Full Access</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Tab 2: Leave & Time-Off Management */
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden space-y-3 p-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">Leave Requests Queue</h2>
              <p className="text-xs text-slate-400">Supervisor approval workflow for employee PTO and sick leave</p>
            </div>
            <span className="text-xs font-semibold text-purple-400 font-mono">{timeOffs.length} Requests</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-4">Leave Type</th>
                  <th className="py-2.5 px-4">Date Range</th>
                  <th className="py-2.5 px-4">Days</th>
                  <th className="py-2.5 px-4">Reason</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Approval Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {timeOffs.map((to) => (
                  <tr key={to.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{to.employee_name || 'Staff Member'}</td>
                    <td className="py-3 px-4 uppercase font-bold text-indigo-400">{to.leave_type}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {to.start_date} → {to.end_date}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{to.days_requested} days</td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{to.reason || 'Personal'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        to.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                        to.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {to.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {to.status === 'pending' && to.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(to.id!, 'approved')}
                            className="px-2 py-1 rounded text-[10px] font-bold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(to.id!, 'rejected')}
                            className="px-2 py-1 rounded text-[10px] font-bold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold capitalize">{to.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Leave Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Submit Leave Request</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Employee</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.job_title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="paid">Paid Time Off (PTO)</option>
                  <option value="sick">Sick / Medical Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="parental">Parental Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Days Requested</label>
                <input
                  type="number"
                  min="1"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Reason</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-sm"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
