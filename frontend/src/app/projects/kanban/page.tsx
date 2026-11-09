'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Kanban,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  ListTodo,
  Tag,
  User,
  X,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react';
import { Project, Task, TaskChecklist } from '@/lib/types';
import { getProjects, getTasks, createTask, moveTaskStatus, logTaskTime, toggleChecklistItem } from '@/lib/projects-api';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'border-slate-700 bg-slate-900/40 text-slate-300' },
  { id: 'in_progress', title: 'In Progress', color: 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300' },
  { id: 'review', title: 'Code Review', color: 'border-purple-500/40 bg-purple-950/20 text-purple-300' },
  { id: 'testing', title: 'QA & Testing', color: 'border-amber-500/40 bg-amber-950/20 text-amber-300' },
  { id: 'done', title: 'Done', color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300' },
];

export default function KanbanBoardPage() {
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get('project');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | string>(initialProjectId || '');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [submittingTask, setSubmittingTask] = useState(false);
  const [logTimeTask, setLogTimeTask] = useState<Task | null>(null);
  const [checklistTask, setChecklistTask] = useState<Task | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New task form
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    priority: 'medium',
    task_type: 'feature',
    status: 'todo',
    estimated_hours: '8.0',
    tags: '',
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  // Log time form
  const [timeForm, setTimeForm] = useState({
    worker_name: 'Current User',
    hours: '2.5',
    work_date: new Date().toISOString().split('T')[0],
    notes: '',
    is_billable: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const projList = await getProjects();
      setProjects(projList);

      const targetId = selectedProjectId || (projList.length > 0 && projList[0].id ? projList[0].id : '');
      if (!selectedProjectId && targetId) {
        setSelectedProjectId(targetId);
      }

      if (targetId) {
        const taskList = await getTasks({ project: targetId });
        setTasks(taskList);
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

  const handleMoveStatus = async (taskId: number | undefined, currentStatus: string, direction: 'next' | 'prev') => {
    if (!taskId) return;
    const currentIndex = COLUMNS.findIndex((c) => c.id === currentStatus);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0 || newIndex >= COLUMNS.length) return;

    const newStatus = COLUMNS[newIndex].id;
    try {
      await moveTaskStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setSubmittingTask(true);
    try {
      await createTask({
        project: Number(selectedProjectId),
        title: taskForm.title,
        description: taskForm.description,
        assigned_to: taskForm.assigned_to || 'Unassigned',
        priority: taskForm.priority,
        task_type: taskForm.task_type,
        status: taskForm.status,
        estimated_hours: taskForm.estimated_hours,
        tags: taskForm.tags,
        due_date: taskForm.due_date,
      });
      setToastMessage('Task created successfully on board.');
      setTaskModalOpen(false);
      setTaskForm({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'medium',
        task_type: 'feature',
        status: 'todo',
        estimated_hours: '8.0',
        tags: '',
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      });
      await loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to create task.');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTimeTask || !logTimeTask.id) return;
    try {
      await logTaskTime(logTimeTask.id, {
        worker_name: timeForm.worker_name,
        hours: parseFloat(timeForm.hours),
        work_date: timeForm.work_date,
        notes: timeForm.notes,
        is_billable: timeForm.is_billable,
      });
      setToastMessage(`Logged ${timeForm.hours} hours successfully.`);
      setLogTimeTask(null);
      setTimeForm({
        worker_name: 'Current User',
        hours: '2.5',
        work_date: new Date().toISOString().split('T')[0],
        notes: '',
        is_billable: true,
      });
      await loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to log work hours.');
    }
  };

  const handleToggleChecklist = async (checkId: number | undefined) => {
    if (!checkId) return;
    try {
      await toggleChecklistItem(checkId);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const currentProject = projects.find((p) => String(p.id) === String(selectedProjectId));

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Bar: Project Switcher & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Link
            href="/projects"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Active Sprint Project</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.title} ({p.progress_percentage}% Done)
                </option>
              ))}
            </select>
          </div>

          {currentProject && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs text-slate-400">
              <span>Manager: <strong className="text-slate-200">{currentProject.manager_name}</strong></span>
              <span>•</span>
              <span>Due: <strong className="text-slate-200">{currentProject.due_date}</strong></span>
            </div>
          )}
        </div>

        <button
          onClick={() => setTaskModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-3xl border ${col.color} p-4 flex flex-col min-h-[600px] shadow-xs`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                <span className="font-bold text-xs uppercase tracking-wider">{col.title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-950/60 border border-slate-800">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="py-12 text-center text-slate-600 text-xs italic">
                    No tasks in {col.title}
                  </div>
                ) : (
                  colTasks.map((t) => {
                    const est = parseFloat(String(t.estimated_hours || 8));
                    const log = parseFloat(String(t.logged_hours || 0));
                    const checkDone = t.completed_checklist_count || 0;
                    const checkTot = t.checklist_count || 0;

                    return (
                      <div
                        key={t.id}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-xs hover:border-slate-700 transition-all space-y-3"
                      >
                        {/* Top: Priority & Type */}
                        <div className="flex items-center justify-between text-[10px]">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                              t.priority === 'urgent'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : t.priority === 'high'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : t.priority === 'low'
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {t.priority}
                          </span>

                          <span className="font-mono text-slate-500 uppercase">{t.task_type || 'task'}</span>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-white leading-snug line-clamp-3">
                          {t.title}
                        </h4>

                        {/* Checklist progress */}
                        {checkTot > 0 && (
                          <button
                            onClick={() => setChecklistTask(t)}
                            className="w-full flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-slate-950/50 border border-slate-850 hover:border-slate-700 text-slate-400"
                          >
                            <span className="flex items-center gap-1.5">
                              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Checklist</span>
                            </span>
                            <span className="font-mono text-slate-300 font-semibold">{checkDone}/{checkTot}</span>
                          </button>
                        )}

                        {/* Logged hours meter */}
                        <div className="space-y-1 text-[11px]">
                          <div className="flex justify-between text-slate-400">
                            <span>Hours Logged:</span>
                            <span className="font-mono text-slate-200">{log} / {est}h</span>
                          </div>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, (log / (est || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Assignee & Actions */}
                        <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-slate-300 truncate max-w-[110px]">
                            <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-indigo-300 shrink-0">
                              {t.assigned_to ? t.assigned_to.slice(0, 2).toUpperCase() : 'UN'}
                            </div>
                            <span className="text-[11px] truncate">{t.assigned_to || 'Unassigned'}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setLogTimeTask(t)}
                              title="Log Time"
                              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={col.id === 'todo'}
                              onClick={() => handleMoveStatus(t.id, t.status, 'prev')}
                              title="Move Left"
                              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={col.id === 'done'}
                              onClick={() => handleMoveStatus(t.id, t.status, 'next')}
                              title="Move Right"
                              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Task */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <Kanban className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Create Sprint Task</h3>
              </div>
              <button
                onClick={() => setTaskModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optimize Redis caching strategy"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Type</label>
                  <select
                    value={taskForm.task_type}
                    onChange={(e) => setTaskForm({ ...taskForm, task_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="feature">Feature</option>
                    <option value="bug">Bug</option>
                    <option value="improvement">Improvement</option>
                    <option value="task">Task</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Estimated Hrs</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={taskForm.estimated_hours}
                    onChange={(e) => setTaskForm({ ...taskForm, estimated_hours: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assignee</label>
                  <input
                    type="text"
                    placeholder="e.g. Elena Rostova"
                    value={taskForm.assigned_to}
                    onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Task Description</label>
                <textarea
                  rows={3}
                  placeholder="Technical acceptance criteria and edge cases..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTask}
                  className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
                >
                  {submittingTask ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Work Time */}
      {logTimeTask && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <Clock className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Log Time on Task</h3>
              </div>
              <button
                onClick={() => setLogTimeTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-mono text-slate-500 block">Target Task</span>
              <span className="font-bold text-white">{logTimeTask.title}</span>
            </div>

            <form onSubmit={handleLogTime} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Worker Name</label>
                  <input
                    type="text"
                    required
                    value={timeForm.worker_name}
                    onChange={(e) => setTimeForm({ ...timeForm, worker_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hours Spent</label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={timeForm.hours}
                    onChange={(e) => setTimeForm({ ...timeForm, hours: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Work Date</label>
                <input
                  type="date"
                  required
                  value={timeForm.work_date}
                  onChange={(e) => setTimeForm({ ...timeForm, work_date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Work Description & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Summary of commit or sprint progress..."
                  value={timeForm.notes}
                  onChange={(e) => setTimeForm({ ...timeForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLogTimeTask(null)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
                >
                  Confirm Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Checklist Drawer */}
      {checklistTask && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <CheckSquare className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Subtask Checklist</h3>
              </div>
              <button
                onClick={() => setChecklistTask(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
              <span className="font-bold text-white">{checklistTask.title}</span>
            </div>

            <div className="space-y-2">
              {checklistTask.checklist_items && checklistTask.checklist_items.length > 0 ? (
                checklistTask.checklist_items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleChecklist(item.id)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.is_completed}
                      onChange={() => {}}
                      className="w-4 h-4 rounded-md accent-indigo-600 cursor-pointer"
                    />
                    <span
                      className={`text-xs ${
                        item.is_completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No checklist items on this task.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setChecklistTask(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
