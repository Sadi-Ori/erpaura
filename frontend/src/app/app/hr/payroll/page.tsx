'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Receipt,
  CheckCircle2,
  Clock,
  Play,
  Printer,
  X,
  CreditCard,
  Building,
  User,
  ShieldCheck,
  Search,
  Calendar,
  Sparkles,
} from 'lucide-react';
import HRSubNav from '../HRSubNav';
import { PayrollEntry } from '@/lib/types';
import {
  getPayrollEntries,
  runPayrollBatch,
  disbursePayroll,
} from '@/lib/hr-payroll-api';

export default function PayrollManagementPage() {
  const [payrolls, setPayrolls] = useState<PayrollEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchMsg, setBatchMsg] = useState('');

  // Selected Payslip for Voucher Modal
  const [activePayslip, setActivePayslip] = useState<PayrollEntry | null>(null);

  useEffect(() => {
    loadPayrolls();
  }, [selectedMonth, selectedYear]);

  const loadPayrolls = async () => {
    setLoading(true);
    const data = await getPayrollEntries({ month: selectedMonth, year: selectedYear });
    setPayrolls(data);
    setLoading(false);
  };

  const handleRunBatch = async () => {
    setBatchRunning(true);
    setBatchMsg('');
    const res = await runPayrollBatch(selectedMonth, selectedYear);
    setBatchRunning(false);
    if (res && res.message) {
      setBatchMsg(res.message);
      setTimeout(() => setBatchMsg(''), 5000);
      loadPayrolls();
    }
  };

  const handleDisburse = async (id: number) => {
    const res = await disbursePayroll(id, 'Direct Bank Wire (ACH/SWIFT)');
    if (res) {
      setPayrolls((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'paid', disbursed_at: res.disbursed_at } : p))
      );
      if (activePayslip && activePayslip.id === id) {
        setActivePayslip({ ...activePayslip, status: 'paid' });
      }
    }
  };

  const filtered = payrolls.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.employee_name?.toLowerCase().includes(q) ||
        p.payslip_number.toLowerCase().includes(q) ||
        p.employee_id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalGross = payrolls.reduce((acc, p) => acc + Number(p.gross_salary || 0), 0);
  const totalDeductions = payrolls.reduce((acc, p) => acc + Number(p.total_deductions || 0), 0);
  const totalNet = payrolls.reduce((acc, p) => acc + Number(p.net_salary || 0), 0);
  const totalDisbursed = payrolls.filter((p) => p.status === 'paid').reduce((acc, p) => acc + Number(p.net_salary || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Payroll Engine & Digital Payslips
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Automated Disbursal Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate itemized monthly compensation vouchers, calculate housing and medical allowances, withhold statutory taxes, and disburse bank transfers.
          </p>
        </div>

        <button
          onClick={handleRunBatch}
          disabled={batchRunning}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{batchRunning ? 'Computing Batch...' : `Execute ${new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} Payroll Batch`}</span>
        </button>
      </div>

      <HRSubNav />

      {batchMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{batchMsg}</span>
        </div>
      )}

      {/* Top Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Gross Monthly Earnings</span>
          <div className="text-2xl font-extrabold text-white">
            ${Math.round(totalGross).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Base + Allowances (Housing & Medical)</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Statutory Deductions</span>
          <div className="text-2xl font-extrabold text-rose-400">
            -${Math.round(totalDeductions).toLocaleString()}
          </div>
          <span className="text-[10px] text-rose-300/80">Income Tax (15%) + PF (8%) + Health</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Net Payable</span>
          <div className="text-2xl font-extrabold text-emerald-400">
            ${Math.round(totalNet).toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-300/80">Approved For {payrolls.length} Personnel</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Disbursed (Paid)</span>
          <div className="text-2xl font-extrabold text-purple-300">
            ${Math.round(totalDisbursed).toLocaleString()}
          </div>
          <span className="text-[10px] text-purple-400">Direct Bank Wire (ACH/SWIFT)</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Pay Period:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden"
            >
              {[
                { m: 1, name: 'January' },
                { m: 2, name: 'February' },
                { m: 3, name: 'March' },
                { m: 4, name: 'April' },
                { m: 5, name: 'May' },
                { m: 6, name: 'June' },
                { m: 7, name: 'July' },
                { m: 8, name: 'August' },
                { m: 9, name: 'September' },
                { m: 10, name: 'October' },
                { m: 11, name: 'November' },
                { m: 12, name: 'December' },
              ].map((item) => (
                <option key={item.m} value={item.m}>{item.name}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search employee or payslip..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 focus:outline-hidden"
          >
            <option value="all">All Disbursal Statuses</option>
            <option value="processed">Approved / Pending Payment</option>
            <option value="paid">Disbursed (Paid)</option>
          </select>
        </div>

        <span className="text-slate-500 text-[11px]">
          Showing {filtered.length} payslips
        </span>
      </div>

      {/* Payroll Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Voucher No. & Employee</th>
                <th className="py-3 px-4">Basic Pay</th>
                <th className="py-3 px-4">Allowances</th>
                <th className="py-3 px-4">Gross Earnings</th>
                <th className="py-3 px-4 text-rose-400">Total Deductions</th>
                <th className="py-3 px-4 text-emerald-400">Net Payable</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Loading payroll register...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No payroll entries found for {selectedMonth}/{selectedYear}. Click &quot;Execute Payroll Batch&quot; above to generate payslips.
                  </td>
                </tr>
              ) : (
                filtered.map((pay) => {
                  const allowances =
                    Number(pay.housing_allowance || 0) +
                    Number(pay.medical_allowance || 0) +
                    Number(pay.transport_allowance || 0) +
                    Number(pay.bonus_allowance || 0);

                  return (
                    <tr
                      key={pay.id}
                      onClick={() => setActivePayslip(pay)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-purple-400 text-[10px] block font-bold">
                          {pay.payslip_number}
                        </span>
                        <span className="font-bold text-white text-sm block">
                          {pay.employee_name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {pay.employee_job} &bull; {pay.employee_id}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        ${Number(pay.basic_salary).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        +${allowances.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-100">
                        ${Number(pay.gross_salary).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-rose-400">
                        -${Number(pay.total_deductions).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400 text-sm">
                        ${Number(pay.net_salary).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          pay.status === 'paid'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                        }`}>
                          {pay.status === 'paid' ? 'Disbursed (Paid)' : 'Processed'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        {pay.status !== 'paid' && (
                          <button
                            onClick={() => handleDisburse(pay.id!)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 font-medium text-xs transition-colors"
                          >
                            Disburse
                          </button>
                        )}
                        <button
                          onClick={() => setActivePayslip(pay)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 font-medium text-xs"
                        >
                          View Slip
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Official Digital Payslip Voucher Modal */}
      {/* ========================================================================= */}
      {activePayslip && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative">
            {/* Modal Actions */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs">
                <Receipt className="w-4 h-4" />
                <span>OFFICIAL SALARY DISBURSEMENT SLIP</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  onClick={() => setActivePayslip(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div className="space-y-6 bg-slate-950 p-6 rounded-2xl border border-slate-800">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white font-black text-sm">
                      A
                    </div>
                    <span className="font-extrabold text-white text-base">Aura ERP Enterprise Inc.</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Corporate Headquarters &bull; 540 Howard St, San Francisco, CA</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-purple-400 font-bold text-xs block">{activePayslip.payslip_number}</span>
                  <span className="text-slate-300 text-xs font-bold">{activePayslip.period_label}</span>
                </div>
              </div>

              {/* Employee & Bank Info */}
              <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div>Employee Name: <strong className="text-white">{activePayslip.employee_name}</strong></div>
                  <div>Employee ID: <strong className="text-purple-300 font-mono">{activePayslip.employee_id}</strong></div>
                  <div>Designation: <strong className="text-white">{activePayslip.employee_job}</strong></div>
                  <div>Department: <strong className="text-white">{activePayslip.department_name}</strong></div>
                </div>
                <div className="space-y-1 text-right">
                  <div>Payment Mode: <strong className="text-white">{activePayslip.payment_method}</strong></div>
                  <div>Bank Name: <strong className="text-white">{activePayslip.bank_name || 'JPMorgan Chase'}</strong></div>
                  <div>Account: <strong className="font-mono text-slate-300">{activePayslip.bank_account_number || '**** 4819'}</strong></div>
                  <div>Status: <strong className={activePayslip.status === 'paid' ? 'text-emerald-400 uppercase' : 'text-amber-400 uppercase'}>{activePayslip.status}</strong></div>
                </div>
              </div>

              {/* Itemized Earnings & Deductions Tables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Earnings Column */}
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-emerald-400 block border-b border-slate-800 pb-1">Earnings & Allowances</span>
                  <div className="flex justify-between text-slate-300">
                    <span>Basic Monthly Salary</span>
                    <span className="font-mono">${Number(activePayslip.basic_salary).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Housing Allowance (20%)</span>
                    <span className="font-mono">${Number(activePayslip.housing_allowance).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Medical Allowance (10%)</span>
                    <span className="font-mono">${Number(activePayslip.medical_allowance).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Conveyance / Transport</span>
                    <span className="font-mono">${Number(activePayslip.transport_allowance).toLocaleString()}</span>
                  </div>
                  {Number(activePayslip.bonus_allowance) > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Executive Bonus</span>
                      <span className="font-mono">${Number(activePayslip.bonus_allowance).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
                    <span>Gross Total</span>
                    <span className="font-mono">${Number(activePayslip.gross_salary).toLocaleString()}</span>
                  </div>
                </div>

                {/* Deductions Column */}
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-rose-400 block border-b border-slate-800 pb-1">Statutory Deductions</span>
                  <div className="flex justify-between text-slate-300">
                    <span>Income Tax Withholding (15%)</span>
                    <span className="font-mono">${Number(activePayslip.tax_deduction).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Provident Fund / 401(k) (8%)</span>
                    <span className="font-mono">${Number(activePayslip.provident_fund).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Group Medical Insurance</span>
                    <span className="font-mono">${Number(activePayslip.health_insurance).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-rose-400">
                    <span>Total Deductions</span>
                    <span className="font-mono">-${Number(activePayslip.total_deductions).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay Callout */}
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold block">Net Salary Remittance</span>
                  <span className="text-xs text-slate-300">Transferred via automated corporate wire</span>
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  ${Number(activePayslip.net_salary).toLocaleString()} USD
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                This is a computer-generated payroll voucher verified by Aura ERP Corporate Finance &bull; No physical signature required.
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Payslip record verified on Aura Enterprise Ledger.</span>
              {activePayslip.status !== 'paid' && (
                <button
                  onClick={() => handleDisburse(activePayslip.id!)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
                >
                  Confirm & Disburse Bank Wire
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
