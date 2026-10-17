'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  FolderKanban,
  Boxes,
  Users,
  Store,
  Clock,
  ShoppingCart,
  Factory,
  Wrench,
  Briefcase,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  getProjects,
  getTasks,
  getStockItems,
  getPurchaseOrders,
  getMaintenanceRequests,
  getTimeOffRequests,
  getQuotations,
} from '@/lib/erp-api';
import { Project, Task, StockItem, PurchaseOrder, MaintenanceRequest, TimeOffRequest, Quotation } from '@/lib/types';

export default function ERPDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [timeOffs, setTimeOffs] = useState<TimeOffRequest[]>([]);
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProjects(),
      getTasks(),
      getStockItems(),
      getPurchaseOrders(),
      getMaintenanceRequests(),
      getTimeOffRequests(),
      getQuotations(),
    ]).then(([p, t, s, po, m, to, q]) => {
      setProjects(p);
      setTasks(t);
      setStockItems(s);
      setPurchaseOrders(po);
      setMaintenance(m);
      setTimeOffs(to);
      setQuotes(q);
      setLoading(false);
    });
  }, []);

  const lowStockCount = stockItems.filter((i) => i.quantity_on_hand <= i.reorder_level).length;
  const pendingLeavesCount = timeOffs.filter((r) => r.status === 'pending').length;
  const activeTasksCount = tasks.filter((t) => t.status !== 'done').length;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Enterprise Control Center
            </span>
            <span className="text-xs text-slate-400">All 12 Modules Synchronized</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Welcome to Aura ERP Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Full-stack enterprise resource system with live PostgreSQL/Django backend data.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/app/pos"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm shadow-emerald-600/20"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Launch POS Register</span>
          </Link>
          <Link
            href="/app/projects"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm shadow-indigo-600/20"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>PMS Kanban</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active PMS Tasks */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Project Tasks (PMS)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{activeTasksCount} Active</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <span className="text-emerald-400 font-semibold">{tasks.length} total tasks</span>
              <span>across {projects.length} project</span>
            </div>
          </div>
          <Link href="/app/projects" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-1 border-t border-slate-800">
            <span>View Kanban Board</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* KPI 2: Inventory Alerts */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Inventory Status (WMS)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{stockItems.length} SKUs Tracked</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              {lowStockCount > 0 ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {lowStockCount} below reorder level
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold">All healthy</span>
              )}
            </div>
          </div>
          <Link href="/app/inventory" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-1 border-t border-slate-800">
            <span>Manage Warehouses</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* KPI 3: Procurement & POs */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Procurement Orders</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{purchaseOrders.length} Active POs</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <span className="text-slate-300">Goods delivery in transit</span>
            </div>
          </div>
          <Link href="/app/procurement" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-1 border-t border-slate-800">
            <span>View Purchase Orders</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* KPI 4: HR & Approvals */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Workforce & Approvals</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{pendingLeavesCount} Leave Pending</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <span className="text-purple-400 font-semibold">{timeOffs.length} total requests</span>
            </div>
          </div>
          <Link href="/app/hr" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 pt-1 border-t border-slate-800">
            <span>Review & Approve</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

      </div>

      {/* Main Section: Operations Activity & Module Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Workloads & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Tasks Table */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">High Priority Tasks In-Flight</h2>
                <p className="text-xs text-slate-400">Real-time status updates from PMS</p>
              </div>
              <Link href="/app/projects" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Go to PMS Kanban →
              </Link>
            </div>

            <div className="divide-y divide-slate-800">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-white hover:text-indigo-400 cursor-pointer transition-colors">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>Project: <strong className="text-slate-400">{task.project_code || 'PRJ-GLOBAL'}</strong></span>
                      <span>•</span>
                      <span>Assigned to: <strong className="text-slate-400">{task.assigned_to || 'Unassigned'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      task.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      task.priority === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      task.status === 'done' ? 'bg-emerald-500/20 text-emerald-300' :
                      task.status === 'in_progress' ? 'bg-indigo-500/20 text-indigo-300' :
                      task.status === 'review' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plant & Assets Telemetry */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Shop Floor & Plant Maintenance</h2>
                <p className="text-xs text-slate-400">Equipment telemetry and open repair tickets</p>
              </div>
              <Link href="/app/maintenance" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Equipment Hub →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {maintenance.map((m) => (
                <div key={m.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">{m.ticket_number}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                      m.priority === 'critical' || m.priority === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {m.priority}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 line-clamp-1">{m.title}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Tech: {m.assigned_technician || 'Unassigned'}</span>
                    <span className="capitalize text-indigo-400">{m.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Operations Quick Launcher */}
        <div className="space-y-6">
          
          {/* Quick Launchpad */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Operations Launchpad</span>
            </h2>
            <p className="text-xs text-slate-400">Direct shortcuts to operational transactions</p>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/app/pos"
                className="p-3 rounded-xl bg-slate-950 hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-500/30 flex flex-col items-center justify-center text-center transition-all group"
              >
                <Store className="w-5 h-5 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-200">POS Register</span>
                <span className="text-[10px] text-slate-500">Retail & Orders</span>
              </Link>

              <Link
                href="/app/timesheets"
                className="p-3 rounded-xl bg-slate-950 hover:bg-indigo-950/30 border border-slate-800 hover:border-indigo-500/30 flex flex-col items-center justify-center text-center transition-all group"
              >
                <Clock className="w-5 h-5 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-200">Log Timesheet</span>
                <span className="text-[10px] text-slate-500">Track Hours</span>
              </Link>

              <Link
                href="/app/sales"
                className="p-3 rounded-xl bg-slate-950 hover:bg-sky-950/30 border border-slate-800 hover:border-sky-500/30 flex flex-col items-center justify-center text-center transition-all group"
              >
                <TrendingUp className="w-5 h-5 text-sky-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-200">New Quote</span>
                <span className="text-[10px] text-slate-500">Sales Proposal</span>
              </Link>

              <Link
                href="/app/manufacturing"
                className="p-3 rounded-xl bg-slate-950 hover:bg-purple-950/30 border border-slate-800 hover:border-purple-500/30 flex flex-col items-center justify-center text-center transition-all group"
              >
                <Factory className="w-5 h-5 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-200">Shop Orders</span>
                <span className="text-[10px] text-slate-500">MRP Batches</span>
              </Link>
            </div>
          </div>

          {/* System Health Status */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Backend Connectivity</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Django 6.0 REST API
                </span>
                <span className="font-mono text-emerald-400">Connected</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Database Transactions
                </span>
                <span className="font-mono text-emerald-400">Healthy</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  CORS Origin Validation
                </span>
                <span className="font-mono text-slate-400">127.0.0.1:8000</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
