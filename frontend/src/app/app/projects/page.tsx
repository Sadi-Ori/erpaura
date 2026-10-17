'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Plus,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Kanban,
  ListFilter,
  Calendar,
  X,
} from 'lucide-react';
import { getProjects, getTasks, createTask, updateTask } from '@/lib/erp-api';
import { Project, Task } from '@/lib/types';

export default function ProjectsPMSPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeProject, setActiveProject] = useState<string>('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newAssignedTo, setNewAssignedTo] = useState('Alex Rivera');
  const [newHours, setNewHours] = useState('8.0');

  useEffect(() => {
    Promise.all([getProjects(), getTasks()]).then(([p, t]) => {
      setProjects(p);
      if (p.length > 0) setActiveProject(p[0].code);
      setTasks(t);
      setLoading(false);
    });
  }, []);

  const currentProject = projects.find((p) => p.code === activeProject) || projects[0];

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (e) {
      console.error('Failed to update task status in Django', e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await createTask({
        project: currentProject?.id || 1,
        title: newTitle,
        priority: newPriority,
        assigned_to: newAssignedTo,
        estimated_hours: parseFloat(newHours) || 8,
        status: 'todo',
      });
      setTasks((prev) => [created, ...prev]);
      setNewTitle('');
      setModalOpen(false);
    } catch (e) {
      // Fallback local update
      const localTask: Task = {
        id: Date.now(),
        title: newTitle,
        priority: newPriority,
        assigned_to: newAssignedTo,
        estimated_hours: newHours,
        logged_hours: 0,
        status: 'todo',
        project_code: currentProject?.code,
      };
      setTasks((prev) => [localTask, ...prev]);
      setNewTitle('');
      setModalOpen(false);
    }
  };

  const columns = [
    { key: 'todo', label: 'To Do', color: 'border-slate-700 bg-slate-900/50' },
    { key: 'in_progress', label: 'In Progress', color: 'border-indigo-500/40 bg-indigo-950/20' },
    { key: 'review', label: 'Quality Review', color: 'border-purple-500/40 bg-purple-950/20' },
    { key: 'done', label: 'Completed', color: 'border-emerald-500/40 bg-emerald-950/20' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Project Management System (PMS)</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Aureus PMS Module
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track tasks, deliverables, milestones, and progress with real-time Django database synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Project Status Summary Banner */}
      {currentProject && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-400">[{currentProject.code}]</span>
              <span className="text-sm font-bold text-white">{currentProject.title}</span>
            </div>
            <p className="text-xs text-slate-400">{currentProject.description}</p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Budget vs Spent</div>
              <div className="text-xs font-bold text-slate-200">
                ${parseFloat(String(currentProject.spent || 0)).toLocaleString()} / ${parseFloat(String(currentProject.budget || 0)).toLocaleString()}
              </div>
            </div>

            <div className="w-36">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Progress</span>
                <span className="font-bold text-indigo-400">{currentProject.progress_percentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                  style={{ width: `${currentProject.progress_percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.key);

            return (
              <div key={col.key} className={`rounded-xl border ${col.color} p-3.5 space-y-3 min-h-[480px]`}>
                
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{col.label}</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setNewTitle('');
                      setModalOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Task Cards */}
                <div className="space-y-2.5">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xs transition-all space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed">
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          task.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300' :
                          task.priority === 'high' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimated_hours}h</span>
                        </div>
                      </div>

                      {/* Stage Move Controls */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 truncate max-w-[100px]">{task.assigned_to || 'Unassigned'}</span>
                        
                        <select
                          value={task.status}
                          onChange={(e) => task.id && handleStatusChange(task.id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-hidden focus:border-indigo-500"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                    </div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800/60 rounded-xl">
                      No tasks in this stage
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Estimate</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{task.title}</td>
                  <td className="py-3 px-4 font-mono text-indigo-400">{task.project_code || 'PRJ-GLOBAL'}</td>
                  <td className="py-3 px-4">{task.assigned_to || 'Unassigned'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">{task.estimated_hours}h</td>
                  <td className="py-3 px-4">
                    <select
                      value={task.status}
                      onChange={(e) => task.id && handleStatusChange(task.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create New Task</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement OAuth2 Refresh Token Rotation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Est. Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Assignee</label>
                <select
                  value={newAssignedTo}
                  onChange={(e) => setNewAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="Alex Rivera">Alex Rivera (Lead Engineer)</option>
                  <option value="Sophia Chen">Sophia Chen (Systems Architect)</option>
                  <option value="Marcus Vance">Marcus Vance (Operations Lead)</option>
                  <option value="Elena Rostova">Elena Rostova (Cloud Infrastructure)</option>
                </select>
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
