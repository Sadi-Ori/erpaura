'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Calendar,
  CheckCircle2,
  User,
  FolderKanban,
  FileText,
  X,
} from 'lucide-react';
import { getTimesheets, getTasks, createTimesheet } from '@/lib/erp-api';
import { Timesheet, Task } from '@/lib/types';

export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Timer State
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedTaskForTimer, setSelectedTaskForTimer] = useState<number>(1);

  // Manual Log Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [workerName, setWorkerName] = useState('Alex Rivera');
  const [taskId, setTaskId] = useState<number>(1);
  const [workDate, setWorkDate] = useState('');
  const [hours, setHours] = useState('4.0');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setWorkDate(new Date().toISOString().split('T')[0]);
    Promise.all([getTimesheets(), getTasks()]).then(([ts, t]) => {
      setTimesheets(ts);
      setTasks(t);
      if (t.length > 0) {
        setSelectedTaskForTimer(t[0].id || 1);
        setTaskId(t[0].id || 1);
      }
      setLoading(false);
    });
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogTimer = async () => {
    const calculatedHours = (Math.max(seconds, 60) / 3600).toFixed(2);
    const targetTask = tasks.find((t) => t.id === selectedTaskForTimer);

    try {
      const created = await createTimesheet({
        task: selectedTaskForTimer,
        worker_name: 'Alex Rivera',
        work_date: new Date().toISOString().split('T')[0],
        hours: calculatedHours,
        notes: `Recorded via live timer on ${targetTask?.title || 'Task'}`,
      });
      setTimesheets((prev) => [created, ...prev]);
    } catch (e) {
      const local: Timesheet = {
        id: Date.now(),
        task: selectedTaskForTimer,
        task_title: targetTask?.title,
        worker_name: 'Alex Rivera',
        work_date: new Date().toISOString().split('T')[0],
        hours: calculatedHours,
        notes: `Recorded via live timer on ${targetTask?.title || 'Task'}`,
      };
      setTimesheets((prev) => [local, ...prev]);
    }

    setTimerRunning(false);
    setSeconds(0);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetTask = tasks.find((t) => t.id === Number(taskId));

    try {
      const created = await createTimesheet({
        task: Number(taskId),
        worker_name: workerName,
        work_date: workDate,
        hours: hours,
        notes: notes || 'Manual time entry',
      });
      setTimesheets((prev) => [created, ...prev]);
      setNotes('');
      setModalOpen(false);
    } catch (e) {
      const local: Timesheet = {
        id: Date.now(),
        task: Number(taskId),
        task_title: targetTask?.title,
        worker_name: workerName,
        work_date: workDate,
        hours: hours,
        notes: notes || 'Manual time entry',
      };
      setTimesheets((prev) => [local, ...prev]);
      setNotes('');
      setModalOpen(false);
    }
  };

  const totalLoggedHours = timesheets.reduce((acc, curr) => acc + parseFloat(String(curr.hours || 0)), 0);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Timesheets & Hours Tracker</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Aureus Timesheets
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Log time against tasks, track employee productivity, and reconcile billable project allocations.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Manual Entry</span>
        </button>
      </div>

      {/* Live Timer Widget & Summary Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stopwatch Card */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-indigo-400 font-semibold">
              <Clock className="w-4 h-4" />
              <span>Active Work Timer</span>
            </div>
            
            <div className="font-mono text-4xl sm:text-5xl font-black text-white tracking-wider">
              {formatTimer(seconds)}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2">
              <select
                value={selectedTaskForTimer}
                onChange={(e) => setSelectedTaskForTimer(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 max-w-[240px] truncate"
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!timerRunning ? (
              <button
                onClick={() => setTimerRunning(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Timer</span>
              </button>
            ) : (
              <button
                onClick={() => setTimerRunning(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-500 shadow-sm transition-all"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={() => {
                setTimerRunning(false);
                setSeconds(0);
              }}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {seconds > 0 && (
              <button
                onClick={handleLogTimer}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-sm"
              >
                Log This Time
              </button>
            )}
          </div>
        </div>

        {/* Aggregated Hours Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Recorded Hours</span>
            <div className="text-3xl font-extrabold text-white mt-1">
              {totalLoggedHours.toFixed(2)} <span className="text-sm font-normal text-slate-400">hours</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Logged across {timesheets.length} distinct work entries in Django.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs flex justify-between text-slate-400">
            <span>Billable Ratio</span>
            <span className="font-bold text-emerald-400">94.2%</span>
          </div>
        </div>

      </div>

      {/* Timesheet Entries Table */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden space-y-3 p-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white">Logged Work Entries</h2>
            <p className="text-xs text-slate-400">All activity records submitted to the central timesheet database</p>
          </div>
          <span className="text-xs font-semibold text-indigo-400 font-mono">{timesheets.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Worker</th>
                <th className="py-2.5 px-4">Task / Project</th>
                <th className="py-2.5 px-4">Work Date</th>
                <th className="py-2.5 px-4">Hours</th>
                <th className="py-2.5 px-4">Activity Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {timesheets.map((ts) => (
                <tr key={ts.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">
                      {ts.worker_name.charAt(0)}
                    </div>
                    <span>{ts.worker_name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-200">
                    {ts.task_title || `Task #${ts.task}`}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{ts.work_date}</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-400">{ts.hours}h</td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate">{ts.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Manual Timesheet Log</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Worker</label>
                <select
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="Alex Rivera">Alex Rivera</option>
                  <option value="Sophia Chen">Sophia Chen</option>
                  <option value="Marcus Vance">Marcus Vance</option>
                  <option value="Elena Rostova">Elena Rostova</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Target Task</label>
                <select
                  value={taskId}
                  onChange={(e) => setTaskId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    required
                    value={workDate}
                    onChange={(e) => setWorkDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Hours Spent</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Work Notes</label>
                <textarea
                  rows={2}
                  placeholder="Summary of work completed..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
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
                  Submit Timesheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
