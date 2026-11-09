'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  DollarSign,
  Download,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  X,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useEmployee } from '../EmployeeContext';
import { PayrollEntry } from '@/lib/types';

export default function EmployeePayslipsPage() {
  const {
    selectedEmployee,
    recentPayroll,
    loading,
  } = useEmployee();

  const [selectedPayslip, setSelectedPayslip] = useState<PayrollEntry | null>(null);

  if (loading || !selectedEmployee) {
    return (
      <div className="py-24 text-center text-sm text-slate-400">
        Loading compensation records...
      </div>
    );
  }

  const latestPay = recentPayroll.length > 0 ? recentPayroll[0] : null;

  return (
    <div className="space-y-8">
      {/* Title & Navigation */}
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
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <span>Payslips & Salary Compensation Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access itemized monthly salary vouchers, allowances, tax deductions, and download digital copies
          </p>
        </div>
      </div>

      {/* Salary Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Basic Monthly Base</span>
          <div className="text-2xl font-black font-mono text-white">
            ${parseFloat(String(selectedEmployee.basic_salary || '0')).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pre-allowances standard</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Latest Gross Earnings</span>
          <div className="text-2xl font-black font-mono text-indigo-400">
            ${latestPay ? parseFloat(String(latestPay.gross_salary)).toLocaleString() : '--'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Base + Housing + Medical + Transport</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Statutory Deductions</span>
          <div className="text-2xl font-black font-mono text-rose-400">
            {latestPay ? `-$${parseFloat(String(latestPay.total_deductions)).toLocaleString()}` : '--'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tax 15% + PF 8% + Health</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-emerald-400 font-semibold block mb-1">
            Net Take-Home Pay
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            ${latestPay ? parseFloat(String(latestPay.net_salary)).toLocaleString() : '--'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Disbursed to Bank</p>
        </div>
      </div>

      {/* Historical Payslips Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">Monthly Payslip Register</h3>
          <p className="text-xs text-slate-400">Complete historical salary disbursements and itemized statements</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/50 text-slate-400 font-mono text-[10px] uppercase border-y border-slate-800">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Payslip #</th>
                <th className="py-3 px-4">Basic Base</th>
                <th className="py-3 px-4">Gross Earnings</th>
                <th className="py-3 px-4">Total Deductions</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4">Disbursed Via</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentPayroll.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No payslips generated for this employee yet.
                  </td>
                </tr>
              ) : (
                recentPayroll.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{pay.period_label}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{pay.payslip_number}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      ${parseFloat(String(pay.basic_salary)).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-indigo-400">
                      ${parseFloat(String(pay.gross_salary)).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-rose-400">
                      -${parseFloat(String(pay.total_deductions)).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                      ${parseFloat(String(pay.net_salary)).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      {pay.payment_method}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pay.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedPayslip(pay)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View Voucher</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital Printable Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto print:p-0 print:shadow-none">
            {/* Header Controls (Hidden on print) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                Aura ERP • Digital Salary Voucher
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Branded Payslip Body */}
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                      A
                    </div>
                    <span className="font-extrabold text-lg tracking-tight text-slate-900">
                      Aura<span className="text-emerald-600">ERP</span> Global Inc.
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">100 Innovation Way, Suite 400 • Palo Alto, CA 94301</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Payslip Voucher</span>
                  <span className="font-mono font-bold text-sm text-slate-900">{selectedPayslip.payslip_number}</span>
                  <p className="text-xs text-slate-500">{selectedPayslip.period_label}</p>
                </div>
              </div>

              {/* Employee Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Employee Name</span>
                  <span className="font-bold text-slate-800">{selectedPayslip.employee_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Employee ID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedPayslip.employee_id}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Designation</span>
                  <span className="font-medium text-slate-700">{selectedPayslip.employee_job}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Payment Method</span>
                  <span className="font-medium text-slate-700">{selectedPayslip.payment_method}</span>
                </div>
              </div>

              {/* Itemized Allowances & Statutory Deductions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {/* Allowances */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-emerald-800 text-xs uppercase tracking-wider border-b border-slate-150 pb-2">
                    Earnings & Allowances
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Basic Salary:</span>
                      <span className="font-mono font-semibold">${parseFloat(String(selectedPayslip.basic_salary)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Housing Allowance (20%):</span>
                      <span className="font-mono">${parseFloat(String(selectedPayslip.housing_allowance)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Medical Allowance (10%):</span>
                      <span className="font-mono">${parseFloat(String(selectedPayslip.medical_allowance)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Transport Allowance:</span>
                      <span className="font-mono">${parseFloat(String(selectedPayslip.transport_allowance)).toLocaleString()}</span>
                    </div>
                    {parseFloat(String(selectedPayslip.bonus_allowance)) > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Performance Bonus:</span>
                        <span className="font-mono">+${parseFloat(String(selectedPayslip.bonus_allowance)).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Gross Earnings:</span>
                      <span className="font-mono">${parseFloat(String(selectedPayslip.gross_salary)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="font-bold text-rose-800 text-xs uppercase tracking-wider border-b border-slate-150 pb-2">
                    Statutory Deductions
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Income Tax Withholding (15%):</span>
                      <span className="font-mono text-rose-600">-${parseFloat(String(selectedPayslip.tax_deduction)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Provident Fund (8%):</span>
                      <span className="font-mono text-rose-600">-${parseFloat(String(selectedPayslip.provident_fund)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Health Insurance:</span>
                      <span className="font-mono text-rose-600">-${parseFloat(String(selectedPayslip.health_insurance)).toLocaleString()}</span>
                    </div>
                    {parseFloat(String(selectedPayslip.unpaid_leave_deduction)) > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Unpaid Leave Deductions:</span>
                        <span className="font-mono">-${parseFloat(String(selectedPayslip.unpaid_leave_deduction)).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-rose-700">
                      <span>Total Deductions:</span>
                      <span className="font-mono">-${parseFloat(String(selectedPayslip.total_deductions)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-emerald-700 block font-bold">
                    Net Take-Home Pay
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-900">
                    ${parseFloat(String(selectedPayslip.net_salary)).toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                    {selectedPayslip.status}
                  </span>
                  <p className="text-[11px] text-emerald-700 mt-1 font-mono">
                    Direct Credit Confirmed
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">Authorized HR & Payroll Officer</p>
                  <p className="font-mono text-[10px]">Aura ERP Automated Disbursement Engine</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-700">Employee Signature</p>
                  <p className="font-mono text-[10px]">Digitally verified • ID: {selectedPayslip.employee_id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
