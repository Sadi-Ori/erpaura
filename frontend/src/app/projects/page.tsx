'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Kanban,
  Milestone as MilestoneIcon,
  Clock,
  Bug,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Users,
  Calendar,
  DollarSign,
  ChevronRight,
  TrendingUp,
  X,
  Filter,
} from 'lucide-react';
import { Project, ProjectStats } from '@/lib/types';
import { getProjects, getProjectStats, createProject } from '@/lib/projects-api';

export default function ProjectsPortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedHealth, setSelectedHealth] = useState('ALL');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    code: '',
    category: 'software',
    manager_name: '',
    team_size: 5,
    budget: '50000',
    start_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [projList, statsData] = await Promise.all([
        getProjects(),
        getProjectStats(),
      ]);
      setProjects(projList);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProject({
        title: form.title,
        code: form.code.toUpperCase(),
        category: form.category,
        manager_name: form.manager_name || 'Project Lead',
        team_size: Number(form.team_size),
        budget: form.budget,
        start_date: form.start_date,
        due_date: form.due_date,
        description: form.description,
        status: 'active',
        health_status: 'on_track',
      });
      setToastMessage('Project created successfully and added to portfolio.');
      setModalOpen(false);
      setForm({
        title: '',
        code: '',
        category: 'software',
        manager_name: '',
        team_size: 5,
        budget: '50000',
        start_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        description: '',
      });
      await loadData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (selectedHealth !== 'ALL' && p.health_status !== selectedHealth) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.manager_name && p.manager_name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-indigo-400" />
            <span>Project Portfolio & Sprints</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track multi-project health, milestone deliverables, task velocity, and budget burn rate
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/projects/kanban"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
          >
            <Kanban className="w-4 h-4 text-indigo-400" />
            <span>Kanban Board</span>
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-slate-400">Active Portfolio</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
              {stats?.active_projects ?? 5} Active
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-white mt-2">
            {stats?.total_projects ?? 5} Projects
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats?.health_counts?.on_track ?? 4} On Track • {stats?.health_counts?.at_risk ?? 1} At Risk
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-slate-400">Task Completion</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
              {stats && stats.total_tasks > 0 ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 45}%
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
            {stats?.completed_tasks ?? 4} / {stats?.total_tasks ?? 13} Done
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats?.in_progress_tasks ?? 7} in flight across sprints
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-slate-400">Logged Hours & Cost</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300">
              Timesheet
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-purple-400 mt-2">
            {stats?.total_hours_logged ?? 59.5} hrs
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ${stats ? stats.total_timesheet_cost.toLocaleString() : '3,800'} billable total
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-slate-400">Open Issues</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              (stats?.critical_issues ?? 1) > 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
            }`}>
              {stats?.critical_issues ?? 1} Blocker
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-rose-400 mt-2">
            {stats?.open_issues ?? 2} Defects
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Investigating in QA testing</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by code, name, manager..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Health Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[10px] uppercase font-mono text-slate-500 mr-1 hidden md:inline">Health:</span>
          {['ALL', 'on_track', 'at_risk', 'delayed'].map((h) => (
            <button
              key={h}
              onClick={() => setSelectedHealth(h)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] capitalize transition-colors ${
                selectedHealth === h
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {h === 'ALL' ? 'All Health' : h.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500">
            No projects found matching the selected filters.
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const spentNum = parseFloat(String(proj.spent || '0'));
            const budgetNum = parseFloat(String(proj.budget || '1'));
            const budgetPct = Math.min(100, Math.round((spentNum / (budgetNum || 1)) * 100));

            return (
              <div
                key={proj.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div className="space-y-4">
                  {/* Top line: Code, Category, Health */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {proj.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        proj.health_status === 'on_track'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : proj.health_status === 'at_risk'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : proj.health_status === 'delayed'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {proj.health_status ? proj.health_status.replace('_', ' ') : 'Active'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {proj.description || 'Enterprise project initiatives and milestones.'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Sprint Progress</span>
                      <span className="font-mono font-bold text-white">{proj.progress_percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${proj.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Budget Burn */}
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-850 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Budget Burned:</span>
                      <span className="font-mono font-semibold text-slate-300">
                        ${spentNum.toLocaleString()} / ${budgetNum.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          budgetPct > 90 ? 'bg-rose-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${budgetPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata: Manager, Due Date */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{proj.manager_name || 'Project Lead'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{proj.due_date || 'Q4 2026'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <Link
                    href={`/projects/kanban?project=${proj.id}`}
                    className="flex-1 py-2 text-center rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Open Kanban
                  </Link>
                  <Link
                    href={`/projects/milestones?project=${proj.id}`}
                    className="flex-1 py-2 text-center rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    Milestones
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: New Project */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-indigo-400">
                <FolderKanban className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Create New Enterprise Project</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NextGen Microservices Refactor"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Project Code</label>
                  <input
                    type="text"
                    required
                    placeholder="PRJ-AURA-06"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="software">Software Engineering</option>
                    <option value="infrastructure">Cloud Infrastructure</option>
                    <option value="client_delivery">Client Delivery</option>
                    <option value="product_design">Product & UX Design</option>
                    <option value="internal_ops">Internal Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Lead Manager</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Reed"
                    value={form.manager_name}
                    onChange={(e) => setForm({ ...form, manager_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Allocated Budget ($)</label>
                  <input
                    type="number"
                    required
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Due Date</label>
                  <input
                    type="date"
                    required
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Scope & Objectives</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Outline key architectural goals, deliverables, and success metrics..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-hidden focus:border-indigo-500"
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
                  className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
                >
                  {submitting ? 'Creating Project...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
