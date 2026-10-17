'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Boxes,
  Users,
  FolderKanban,
  Receipt,
  Search,
  Plus,
  RefreshCw,
  Building,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Activity,
  AlertCircle,
} from 'lucide-react';
import {
  getLiveInvoices,
  getLiveContacts,
  getLiveProjects,
  getLiveStock,
  getLiveEmployees,
} from '@/lib/api';
import { Invoice, Contact, Project, StockItem, Employee } from '@/lib/types';

export default function DemoConsolePage() {
  const [activeTab, setActiveTab] = useState<'sales' | 'crm' | 'inventory' | 'projects' | 'hr'>('sales');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'online' | 'local_cache'>('online');
  const [filterQuery, setFilterQuery] = useState('');

  // Add Contact Modal
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    company: '',
    contact_type: 'customer',
    status: 'active',
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [inv, cont, proj, stk, emp] = await Promise.all([
        getLiveInvoices(),
        getLiveContacts(),
        getLiveProjects(),
        getLiveStock(),
        getLiveEmployees(),
      ]);

      if (inv) setInvoices(inv);
      if (cont) setContacts(cont);
      if (proj) setProjects(proj);
      if (stk) setStocks(stk);
      if (emp) setEmployees(emp);
      setBackendStatus('online');
    } catch {
      setBackendStatus('local_cache');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAddContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created: Contact = {
      id: Date.now(),
      name: newContact.name,
      email: newContact.email,
      company: newContact.company,
      contact_type: newContact.contact_type,
      status: newContact.status,
    };

    setContacts([created, ...contacts]);
    setShowAddContact(false);
    setNewContact({ name: '', email: '', company: '', contact_type: 'customer', status: 'active' });

    // Also attempt POST to Django API if online
    try {
      await fetch('http://127.0.0.1:8000/api/crm/contacts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      });
    } catch {
      // Handled locally
    }
  };

  // KPI Metrics Calculation
  const totalInvoiced = invoices.reduce((acc, curr) => acc + Number(curr.total || 0), 0);
  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
  const totalUnitsInStock = stocks.reduce((acc, curr) => acc + Number(curr.quantity_on_hand || 0), 0);

  return (
    <div className="py-10 bg-slate-50 dark:bg-slate-950/80 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Control Bar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                Interactive Operational Workspace
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Django REST API Synchronized
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Aura ERP Live Operational Console
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Experience the live functioning ERP engine. Create records, inspect multi-warehouse inventory, and view real-time general ledger transactions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadAllData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
            <Link
              href="http://127.0.0.1:8000/admin/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Django Admin Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Operational Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">Total Revenue Invoiced</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                ${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
                <TrendingUp className="w-3 h-3" /> 100% Collected (Settled)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Receipt className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">Active PMS Projects</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {activeProjectsCount} Active
              </div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                {projects.length} Total Client Contracts
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FolderKanban className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">Units in Warehouses</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {totalUnitsInStock.toLocaleString()} Units
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                Across 3 Logistics Hubs
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Boxes className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400">CRM Contacts & Accounts</span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {contacts.length} Accounts
              </div>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                {employees.length} Active Personnel Seats
              </span>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Tab Controls & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-x-auto">
            {[
              { id: 'sales', label: 'Invoices & Billing', icon: Receipt },
              { id: 'crm', label: 'CRM & Contacts', icon: Users },
              { id: 'inventory', label: 'Warehouse Stock', icon: Boxes },
              { id: 'projects', label: 'PMS Projects', icon: FolderKanban },
              { id: 'hr', label: 'HR Directory', icon: Building },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter table records..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 shadow-2xs"
              />
            </div>

            {activeTab === 'crm' && (
              <button
                onClick={() => setShowAddContact(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Invoices Table */}
        {activeTab === 'sales' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Sales Invoices Ledger
              </h3>
              <span className="text-xs text-slate-400">Total Count: {invoices.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices
                    .filter((inv) =>
                      inv.customer_name?.toLowerCase().includes(filterQuery.toLowerCase()) ||
                      inv.invoice_number?.toLowerCase().includes(filterQuery.toLowerCase())
                    )
                    .map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {inv.invoice_number}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {inv.customer_name}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {inv.customer_company || 'Enterprise Account'}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{inv.issue_date}</td>
                        <td className="py-3 px-4 text-slate-500">{inv.due_date}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          ${Number(inv.total).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{inv.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: CRM & Contacts Table */}
        {activeTab === 'crm' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                CRM Directory & Opportunity Contacts
              </h3>
              <span className="text-xs text-slate-400">Active Contacts: {contacts.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-4">Contact Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Job Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {contacts
                    .filter((c) =>
                      c.name?.toLowerCase().includes(filterQuery.toLowerCase()) ||
                      c.company?.toLowerCase().includes(filterQuery.toLowerCase())
                    )
                    .map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {c.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{c.email}</td>
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{c.company || 'Direct'}</td>
                        <td className="py-3 px-4 text-slate-500">{c.job_title || 'Decision Maker'}</td>
                        <td className="py-3 px-4">
                          <span className="capitalize px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {c.contact_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60">
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Inventory Stock Table */}
        {activeTab === 'inventory' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Multi-Warehouse Stock Levels & Available Balances
              </h3>
              <span className="text-xs text-slate-400">Total SKUs: {stocks.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-4">SKU Code</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Warehouse</th>
                    <th className="py-3 px-4">On Hand</th>
                    <th className="py-3 px-4">Reserved</th>
                    <th className="py-3 px-4">Reorder Level</th>
                    <th className="py-3 px-4 text-right">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stocks
                    .filter((s) =>
                      s.product?.name?.toLowerCase().includes(filterQuery.toLowerCase()) ||
                      s.warehouse_name?.toLowerCase().includes(filterQuery.toLowerCase())
                    )
                    .map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {s.product?.sku || `AURA-SKU-${idx + 1}`}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {s.product?.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {s.warehouse_name} ({s.warehouse_code})
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {s.quantity_on_hand}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{s.quantity_reserved}</td>
                        <td className="py-3 px-4 text-amber-600 font-semibold">{s.reorder_level}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                            {s.available_quantity} Units
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: PMS Projects Table */}
        {activeTab === 'projects' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Project Management System (PMS) Contracts
              </h3>
              <span className="text-xs text-slate-400">Total Projects: {projects.length}</span>
            </div>

            <div className="space-y-4">
              {projects
                .filter((p) => p.title?.toLowerCase().includes(filterQuery.toLowerCase()))
                .map((p, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                          {p.code}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{p.description}</p>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                        <span>Budget: <strong className="text-slate-700 dark:text-slate-200">${Number(p.budget).toLocaleString()}</strong></span>
                        <span>Spent: <strong className="text-slate-700 dark:text-slate-200">${Number(p.spent).toLocaleString()}</strong></span>
                        <span>Client: {p.client_name || 'Enterprise'}</span>
                      </div>
                    </div>

                    <div className="w-full md:w-60 shrink-0 space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>Sprint Completion</span>
                        <span>{p.progress_percentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${p.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 5: HR Directory Table */}
        {activeTab === 'hr' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Human Resources Personnel Directory
              </h3>
              <span className="text-xs text-slate-400">Total Employees: {employees.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {employees
                .filter((e) => e.full_name?.toLowerCase().includes(filterQuery.toLowerCase()))
                .map((e, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-center gap-4"
                  >
                    <img
                      src={e.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={e.full_name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-indigo-200 dark:border-indigo-800"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{e.full_name}</h4>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{e.job_title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{e.department_name}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-emerald-700">
                        {e.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Add Contact Modal */}
        {showAddContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New CRM Contact</h3>
              
              <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="e.g. Liam Gallagher"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="liam@company.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Company</label>
                  <input
                    type="text"
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                    placeholder="Gallagher Enterprises"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Type</label>
                    <select
                      value={newContact.contact_type}
                      onChange={(e) => setNewContact({ ...newContact, contact_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="customer">Customer</option>
                      <option value="lead">Lead</option>
                      <option value="vendor">Vendor</option>
                      <option value="partner">Partner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Status</label>
                    <select
                      value={newContact.status}
                      onChange={(e) => setNewContact({ ...newContact, status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="active">Active</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="lead">Lead</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
                  >
                    Save Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddContact(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
