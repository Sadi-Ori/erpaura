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
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { getContacts, createContact } from '@/lib/erp-api';
import { Contact } from '@/lib/types';

export default function CRMContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('Director');
  const [contactType, setContactType] = useState('customer');
  const [address, setAddress] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createContact({
        name,
        company,
        email,
        phone,
        job_title: jobTitle,
        contact_type: contactType,
        status: 'active',
        address,
      });
      setModalOpen(false);
      setToastMsg(`Contact ${name} added!`);
      setTimeout(() => setToastMsg(''), 4000);
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setAddress('');
      loadContacts();
    } catch (err) {
      console.error(err);
      setToastMsg('Error creating contact.');
    }
  };

  const filtered = contacts.filter((c) => {
    if (typeFilter !== 'all' && c.contact_type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-purple-600 text-white shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header Bar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Contacts' },
            { id: 'customer', label: 'Customers' },
            { id: 'lead', label: 'Prospects' },
            { id: 'vendor', label: 'Vendors' },
            { id: 'partner', label: 'Partners' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-colors ${
                typeFilter === t.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search contact, company, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Contact</span>
          </button>
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const typeBadges: Record<string, string> = {
            customer: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            lead: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            vendor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            partner: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          };

          return (
            <div
              key={c.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                      typeBadges[c.contact_type] || 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {c.contact_type}
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">• Active Account</span>
                </div>

                <h3 className="text-base font-bold text-white">{c.name}</h3>
                <p className="text-xs text-slate-400 font-medium">
                  {c.job_title || 'Executive'} • {c.company || 'Enterprise Org'}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{c.email}</span>
                </div>
                {c.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.phone}</span>
                  </div>
                )}
                {c.address && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Customer 360 Linked</span>
                <span className="text-purple-400 font-semibold">View Details</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-purple-400">
              <Users className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Add Contact 360</h3>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Jordan Hayes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Company / Org</label>
                  <input
                    type="text"
                    placeholder="e.g. BioCore Labs"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    placeholder="jordan@biocore.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Contact Type</label>
                <select
                  value={contactType}
                  onChange={(e) => setContactType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                >
                  <option value="customer">Customer</option>
                  <option value="lead">Prospective Lead</option>
                  <option value="vendor">Vendor / Supplier</option>
                  <option value="partner">Strategic Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Address</label>
                <input
                  type="text"
                  placeholder="City, State, Country"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30"
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
