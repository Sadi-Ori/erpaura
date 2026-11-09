'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Search,
  User,
  ShieldCheck,
} from 'lucide-react';
import { JobApplication } from '@/lib/types';
import { getJobApplications } from '@/lib/recruitment-api';

export default function MyApplicationsPage() {
  const [emailInput, setEmailInput] = useState('marcus.vance@example.com');
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);

  const loadApplications = async (email: string) => {
    setLoading(true);
    const data = await getJobApplications({ email });
    setApplications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadApplications(emailInput);
  }, []);

  const getStageBadge = (stage: string, isDraft: boolean) => {
    if (isDraft || stage === 'draft') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          Draft (Unsubmitted)
        </span>
      );
    }
    switch (stage) {
      case 'submitted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Application Received
          </span>
        );
      case 'under_review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Under Review & Screening
          </span>
        );
      case 'shortlisted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Shortlisted Candidate
          </span>
        );
      case 'interview':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
            <Video className="w-3 h-3" />
            Interview Stage
          </span>
        );
      case 'selected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Selected / Offer Extended 🎉
          </span>
        );
      case 'not_selected':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Not Selected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            {stage}
          </span>
        );
    }
  };

  // Stage progression step mapping
  const getStepIndex = (stage: string) => {
    switch (stage) {
      case 'draft': return 0;
      case 'submitted': return 1;
      case 'under_review': return 2;
      case 'shortlisted': return 3;
      case 'interview': return 4;
      case 'selected': return 5;
      default: return 1;
    }
  };

  const steps = [
    'Submitted',
    'Screening',
    'Shortlisted',
    'Interview',
    'Offer / Decision',
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Real-Time Status Tracking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Job Applications
            </h1>
            <p className="text-xs text-slate-400">
              Track the progress of all applications submitted across Aura subsidiaries.
            </p>
          </div>

          <Link
            href="/recruitment"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 self-start sm:self-auto shadow-md transition-all"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Browse More Roles</span>
          </Link>
        </div>

        {/* Candidate Switcher */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-400">View Applications for Email:</span>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="candidate@example.com"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-purple-500 w-64"
            />
            <button
              onClick={() => loadApplications(emailInput)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
            >
              Filter
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Quick switch:</span>
            <button
              onClick={() => {
                setEmailInput('marcus.vance@example.com');
                loadApplications('marcus.vance@example.com');
              }}
              className="text-purple-400 hover:underline"
            >
              Marcus Vance
            </button>
            <span>&bull;</span>
            <button
              onClick={() => {
                setEmailInput('david.kim@example.com');
                loadApplications('david.kim@example.com');
              }}
              className="text-purple-400 hover:underline"
            >
              David Kim
            </button>
            <span>&bull;</span>
            <button
              onClick={() => {
                setEmailInput('elena.rostova@example.com');
                loadApplications('elena.rostova@example.com');
              }}
              className="text-purple-400 hover:underline"
            >
              Elena Rostova
            </button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
            Loading your applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No applications found for {emailInput}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven&apos;t submitted any job applications under this email yet. Explore open vacancies to apply!
            </p>
            <Link
              href="/recruitment"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all"
            >
              <Briefcase className="w-4 h-4" />
              <span>Browse Open Positions</span>
            </Link>
          </div>
        ) : (
          applications.map((app) => {
            const stepIndex = getStepIndex(app.stage);
            const activeInterview = app.interviews && app.interviews.length > 0 ? app.interviews[0] : null;

            return (
              <div
                key={app.id}
                className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-6"
              >
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30">
                        {app.subsidiary_name}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {app.application_number}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      <Link href={`/recruitment/jobs/${app.vacancy}`} className="hover:text-purple-300 transition-colors">
                        {app.vacancy_title}
                      </Link>
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStageBadge(app.stage, app.is_draft)}
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="p-4 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                  <span className="text-xs font-semibold text-slate-400 block">Recruitment Stage Pipeline</span>
                  <div className="grid grid-cols-5 gap-2 text-center text-[11px]">
                    {steps.map((st, sIdx) => {
                      const isComplete = stepIndex >= sIdx + 1;
                      const isCurrent = stepIndex === sIdx + 1;
                      return (
                        <div key={sIdx} className="space-y-1.5">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isComplete
                                ? 'bg-purple-500'
                                : 'bg-slate-800'
                            }`}
                          />
                          <span
                            className={`block truncate ${
                              isCurrent
                                ? 'font-bold text-purple-300'
                                : isComplete
                                ? 'text-slate-300'
                                : 'text-slate-600'
                            }`}
                          >
                            {st}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scheduled Interview Highlight (if active) */}
                {activeInterview && activeInterview.status === 'scheduled' && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-purple-400" />
                        <span className="font-bold text-white text-sm">Upcoming Interview Appointment</span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        Confirmed & Scheduled
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 pt-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Date: {activeInterview.scheduled_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Time: {activeInterview.scheduled_time} ({activeInterview.duration_minutes} mins)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-400 shrink-0" />
                        <span className="truncate">Panel: {activeInterview.panelist_names}</span>
                      </div>
                    </div>

                    {activeInterview.location_or_url && (
                      <div className="pt-2 flex items-center justify-between border-t border-purple-500/20 text-xs">
                        <span className="text-slate-400">Meeting Link:</span>
                        <a
                          href={activeInterview.location_or_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-purple-300 hover:text-white font-semibold underline"
                        >
                          <span>{activeInterview.location_or_url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Details Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div>
                    <span>Submitted: </span>
                    <span className="text-slate-200">
                      {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : 'Unsubmitted Draft'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {app.resume_url && (
                      <a
                        href={app.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Attached Resume</span>
                      </a>
                    )}

                    <Link
                      href={`/recruitment/jobs/${app.vacancy}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>Role Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
