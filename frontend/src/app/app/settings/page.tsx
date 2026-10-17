'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building2,
  DollarSign,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Save,
  Database,
  Cpu,
  Key,
} from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('Aura Enterprise Global Inc.');
  const [taxId, setTaxId] = useState('US-EIN-99281928');
  const [currency, setCurrency] = useState('USD ($)');
  const [taxRate, setTaxRate] = useState('5.0');
  const [fiscalYear, setFiscalYear] = useState('January - December');
  const [apiUrl, setApiUrl] = useState('http://127.0.0.1:8000/api/');
  const [mcpEnabled, setMcpEnabled] = useState(true);

  // Module toggles
  const [modules, setModules] = useState({
    pms: true,
    timesheets: true,
    crm: true,
    sales: true,
    pos: true,
    procurement: true,
    inventory: true,
    manufacturing: true,
    maintenance: true,
    hr: true,
  });

  const toggleModule = (key: keyof typeof modules) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">ERP System Settings</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Aura Configuration
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure legal entity metadata, localization parameters, module availability, and API endpoints.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Company Entity Details */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Company & Entity Metadata</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Legal Enterprise Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Federal Tax / VAT ID</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Financial & Fiscal Configuration */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Financial & Regional Localization</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="USD ($)">USD ($) — US Dollar</option>
                <option value="EUR (€)">EUR (€) — Euro</option>
                <option value="GBP (£)">GBP (£) — British Pound</option>
                <option value="JPY (¥)">JPY (¥) — Japanese Yen</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Default Sales Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Fiscal Year Calendar</label>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
              >
                <option value="January - December">January - December (Calendar Year)</option>
                <option value="April - March">April - March (UK / Commonwealth)</option>
                <option value="July - June">July - June (Australia / NZ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Modules Toggle Matrix */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">Installed Module Packages (Aureus Plug-in Architecture)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { id: 'pms', name: 'Project Management System (PMS)', desc: 'Tasks, stages, Kanban & milestones' },
              { id: 'timesheets', name: 'Timesheets & Worklog', desc: 'Live stopwatch and hours logging' },
              { id: 'crm', name: 'Contacts & CRM Funnel', desc: 'Customers, suppliers, leads pipeline' },
              { id: 'sales', name: 'Sales & Quotations', desc: 'Proposals, order conversion, invoicing' },
              { id: 'pos', name: 'Point of Sale (POS)', desc: 'Fast retail register with cash/card tender' },
              { id: 'procurement', name: 'Procurement (Purchase Orders)', desc: 'Vendor orders and goods receipt' },
              { id: 'inventory', name: 'Inventory & Warehouses (WMS)', desc: 'Stock allocation and cycle count adjustments' },
              { id: 'manufacturing', name: 'Manufacturing & MRP', desc: 'Bill of Materials recipes and work orders' },
              { id: 'maintenance', name: 'Maintenance & Assets', desc: 'Equipment inspections & repair tickets' },
              { id: 'hr', name: 'Human Resources & Leaves', desc: 'Employee directory & PTO approvals' },
            ].map((mod) => {
              const isEnabled = modules[mod.id as keyof typeof modules];

              return (
                <div
                  key={mod.id}
                  onClick={() => toggleModule(mod.id as keyof typeof modules)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isEnabled
                      ? 'bg-slate-950 border-indigo-500/40 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">{mod.name}</div>
                    <div className="text-[10px] text-slate-400">{mod.desc}</div>
                  </div>

                  <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    isEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Backend & Integration Endpoints */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Database className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white">Django REST API & MCP Integration</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Active Backend Gateway URL</label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <div className="font-bold text-white">Model Context Protocol (MCP) AI Tooling Server</div>
                <div className="text-[11px] text-slate-400">Allows Claude / Gemini agents to query ERP inventory, sales and PMS tasks.</div>
              </div>

              <input
                type="checkbox"
                checked={mcpEnabled}
                onChange={(e) => setMcpEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.01]"
          >
            <Save className="w-4 h-4" />
            <span>Save System Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
}
