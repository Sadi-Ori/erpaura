'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Clock,
  CalendarCheck2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  Plus,
  X,
  Printer,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useEmployee } from './EmployeeContext';
import { createTimeOffRequest } from '@/lib/hr-payroll-api';
import { PayrollEntry } from '@/lib/types';

export default function EmployeeDashboardPage() {
  const {
    selectedEmployee,
    todayAttendance,
    leaveBalances,
    recentPayroll,
    recentLeaves,
    recentAttendance,
    punchClock,
    refreshData,
    loading,
  } = useEmployee();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [punching, setPunching] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Time off modal state
  const [leaveModalOpen, setLeaveModalOpen] = useState<boolean>(false);
  const [submittingLeave, setSubmittingLeave] = useState<boolean>(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'ANNUAL',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reason: '',
  });

  // Payslip modal state
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollEntry | null>(null);

  // Real-time ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePunchClock = async () => {
    setPunching(true);
    try {
      const res = await punchClock();
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setToastMessage('Failed to punch clock. Please try again.');
    } finally {
      setPunching(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !selectedEmployee.id) return;
    setSubmittingLeave(true);
    try {
      const start = new Date(leaveForm.start_date);
      const end = new Date(leaveForm.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      await createTimeOffRequest({
        employee: selectedEmployee.id,
        leave_type: leaveForm.leave_type as any,
        start_date: leaveForm.start_date,
        end_date: leaveForm.end_date,
        days_requested: diffDays > 0 ? diffDays : 1,
        reason: leaveForm.reason,
      });

      setToastMessage('Leave application submitted successfully for manager approval.');
      setLeaveModalOpen(false);
      setLeaveForm({
        leave_type: 'ANNUAL',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        reason: '',
      });
      await refreshData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setToastMessage('Error submitting leave request.');
    } finally {
      setSubmittingLeave(false);
    }
  };

  if (loading || !selectedEmployee) {
    return (
      <div className="py-24 text-center text-sm text-slate-400 flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading employee personnel profile...</span>
      </div>
    );
  }

  const isClockedIn = todayAttendance && todayAttendance.clock_in && !todayAttendance.clock_out;
  const isClockedOut = todayAttendance && todayAttendance.clock_in && todayAttendance.clock_out;

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Welcome & Punch Clock Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-emerald-600/20">
                {selectedEmployee.first_name[0]}{selectedEmployee.last_name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Welcome back, {selectedEmployee.full_name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {selectedEmployee.job_title} • {selectedEmployee.department_name || 'Engineering'} • ID:{' '}
                  <span className="font-mono text-emerald-400">{selectedEmployee.employee_id}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLeaveModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Apply for Leave</span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Reporting Manager</span>
              <span className="font-semibold text-slate-200">{selectedEmployee.manager_name || 'Department Lead'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Employment Type</span>
              <span className="font-semibold text-slate-200 capitalize">
                {selectedEmployee.employment_type ? selectedEmployee.employment_type.replace('_', ' ') : 'Full Time'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Date of Joining</span>
              <span className="font-semibold text-slate-200">{selectedEmployee.hire_date}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Work Location</span>
              <span className="font-semibold text-slate-200">{selectedEmployee.city}, {selectedEmployee.country}</span>
            </div>
          </div>
        </div>

        {/* Live Punch Clock Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-slate-400">Live Attendance Punch Clock</span>
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Real-Time</span>
              </span>
            </div>
            <div className="text-2xl font-black font-mono tracking-tight text-white">{currentTime || '--:--:--'}</div>
            <p className="text-[11px] text-slate-400">{currentDate || 'Today'}</p>
          </div>

          {/* Punch Clock Status Display */}
          <div className="my-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span>Today&apos;s Status:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                  isClockedIn
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : isClockedOut
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isClockedIn ? 'Clocked In' : isClockedOut ? 'Clocked Out for the Day' : 'Not Clocked In'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Clock In:</span>
              <span className="font-mono text-white">{todayAttendance?.clock_in ? todayAttendance.clock_in.substring(0, 5) : '--:--'}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Clock Out:</span>
              <span className="font-mono text-white">{todayAttendance?.clock_out ? todayAttendance.clock_out.substring(0, 5) : '--:--'}</span>
            </div>

            {todayAttendance?.working_hours ? (
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-850">
                <span>Total Worked:</span>
                <span className="font-mono text-emerald-400 font-bold">{todayAttendance.working_hours} hrs</span>
              </div>
            ) : null}
          </div>

          {/* Action Button */}
          <button
            onClick={handlePunchClock}
            disabled={punching || Boolean(isClockedOut)}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
              isClockedOut
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isClockedIn
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {punching
                ? 'Registering Punch...'
                : isClockedOut
                ? 'Attendance Completed'
                : isClockedIn
                ? 'Punch Clock Out'
                : 'Punch Clock In'}
            </span>
          </button>
        </div>
      </div>

      {/* Leave Quota Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Annual Leave */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Annual Paid Leave</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {leaveBalances?.annual_remaining ?? 15} / {leaveBalances?.annual_quota ?? 20} Days
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
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
          <p className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Used this year: {leaveBalances?.annual_used ?? 5} days</span>
            <span className="text-emerald-400 font-semibold">Available</span>
          </p>
        </div>

        {/* Sick Leave */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Medical & Sick Leave</span>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {leaveBalances?.sick_remaining ?? 8} / {leaveBalances?.sick_quota ?? 10} Days
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
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
          <p className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Used this year: {leaveBalances?.sick_used ?? 2} days</span>
            <span className="text-indigo-400 font-semibold">Protected</span>
          </p>
        </div>

        {/* Casual Leave */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Casual Personal Leave</span>
            <span className="text-xs font-mono font-bold text-purple-400">
              {leaveBalances?.casual_remaining ?? 4} / {leaveBalances?.casual_quota ?? 5} Days
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
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
          <p className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Used this year: {leaveBalances?.casual_used ?? 1} days</span>
            <span className="text-purple-400 font-semibold">Emergency</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Profile Details + Attendance & Payslips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personnel Information Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>My Employment Details</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">CONFIDENTIAL</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Work Email</span>
                  <span className="text-white font-medium">{selectedEmployee.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Phone</span>
                  <span className="text-white font-medium">{selectedEmployee.phone || '+1 (555) 019-2831'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Address</span>
                  <span className="text-white font-medium">{selectedEmployee.address || 'Corporate Tower, Floor 4'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-3">
                <span className="text-[10px] uppercase font-mono text-emerald-400 block font-semibold">
                  Compensation & Bank Record
                </span>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Basic Monthly Salary:</span>
                  <span className="font-mono font-bold text-white">
                    ${parseFloat(String(selectedEmployee.basic_salary || '0')).toLocaleString()} / mo
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Direct Deposit Bank:</span>
                  <span className="font-medium text-white">{selectedEmployee.bank_name || 'Chase Bank'}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Account Number:</span>
                  <span className="font-mono text-white">
                    {selectedEmployee.bank_account_number
                      ? `•••• ${selectedEmployee.bank_account_number.slice(-4)}`
                      : '•••• 8821'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Tax Identification:</span>
                  <span className="font-mono text-slate-400">{selectedEmployee.tax_id || 'TAX-9281-US'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">
                  Emergency Contact
                </span>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="font-semibold text-white">
                    {selectedEmployee.emergency_contact_name || 'Primary Next of Kin'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {selectedEmployee.emergency_contact_phone || '+1 (555) 998-1029'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Recent Attendance & Monthly Payslips */}
        <div className="lg:col-span-2 space-y-8">
          {/* Monthly Payslips Register */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Recent Monthly Payslips</span>
                </h3>
                <p className="text-xs text-slate-400">Itemized allowances, statutory taxes, and digital vouchers</p>
              </div>
              <Link
                href="/employees/payslips"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/50 text-slate-400 font-mono text-[10px] uppercase border-y border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3">Payslip #</th>
                    <th className="py-2.5 px-3">Gross</th>
                    <th className="py-2.5 px-3">Deductions</th>
                    <th className="py-2.5 px-3">Net Pay</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentPayroll.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-500">
                        No payroll vouchers generated for this employee yet.
                      </td>
                    </tr>
                  ) : (
                    recentPayroll.slice(0, 4).map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-semibold text-white">{pay.period_label}</td>
                        <td className="py-3 px-3 font-mono text-slate-400">{pay.payslip_number}</td>
                        <td className="py-3 px-3 font-mono text-slate-300">${parseFloat(String(pay.gross_salary)).toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono text-rose-400">-${parseFloat(String(pay.total_deductions)).toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                          ${parseFloat(String(pay.net_salary)).toLocaleString()}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              pay.status === 'PAID'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {pay.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedPayslip(pay)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Voucher</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Attendance Logs */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Recent Attendance Ledger</span>
                </h3>
                <p className="text-xs text-slate-400">Punch in/out timestamps and calculated working hours</p>
              </div>
              <Link
                href="/employees/attendance"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                <span>Full History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/50 text-slate-400 font-mono text-[10px] uppercase border-y border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Clock In</th>
                    <th className="py-2.5 px-3">Clock Out</th>
                    <th className="py-2.5 px-3">Hours</th>
                    <th className="py-2.5 px-3">Late Mins</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {recentAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">
                        No attendance logs found.
                      </td>
                    </tr>
                  ) : (
                    recentAttendance.slice(0, 5).map((att) => (
                      <tr key={att.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-white">{att.date}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-400">
                          {att.clock_in ? att.clock_in.substring(0, 5) : '--:--'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {att.clock_out ? att.clock_out.substring(0, 5) : '--:--'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{att.working_hours || '--'} hrs</td>
                        <td className="py-2.5 px-3 font-mono text-amber-400">{att.late_minutes ? `${att.late_minutes}m` : '-'}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              att.status === 'PRESENT'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : att.status === 'LATE'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Apply for Leave Modal */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <CalendarCheck2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Apply for Time-Off / Leave</h3>
              </div>
              <button
                onClick={() => setLeaveModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Leave Category</label>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="ANNUAL">Annual Paid Vacation (15 Available)</option>
                  <option value="SICK">Medical & Sick Leave (8 Available)</option>
                  <option value="CASUAL">Casual Personal Leave (4 Available)</option>
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
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Reason & Handover Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide context for manager review and any team coverage details..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLeaveModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  className="px-5 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all"
                >
                  {submittingLeave ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Digital Payslip Voucher Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none">
            {/* Header with Print and Close buttons (hidden on print) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                Aura ERP • Digital Salary Voucher
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Branded Payslip Document */}
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                      A
                    </div>
                    <span className="font-extrabold text-lg tracking-tight text-slate-900">
                      Aura<span className="text-emerald-600">ERP</span> Global Inc.
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">100 Innovation Way, Suite 400 • Palo Alto, CA 94301</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Payslip Voucher</span>
                  <span className="font-mono font-bold text-sm text-slate-900">{selectedPayslip.payslip_number}</span>
                  <p className="text-xs text-slate-500">{selectedPayslip.period_label}</p>
                </div>
              </div>

              {/* Employee Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Employee Name</span>
                  <span className="font-bold text-slate-800">{selectedPayslip.employee_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Employee ID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedPayslip.employee_id}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Designation</span>
                  <span className="font-medium text-slate-700">{selectedPayslip.employee_job}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Disbursed Via</span>
                  <span className="font-medium text-slate-700">{selectedPayslip.payment_method}</span>
                </div>
              </div>

              {/* Itemized Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {/* Allowances */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-emerald-800 text-xs uppercase tracking-wider border-b border-slate-150 pb-2">
                    Earnings & Allowances
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Basic Salary:</span>
                      <span className="font-mono font-semibold">${parseFloat(String(selectedPayslip.basic_salary)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Housing Allowance (20%):</span>
                      <span className="font-mono">${parseFloat(String(selectedPayslip.housing_allowance)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Medical Allowance (10%):</span>
                      <span className="font-mono">${parseFloat(String(selectedPayslip.medical_allowance)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Transport Allowance:</span>
                      <span className="font-mono">${parseFloat(String(selectedPayslip.transport_allowance)).toLocaleString()}</span>
                    </div>
                    {parseFloat(String(selectedPayslip.bonus_allowance)) > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Performance Bonus:</span>
                        <span className="font-mono">+${parseFloat(String(selectedPayslip.bonus_allowance)).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Gross Earnings:</span>
                      <span className="font-mono">${parseFloat(String(selectedPayslip.gross_salary)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-rose-800 text-xs uppercase tracking-wider border-b border-slate-150 pb-2">
                    Statutory Deductions
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Income Tax Withholding (15%):</span>
                      <span className="font-mono text-rose-600">-${parseFloat(String(selectedPayslip.tax_deduction)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Provident Fund (8%):</span>
                      <span className="font-mono text-rose-600">-${parseFloat(String(selectedPayslip.provident_fund)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Health Insurance:</span>
                      <span className="font-mono text-rose-600">-${parseFloat(String(selectedPayslip.health_insurance)).toLocaleString()}</span>
                    </div>
                    {parseFloat(String(selectedPayslip.unpaid_leave_deduction)) > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Unpaid Leave Deductions:</span>
                        <span className="font-mono">-${parseFloat(String(selectedPayslip.unpaid_leave_deduction)).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-rose-700">
                      <span>Total Deductions:</span>
                      <span className="font-mono">-${parseFloat(String(selectedPayslip.total_deductions)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payable Highlight Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-emerald-700 block font-bold">
                    Net Take-Home Pay
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-900">
                    ${parseFloat(String(selectedPayslip.net_salary)).toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                    {selectedPayslip.status}
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-1 font-mono">
                    Direct Credit Confirmed
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">Authorized HR & Payroll Officer</p>
                  <p className="font-mono text-[10px]">Aura ERP Automated Disbursement Engine</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-700">Employee Signature</p>
                  <p className="font-mono text-[10px]">Digitally verified • ID: {selectedPayslip.employee_id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
