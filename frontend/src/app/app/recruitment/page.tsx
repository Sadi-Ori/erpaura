'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Building2,
  Sparkles,
  ArrowRight,
  Video,
  Clock,
  Star,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Plus,
} from 'lucide-react';
import RecruitmentSubNav from './RecruitmentSubNav';
import {
  Vacancy,
  JobApplication,
  Interview,
  Subsidiary,
  RecruitmentStats,
} from '@/lib/types';
import {
  getRecruitmentStats,
  getVacancies,
  getJobApplications,
  getInterviews,
  advanceApplicationStage,
  rateApplication,
} from '@/lib/recruitment-api';

export default function RecruitmentDashboardPage() {
  const [stats, setStats] = useState<RecruitmentStats | null>(null);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const [st, vacs, apps, ints] = await Promise.all([
        getRecruitmentStats(),
        getVacancies(),
        getJobApplications(),
        getInterviews(),
      ]);
      setStats(st);
      setVacancies(vacs);
      setApplications(apps);
      setInterviews(ints);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const handleQuickAdvance = async (appId: number, nextStage: string) => {
    const updated = await advanceApplicationStage(appId, nextStage);
    if (updated) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, stage: updated.stage } : a))
      );
    }
  };

  const handleQuickRate = async (appId: number, rating: number) => {
    const updated = await rateApplication(appId, rating);
    if (updated) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, recruiter_rating: updated.recruiter_rating } : a))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Recruitment Management System
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Enterprise ATS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Govern vacancies, screen incoming resumes, schedule panel interviews, and record structured scorecard evaluations across all subsidiaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/app/recruitment/vacancies"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Vacancy</span>
          </Link>
          <Link
            href="/app/recruitment/pipeline"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Open Pipeline</span>
          </Link>
        </div>
      </div>

      {/* Sub Navigation */}
      <RecruitmentSubNav />

      {/* Top KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Published Vacancies</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {stats?.published_vacancies ?? vacancies.filter((v) => v.status === 'published').length}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">Across 4 Subsidiaries</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Active Pipeline</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {applications.filter((a) => !a.is_draft).length}
            </div>
            <span className="text-[10px] text-purple-300 font-medium">Candidates in Screening</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Scheduled Interviews</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {interviews.filter((i) => i.status === 'scheduled').length}
            </div>
            <span className="text-[10px] text-cyan-400 font-medium">Technical & Panel Rounds</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Offers / Selected</span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {applications.filter((a) => a.stage === 'selected').length}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">Final Stage Candidates</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Pipeline Funnel & Subsidiary Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pipeline Stage Distribution & Quick Review */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline Stage Bar */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>Candidate Pipeline Funnel</span>
              </h2>
              <Link href="/app/recruitment/pipeline" className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                <span>View Kanban Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-400">Received</span>
                <span className="block text-lg font-bold text-white">
                  {applications.filter((a) => a.stage === 'submitted').length}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-400">Review</span>
                <span className="block text-lg font-bold text-white">
                  {applications.filter((a) => a.stage === 'under_review').length}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-400">Shortlisted</span>
                <span className="block text-lg font-bold text-white">
                  {applications.filter((a) => a.stage === 'shortlisted').length}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400">Interview</span>
                <span className="block text-lg font-bold text-white">
                  {applications.filter((a) => a.stage === 'interview').length}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Offer / Hired</span>
                <span className="block text-lg font-bold text-white">
                  {applications.filter((a) => a.stage === 'selected').length}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Candidate Applications Stream */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Active Candidate Applications</span>
              </h2>
              <span className="text-xs text-slate-400">{applications.length} total entries</span>
            </div>

            <div className="divide-y divide-slate-800">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{app.applicant_name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                        {app.application_number}
                      </span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-2">
                      <span>{app.vacancy_title}</span>
                      <span>&bull;</span>
                      <span className="text-slate-500">{app.subsidiary_name}</span>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 pt-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleQuickRate(app.id, star)}
                          className="hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-3 h-3 ${
                              star <= app.recruiter_rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stage Advance Dropdown & Actions */}
                  <div className="flex items-center gap-2">
                    <select
                      value={app.stage}
                      onChange={(e) => handleQuickAdvance(app.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2.5 py-1.5 text-xs focus:outline-hidden focus:border-purple-500"
                    >
                      <option value="submitted">Received</option>
                      <option value="under_review">Screening</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview">Interview</option>
                      <option value="selected">Offer / Selected</option>
                      <option value="not_selected">Declined</option>
                    </select>

                    <Link
                      href="/app/recruitment/pipeline"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Multi-Subsidiary Breakdown & Upcoming Interviews */}
        <div className="space-y-6">
          {/* Subsidiary Entity Distribution */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>Multi-Subsidiary Activity</span>
            </h2>

            <div className="space-y-3 text-xs">
              {stats?.subsidiaries?.map((sub) => (
                <div key={sub.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{sub.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-purple-300">
                      {sub.code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Active Vacancies:</span>
                    <span className="font-bold text-emerald-400">{sub.active_vacancies}</span>
                  </div>
                </div>
              )) || (
                <div className="text-slate-500 text-xs">Loading subsidiaries...</div>
              )}
            </div>
          </div>

          {/* Scheduled Interviews Widget */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <span>Upcoming Interviews</span>
              </h2>
              <Link href="/app/recruitment/interviews" className="text-xs text-purple-400 hover:text-purple-300 font-semibold">
                Manage
              </Link>
            </div>

            <div className="space-y-3">
              {interviews.slice(0, 3).map((intw) => (
                <div key={intw.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate">{intw.applicant_name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {intw.round_type}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] truncate">{intw.title}</p>
                  <div className="flex items-center justify-between text-slate-400 pt-1 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>{intw.scheduled_date} &bull; {intw.scheduled_time}</span>
                    </div>
                    {intw.location_or_url && (
                      <a
                        href={intw.location_or_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        <span>Meet</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
