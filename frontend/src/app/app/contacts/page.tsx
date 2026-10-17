'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building,
  Briefcase,
  TrendingUp,
  Tag,
  CheckCircle2,
  X,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { getContacts, getLeads, createContact } from '@/lib/erp-api';
import { Contact, Lead } from '@/lib/types';

export default function ContactsCRMPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [contactType, setContactType] = useState('customer');
  const [address, setAddress] = useState('');

  useEffect(() => {
    Promise.all([getContacts(), getLeads()]).then(([c, l]) => {
      setContacts(c);
      setLeads(l);
      setLoading(false);
    });
  }, []);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      const created = await createContact({
        name,
        email,
        phone,
        company,
        job_title: jobTitle,
        contact_type: contactType,
        address,
        status: 'active',
      });
      setContacts((prev) => [created, ...prev]);
      resetForm();
    } catch (e) {
      const local: Contact = {
        id: Date.now(),
        name,
        email,
        phone,
        company,
        job_title: jobTitle,
        contact_type: contactType,
        address,
        status: 'active',
      };
      setContacts((prev) => [local, ...prev]);
      resetForm();
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setJobTitle('');
    setContactType('customer');
    setAddress('');
    setModalOpen(false);
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesTab = selectedTab === 'all' || c.contact_type === selectedTab;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Contacts & CRM Pipeline</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Aureus CRM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centralized directory of customers, suppliers, prospective leads, and strategic partners.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'all', label: 'All Contacts' },
            { id: 'customer', label: 'Customers' },
            { id: 'vendor', label: 'Suppliers & Vendors' },
            { id: 'lead', label: 'Leads' },
            { id: 'partner', label: 'Partners' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTab === tab.id
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-hidden text-xs text-slate-200 placeholder-slate-500 w-full"
          />
        </div>

      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{contact.name}</h3>
                  <div className="text-xs text-indigo-400 font-medium">{contact.company || 'Private Entity'}</div>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                contact.contact_type === 'customer' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                contact.contact_type === 'vendor' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                contact.contact_type === 'lead' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-purple-500/20 text-purple-300'
              }`}>
                {contact.contact_type}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{contact.phone || '+1 (555) 012-3456'}</span>
              </div>
              {contact.address && (
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{contact.address}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500">{contact.job_title || 'Contact'}</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Active Record
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* CRM Lead Pipeline Preview */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Active Lead Opportunities Funnel</span>
            </h2>
            <p className="text-xs text-slate-400">Pipeline forecasting and deal conversion stages</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 font-mono">
            ${leads.reduce((acc, curr) => acc + parseFloat(String(curr.estimated_value || 0)), 0).toLocaleString()} Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {leads.map((lead) => (
            <div key={lead.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white line-clamp-1">{lead.title}</span>
                <span className="text-xs font-bold text-emerald-400">${parseFloat(String(lead.estimated_value)).toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Account: {lead.contact_name || 'Acme Corp'}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                  {lead.stage}
                </span>
              </div>

              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                  style={{ width: `${lead.probability_percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Contact Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add New Contact</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name / Entity Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Sterling"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Company / Org</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Dynamics"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Contact Type</label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Supplier / Vendor</option>
                    <option value="lead">Prospective Lead</option>
                    <option value="partner">Strategic Partner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Billing / Shipping Address</label>
                <input
                  type="text"
                  placeholder="Street, City, State, ZIP"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
