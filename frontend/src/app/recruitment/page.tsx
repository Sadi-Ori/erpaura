'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Search,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Users,
  Layers,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Vacancy, Subsidiary } from '@/lib/types';
import { getVacancies, getSubsidiaries } from '@/lib/recruitment-api';

export default function CareerPortalPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string>('all');
  const [selectedJobType, setSelectedJobType] = useState<string>('all');
  const [selectedExpLevel, setSelectedExpLevel] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [vacData, subData] = await Promise.all([
        getVacancies(),
        getSubsidiaries(),
      ]);
      setVacancies(vacData);
      setSubsidiaries(subData);
      setLoading(false);
    }
    loadData();
  }, []);

  // Filtered vacancies
  const filteredVacancies = vacancies.filter((v) => {
    // Only published vacancies for applicants
    if (v.status !== 'published') return false;

    if (selectedSubsidiary !== 'all' && String(v.subsidiary) !== selectedSubsidiary) {
      return false;
    }
    if (selectedJobType !== 'all' && v.job_type !== selectedJobType) {
      return false;
    }
    if (selectedExpLevel !== 'all' && v.experience_level !== selectedExpLevel) {
      return false;
    }
    if (selectedDept !== 'all' && v.department_name !== selectedDept) {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = v.title.toLowerCase().includes(q);
      const matchDesc = v.description.toLowerCase().includes(q);
      const matchSub = v.subsidiary_name?.toLowerCase().includes(q);
      const matchSkills = v.required_skills?.some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSub && !matchSkills) return false;
    }
    return true;
  });

  // Unique departments for filter
  const departments = Array.from(new Set(vacancies.map((v) => v.department_name).filter(Boolean)));

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-b from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/20 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Join Our Global Enterprise Talent Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Build the Next Generation of <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">Enterprise Software</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover roles across Aura Technologies, Retail Dynamics, Global Logistics, and FinTech. Create a reusable applicant profile once, and apply to any opportunity in a single click.
          </p>

          {/* Search & Filter Bar */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="relative flex items-center bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg p-2 gap-2 focus-within:border-purple-500 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-2.5 shrink-0" />
              <input
                type="text"
                placeholder="Search by job title, skill (Python, React, AWS), or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-hidden pr-2"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter Selectors */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <select
                value={selectedSubsidiary}
                onChange={(e) => setSelectedSubsidiary(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-hidden focus:border-purple-500"
              >
                <option value="all">🏢 All Subsidiaries</option>
                {subsidiaries.map((sub) => (
                  <option key={sub.id} value={String(sub.id)}>
                    {sub.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-hidden focus:border-purple-500"
              >
                <option value="all">📂 All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-hidden focus:border-purple-500"
              >
                <option value="all">💼 All Types</option>
                <option value="full_time">Full-Time</option>
                <option value="remote">Fully Remote</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>

              <select
                value={selectedExpLevel}
                onChange={(e) => setSelectedExpLevel(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-hidden focus:border-purple-500"
              >
                <option value="all">🎯 Experience Level</option>
                <option value="entry">Entry (0-2 yrs)</option>
                <option value="mid">Mid (3-5 yrs)</option>
                <option value="senior">Senior (5-8 yrs)</option>
                <option value="lead">Lead / Staff (8+ yrs)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Subsidiary Showcase Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span>Participating Subsidiaries & Divisions</span>
            </h2>
            <p className="text-xs text-slate-400">Click any subsidiary to inspect its dedicated openings</p>
          </div>
          <button
            onClick={() => {
              setSelectedSubsidiary('all');
              setSelectedDept('all');
              setSelectedJobType('all');
              setSelectedExpLevel('all');
              setSearchTerm('');
            }}
            className="text-xs text-purple-400 hover:text-purple-300 font-medium"
          >
            Reset All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subsidiaries.map((sub) => {
            const isSelected = selectedSubsidiary === String(sub.id);
            const count = vacancies.filter((v) => v.status === 'published' && v.subsidiary === sub.id).length;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubsidiary(isSelected ? 'all' : String(sub.id))}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-purple-950/50 border-purple-500 shadow-md shadow-purple-500/10 ring-1 ring-purple-500'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                    {sub.code}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {count} {count === 1 ? 'Role' : 'Roles'}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white">{sub.name}</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{sub.industry}</p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span>{sub.city}, {sub.country}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Vacancy Openings List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <span>Available Positions</span>
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {filteredVacancies.length} {filteredVacancies.length === 1 ? 'Opening' : 'Openings'}
            </span>
          </div>

          <Link
            href="/recruitment/profile"
            className="text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Manage My Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
            Loading available positions from Aura Recruitment Engine...
          </div>
        ) : filteredVacancies.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="font-bold text-white text-base">No vacancies found matching your criteria</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search terms, subsidiary filter, or experience level.
            </p>
            <button
              onClick={() => {
                setSelectedSubsidiary('all');
                setSelectedDept('all');
                setSelectedJobType('all');
                setSelectedExpLevel('all');
                setSearchTerm('');
              }}
              className="text-xs px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVacancies.map((vacancy) => (
              <div
                key={vacancy.id}
                className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 shadow-xs hover:shadow-xl hover:shadow-purple-500/5 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Entity & Department badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
                        {vacancy.subsidiary_code || vacancy.subsidiary_name}
                      </span>
                      {vacancy.department_name && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {vacancy.department_name}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      {vacancy.openings_count} {vacancy.openings_count === 1 ? 'Opening' : 'Openings'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    <Link href={`/recruitment/jobs/${vacancy.id}`}>
                      {vacancy.title}
                    </Link>
                  </h3>

                  {/* Meta details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{vacancy.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="capitalize">{vacancy.job_type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        {vacancy.salary_min && vacancy.salary_max
                          ? `$${Number(vacancy.salary_min).toLocaleString()} - $${Number(vacancy.salary_max).toLocaleString()}`
                          : 'Competitive Band'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{vacancy.min_experience_years}+ yrs exp</span>
                    </div>
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {vacancy.description}
                  </p>

                  {/* Required skills badges */}
                  {vacancy.required_skills && vacancy.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {vacancy.required_skills.slice(0, 5).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
                        >
                          {skill}
                        </span>
                      ))}
                      {vacancy.required_skills.length > 5 && (
                        <span className="text-[10px] text-slate-500 self-center">
                          +{vacancy.required_skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Code: {vacancy.vacancy_code}
                  </span>
                  <Link
                    href={`/recruitment/jobs/${vacancy.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-xs group-hover:shadow-md group-hover:shadow-purple-500/20 transition-all"
                  >
                    <span>View Role & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature Highlights: Reusable Profile & Transparent Workflow */}
      <section className="rounded-3xl bg-slate-900/50 border border-slate-800 p-8 sm:p-10 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white">How the Aura Recruitment System Works</h2>
          <p className="text-xs text-slate-400">
            Engineered for frictionless candidate experiences across multi-company enterprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-sm text-white">Build Your Reusable Profile</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add your education credentials, employment history, and technical proficiencies once. No re-typing required on subsequent applications.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-sm text-white">Save Drafts & Apply In 1-Click</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Answer position-specific screening questions, attach custom cover notes, and save drafts until you are fully ready to submit.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-sm text-white">Live Pipeline & Interview Tracker</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Monitor your stage advancement in real time from Screening to Interview and Offer, complete with scheduled video conference links.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
