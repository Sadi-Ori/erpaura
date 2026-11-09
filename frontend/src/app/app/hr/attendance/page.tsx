'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import HRSubNav from '../HRSubNav';
import { AttendanceRecord, Employee } from '@/lib/types';
import { getAttendanceRecords, getEmployees, clockInOut } from '@/lib/hr-payroll-api';

export default function AttendanceRegisterPage() {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [clockMsg, setClockMsg] = useState('');

  // Clock simulator
  const [simEmployeeId, setSimEmployeeId] = useState<number>(1);

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDate(todayStr);
    loadData(todayStr);
  }, []);

  const loadData = async (dateStr?: string) => {
    setLoading(true);
    const [att, emp] = await Promise.all([
      getAttendanceRecords(dateStr ? { date: dateStr } : undefined),
      getEmployees(),
    ]);
    setAttendances(att);
    setEmployees(emp);
    if (emp.length > 0) setSimEmployeeId(emp[0].id || 1);
    setLoading(false);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    loadData(newDate);
  };

  const handleClockSim = async () => {
    const res = await clockInOut(simEmployeeId);
    if (res && res.message) {
      setClockMsg(res.message);
      setTimeout(() => setClockMsg(''), 4000);
      loadData(selectedDate);
    }
  };

  const filtered = attendances.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const presentCount = attendances.filter((a) => a.status === 'present').length;
  const lateCount = attendances.filter((a) => a.status === 'late').length;
  const onLeaveCount = attendances.filter((a) => a.status === 'on_leave').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Attendance & Shift Time Register
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Live Biometric & Badge Feed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automated clock-in / clock-out tracking, shift durations, late arrival computation, and biometric badge synchronization.
          </p>
        </div>

        {/* Quick Clock-in Simulation Widget */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
          <select
            value={simEmployeeId}
            onChange={(e) => setSimEmployeeId(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-hidden"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.first_name} {e.last_name} ({e.employee_id})
              </option>
            ))}
          </select>
          <button
            onClick={handleClockSim}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Clock In/Out</span>
          </button>
        </div>
      </div>

      <HRSubNav />

      {clockMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{clockMsg}</span>
        </div>
      )}

      {/* Date & Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">Register Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {['all', 'present', 'late', 'on_leave'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-emerald-400 font-bold">{presentCount} Present</span>
          <span className="text-slate-700">&bull;</span>
          <span className="text-amber-400 font-bold">{lateCount} Late</span>
          <span className="text-slate-700">&bull;</span>
          <span className="text-purple-400 font-bold">{onLeaveCount} Leave</span>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4 text-center">Duration</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Remarks / Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading attendance entries for {selectedDate}...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No attendance records logged for {selectedDate}.
                  </td>
                </tr>
              ) : (
                filtered.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-white block text-sm">{att.employee_name}</span>
                        <span className="font-mono text-cyan-400 text-[10px]">{att.employee_id}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-300">
                      {att.department_name}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {att.clock_in ? att.clock_in.slice(0, 5) : '—'}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {att.clock_out ? att.clock_out.slice(0, 5) : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-white">
                      {att.working_hours} hrs
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        att.status === 'present'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                          : att.status === 'late'
                          ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                          : 'bg-purple-950/60 text-purple-300 border-purple-500/30'
                      }`}>
                        {att.status === 'late' ? `Late (${att.late_minutes}m)` : att.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {att.notes || 'Biometric Door Entry 01'}
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
