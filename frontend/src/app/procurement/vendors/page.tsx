'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Building,
  Mail,
  Phone,
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { getContacts, createContact } from '@/lib/erp-api';
import { Contact } from '@/lib/types';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New Vendor Form
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('Procurement Lead');
  const [address, setAddress] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const loadVendors = async () => {
    try {
      const contacts = await getContacts();
      const vendorList = contacts.filter((c) => c.contact_type === 'vendor' || c.contact_type === 'partner');
      setVendors(vendorList.length > 0 ? vendorList : contacts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContact({
        name,
        company,
        email,
        phone,
        job_title: jobTitle,
        contact_type: 'vendor',
        status: 'active',
        address,
      });
      setModalOpen(false);
      setToastMsg(`Vendor ${company || name} added successfully!`);
      setTimeout(() => setToastMsg(''), 4000);
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setAddress('');
      loadVendors();
    } catch (err) {
      console.error(err);
      setToastMsg('Failed to add vendor.');
    }
  };

  const filtered = vendors.filter((v) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        (v.company && v.company.toLowerCase().includes(q)) ||
        v.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-rose-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white">Approved Suppliers & Strategic Vendors</h2>
          <p className="text-xs text-slate-400">
            Active vendor price books, credit terms, and delivery performance scorecards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search vendor or contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Vendors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {v.contact_type === 'partner' ? 'Strategic Partner' : 'Certified Vendor'}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Approved Tier 1</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{v.company || v.name}</h3>
              <p className="text-xs text-slate-400 font-medium">{v.name} • {v.job_title || 'Account Director'}</p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{v.email}</span>
              </div>
              {v.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{v.phone}</span>
                </div>
              )}
              {v.address && (
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{v.address}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Payment Terms: Net 30</span>
              <span className="text-rose-400 font-semibold">Active Supplier</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-rose-400">
              <Building className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Register Approved Supplier</h3>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Industrial Components Ltd"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Primary Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="sales@vendor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-rose-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">HQ Address / Facility Location</label>
                <input
                  type="text"
                  placeholder="City, State, Country"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/30"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
