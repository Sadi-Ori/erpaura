'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Filter,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useEmployee } from '../EmployeeContext';

export default function EmployeeAttendancePage() {
  const {
    selectedEmployee,
    todayAttendance,
    recentAttendance,
    punchClock,
    loading,
  } = useEmployee();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [punching, setPunching] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

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
      setToastMessage('Punch clock failed.');
    } finally {
      setPunching(false);
    }
  };

  if (loading || !selectedEmployee) {
    return (
      <div className="py-24 text-center text-sm text-slate-400">
        Loading attendance records...
      </div>
    );
  }

  const isClockedIn = todayAttendance && todayAttendance.clock_in && !todayAttendance.clock_out;
  const isClockedOut = todayAttendance && todayAttendance.clock_in && todayAttendance.clock_out;

  // Filter attendance
  const filteredAttendance = recentAttendance.filter((rec) => {
    if (selectedStatus === 'ALL') return true;
    return rec.status === selectedStatus;
  });

  const totalPresent = recentAttendance.filter((r) => r.status === 'PRESENT').length;
  const totalLate = recentAttendance.filter((r) => r.status === 'LATE').length;
  const totalHours = recentAttendance.reduce((acc, curr) => acc + (parseFloat(String(curr.working_hours || 0)) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Title */}
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
            <Clock className="w-6 h-6 text-emerald-400" />
            <span>Attendance & Punch Clock Register</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Personal attendance ledger, clock-in timestamps, working hours, and punctuality
          </p>
        </div>

        {/* Live Punch Button */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-white">{currentTime}</div>
            <div className="text-[10px] text-slate-400">
              {isClockedIn ? 'Clocked In' : isClockedOut ? 'Finished for Today' : 'Not Clocked In'}
            </div>
          </div>
          <button
            onClick={handlePunchClock}
            disabled={punching || Boolean(isClockedOut)}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
              isClockedOut
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isClockedIn
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {punching ? 'Recording...' : isClockedIn ? 'Punch Out' : 'Punch In'}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Total Days Present</span>
          <div className="text-2xl font-black font-mono text-emerald-400">{totalPresent}</div>
          <p className="text-[11px] text-slate-500 mt-1">Full shift recorded</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Hours Logged</span>
          <div className="text-2xl font-black font-mono text-white">{totalHours.toFixed(1)} hrs</div>
          <p className="text-[11px] text-slate-500 mt-1">Cumulative duration</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Late Arrivals</span>
          <div className="text-2xl font-black font-mono text-amber-400">{totalLate}</div>
          <p className="text-[11px] text-slate-500 mt-1">Clocked in past 09:15</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Punctuality Score</span>
          <div className="text-2xl font-black font-mono text-indigo-400">
            {recentAttendance.length > 0
              ? `${Math.round(((totalPresent) / recentAttendance.length) * 100)}%`
              : '100%'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">On-time adherence</p>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div>
            <h3 className="text-sm font-bold text-white">Daily Attendance Records</h3>
            <p className="text-xs text-slate-400">Timestamps logged through the web punch simulator or biometrics</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Filter:</span>
            {['ALL', 'PRESENT', 'LATE', 'ABSENT'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  selectedStatus === st
                    ? 'bg-emerald-600 text-white'
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
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Hours Logged</th>
                <th className="py-3 px-4">Late Minutes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No attendance records found matching filter.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{rec.date}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">
                      {rec.clock_in ? rec.clock_in.substring(0, 5) : '--:--'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {rec.clock_out ? rec.clock_out.substring(0, 5) : '--:--'}
                    </td>
                    <td className="py-3 px-4 font-mono text-white font-semibold">
                      {rec.working_hours ? `${rec.working_hours} hrs` : '--'}
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-400">
                      {rec.late_minutes ? `${rec.late_minutes} min` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'PRESENT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : rec.status === 'LATE'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {rec.notes || 'Automated Web Punch'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
