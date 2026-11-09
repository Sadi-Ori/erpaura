'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  CreditCard,
  Heart,
  Award,
} from 'lucide-react';
import HRSubNav from './HRSubNav';
import { Employee, Department, Designation, HRStats } from '@/lib/types';
import {
  getEmployees,
  getDepartments,
  getDesignations,
  getHRStats,
  createEmployee,
  clockInOut,
} from '@/lib/hr-payroll-api';

export default function HRDirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [stats, setStats] = useState<HRStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add Employee Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newJob, setNewJob] = useState('');
  const [newDeptId, setNewDeptId] = useState<number>(1);
  const [newEmpType, setNewEmpType] = useState<'full_time' | 'part_time' | 'contract' | 'intern'>('full_time');
  const [newHireDate, setNewHireDate] = useState('2026-11-01');
  const [newSalary, setNewSalary] = useState('8500');
  const [newBank, setNewBank] = useState('JPMorgan Chase Bank');
  const [newAcc, setNewAcc] = useState('**** **** **** 5521');
  const [newCity, setNewCity] = useState('San Francisco, CA');

  // Employee 360 Drawer
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [clockMsg, setClockMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [emp, dept, des, st] = await Promise.all([
      getEmployees(),
      getDepartments(),
      getDesignations(),
      getHRStats(),
    ]);
    setEmployees(emp);
    setDepartments(dept);
    setDesignations(des);
    setStats(st);
    if (dept.length > 0) setNewDeptId(dept[0].id || 1);
    setLoading(false);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirst.trim() || !newEmail.trim()) return;

    setSaving(true);
    const created = await createEmployee({
      first_name: newFirst,
      last_name: newLast,
      email: newEmail,
      phone: newPhone,
      job_title: newJob || 'Enterprise Specialist',
      department: newDeptId,
      employment_type: newEmpType,
      hire_date: newHireDate,
      basic_salary: Number(newSalary),
      bank_name: newBank,
      bank_account_number: newAcc,
      city: newCity,
      status: 'active',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    setSaving(false);
    if (created) {
      setEmployees([created, ...employees]);
      setAddModalOpen(false);
      setNewFirst('');
      setNewLast('');
      setNewEmail('');
      setNewJob('');
    }
  };

  const handleQuickClock = async (empId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await clockInOut(empId);
    if (res && res.message) {
      setClockMsg(res.message);
      setTimeout(() => setClockMsg(''), 4000);
      loadData();
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    if (deptFilter !== 'all' && String(emp.department) !== deptFilter) return false;
    if (statusFilter !== 'all' && emp.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        emp.first_name.toLowerCase().includes(q) ||
        emp.last_name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        (emp.employee_id && emp.employee_id.toLowerCase().includes(q)) ||
        emp.job_title.toLowerCase().includes(q) ||
        emp.department_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Employee Management & HRMS
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Core Enterprise Suite
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Maintain organizational hierarchy, digital personnel records, attendance registers, time-off approvals, and automated monthly payroll.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Employee</span>
        </button>
      </div>

      <HRSubNav />

      {clockMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{clockMsg}</span>
        </div>
      )}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Headcount</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {stats?.total_employees ?? employees.length}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">{stats?.active_employees ?? employees.length} Active On Payroll</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Today&apos;s Attendance</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {stats?.attendance_today.present ?? 9}
            </div>
            <span className="text-[10px] text-cyan-400 font-medium">{stats?.attendance_today.late ?? 1} Late Arrivals</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Pending Time-Off</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {stats?.pending_leaves ?? 1}
            </div>
            <Link href="/app/hr/leave" className="text-[10px] text-amber-400 hover:underline font-medium">
              Review Leave Queue &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Monthly Payroll Run</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              ${Number(stats?.monthly_payroll_total || 128450).toLocaleString()}
            </div>
            <Link href="/app/hr/payroll" className="text-[10px] text-purple-400 hover:underline font-medium">
              Inspect Payslips &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Departments Overview Strip */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-400" />
          <span>Departmental Structure & Headcount Allocation</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setDeptFilter(deptFilter === String(dept.id) ? 'all' : String(dept.id))}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                deptFilter === String(dept.id)
                  ? 'bg-blue-950/60 border-blue-500 shadow-md ring-1 ring-blue-500'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-blue-300">
                <span>{dept.code}</span>
                <span className="text-slate-400">{dept.employee_count ?? 0}</span>
              </div>
              <h4 className="font-bold text-xs text-white mt-1 truncate">{dept.name}</h4>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{dept.manager_name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID (EMP-1001), email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 focus:outline-hidden"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={String(d.id)}>{d.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Full-Time</option>
            <option value="contract">Contractor</option>
            <option value="on_leave">On Leave</option>
            <option value="terminated">Alumni</option>
          </select>
        </div>

        <span className="text-slate-500 text-[11px]">
          Showing {filteredEmployees.length} of {employees.length} personnel records
        </span>
      </div>

      {/* Employee Records Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Staff Member & ID</th>
                <th className="py-3 px-4">Role & Designation</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Monthly Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Hire Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => setActiveEmployee(emp)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={emp.full_name || emp.first_name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <span className="font-bold text-white block text-sm">
                          {emp.first_name} {emp.last_name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="font-mono text-blue-400 font-semibold">{emp.employee_id}</span>
                          <span>&bull;</span>
                          <span>{emp.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {emp.job_title}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {emp.department_name || 'General Operations'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-emerald-400">
                    ${Number(emp.basic_salary || 6500).toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                      emp.status === 'active'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                        : emp.status === 'on_leave'
                        ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {emp.status.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400">
                    {emp.hire_date}
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleQuickClock(emp.id!, e)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium inline-flex items-center gap-1"
                      title="Simulate Daily Check-In/Out"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Clock</span>
                    </button>

                    <button
                      onClick={() => setActiveEmployee(emp)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-medium inline-flex items-center gap-1 border border-blue-500/30"
                    >
                      <span>360 View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Employee 360 Detail Drawer */}
      {/* ========================================================================= */}
      {activeEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-end p-0">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full shadow-2xl p-6 sm:p-8 space-y-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeEmployee.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={activeEmployee.first_name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-700"
                />
                <div>
                  <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">
                    {activeEmployee.employee_id}
                  </span>
                  <h3 className="text-xl font-bold text-white">{activeEmployee.first_name} {activeEmployee.last_name}</h3>
                  <p className="text-xs text-slate-400">{activeEmployee.job_title} &bull; {activeEmployee.department_name}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveEmployee(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compensation & Bank Account Box (from Online-Payroll-Management-System) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Compensation & Payroll Profile</span>
              </span>

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[11px]">Basic Monthly Salary</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    ${Number(activeEmployee.basic_salary || 6500).toLocaleString()} USD
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Primary Bank</span>
                  <span className="font-semibold text-white">{activeEmployee.bank_name || 'JPMorgan Chase'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Disbursement Account</span>
                  <span className="font-mono text-slate-200">{activeEmployee.bank_account_number || '**** 4819'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Tax Identification Number</span>
                  <span className="font-mono text-slate-200">{activeEmployee.tax_id || 'TAX-US-99210'}</span>
                </div>
              </div>
            </div>

            {/* Leave Balance Quotas */}
            {activeEmployee.leave_balance && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Annual Leave Quotas & Balances</span>
                </span>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Annual PTO</span>
                    <span className="font-bold text-white text-sm">
                      {activeEmployee.leave_balance.annual_remaining} / {activeEmployee.leave_balance.annual_quota} days
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Medical Leave</span>
                    <span className="font-bold text-white text-sm">
                      {activeEmployee.leave_balance.sick_remaining} / {activeEmployee.leave_balance.sick_quota} days
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Casual Leave</span>
                    <span className="font-bold text-white text-sm">
                      {activeEmployee.leave_balance.casual_remaining} / {activeEmployee.leave_balance.casual_quota} days
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Details */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-white block">Personal & Emergency Details</span>
              <div className="grid grid-cols-2 gap-2 text-slate-400">
                <div>Email: <strong className="text-white">{activeEmployee.email}</strong></div>
                <div>Phone: <strong className="text-white">{activeEmployee.phone || 'N/A'}</strong></div>
                <div>City: <strong className="text-white">{activeEmployee.city}</strong></div>
                <div>Blood Group: <strong className="text-purple-300">{activeEmployee.blood_group}</strong></div>
                <div>Manager: <strong className="text-white">{activeEmployee.manager_name || 'Executive CTO'}</strong></div>
                <div>Joined: <strong className="text-white">{activeEmployee.hire_date}</strong></div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="pt-2 flex items-center justify-between">
              <Link
                href="/app/hr/payroll"
                className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>View Monthly Payslips</span>
              </Link>

              <Link
                href="/app/hr/leave"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Request Time-Off</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Add Employee Modal */}
      {/* ========================================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Register New Enterprise Employee</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newFirst}
                    onChange={(e) => setNewFirst(e.target.value)}
                    placeholder="e.g. John"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newLast}
                    onChange={(e) => setNewLast(e.target.value)}
                    placeholder="e.g. Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="john.doe@auraerp.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department *</label>
                  <select
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={newJob}
                    onChange={(e) => setNewJob(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Employment Type</label>
                  <select
                    value={newEmpType}
                    onChange={(e) => setNewEmpType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  >
                    <option value="full_time">Full-Time</option>
                    <option value="contract">Contract</option>
                    <option value="part_time">Part-Time</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hire Date</label>
                  <input
                    type="date"
                    value={newHireDate}
                    onChange={(e) => setNewHireDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Base Salary (USD/mo)</label>
                  <input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={newBank}
                    onChange={(e) => setNewBank(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bank Account / IBAN</label>
                  <input
                    type="text"
                    value={newAcc}
                    onChange={(e) => setNewAcc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
                >
                  {saving ? 'Creating...' : 'Enroll Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
