'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Columns3,
  Users,
  Search,
  Filter,
  Star,
  FileText,
  Calendar,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  GraduationCap,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import RecruitmentSubNav from '../RecruitmentSubNav';
import { JobApplication, Vacancy } from '@/lib/types';
import {
  getJobApplications,
  getVacancies,
  advanceApplicationStage,
  rateApplication,
  addApplicationNote,
} from '@/lib/recruitment-api';

const PIPELINE_COLUMNS = [
  { key: 'submitted', title: 'Received', color: 'border-blue-500/40 text-blue-400 bg-blue-950/20' },
  { key: 'under_review', title: 'Screening', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-950/20' },
  { key: 'shortlisted', title: 'Shortlisted', color: 'border-purple-500/40 text-purple-400 bg-purple-950/20' },
  { key: 'interview', title: 'Interview', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20' },
  { key: 'selected', title: 'Offer / Selected', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20' },
  { key: 'not_selected', title: 'Declined', color: 'border-rose-500/40 text-rose-400 bg-rose-950/20' },
];

export default function CandidatePipelinePage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [selectedVacancy, setSelectedVacancy] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Candidate detail drawer
  const [selectedCandidate, setSelectedCandidate] = useState<JobApplication | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    loadPipeline();
  }, []);

  const loadPipeline = async () => {
    setLoading(true);
    const [apps, vacs] = await Promise.all([getJobApplications(), getVacancies()]);
    setApplications(apps);
    setVacancies(vacs);
    setLoading(false);
  };

  const handleStageMove = async (appId: number, nextStage: string) => {
    const updated = await advanceApplicationStage(appId, nextStage);
    if (updated) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, stage: updated.stage } : a))
      );
      if (selectedCandidate && selectedCandidate.id === appId) {
        setSelectedCandidate({ ...selectedCandidate, stage: updated.stage as any });
      }
    }
  };

  const handleRate = async (appId: number, rating: number) => {
    const updated = await rateApplication(appId, rating);
    if (updated) {
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, recruiter_rating: updated.recruiter_rating } : a))
      );
      if (selectedCandidate && selectedCandidate.id === appId) {
        setSelectedCandidate({ ...selectedCandidate, recruiter_rating: updated.recruiter_rating });
      }
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !newNoteText.trim()) return;

    setAddingNote(true);
    const createdNote = await addApplicationNote(selectedCandidate.id, newNoteText);
    setAddingNote(false);
    if (createdNote) {
      const updatedNotes = [...(selectedCandidate.notes || []), createdNote];
      setSelectedCandidate({ ...selectedCandidate, notes: updatedNotes });
      setNewNoteText('');
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (selectedVacancy !== 'all' && String(app.vacancy) !== selectedVacancy) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        app.applicant_name?.toLowerCase().includes(q) ||
        app.application_number.toLowerCase().includes(q) ||
        app.vacancy_title?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Recruitment Pipeline Kanban
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Interactive Board
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track candidates across stages, evaluate ratings, inspect screening questionnaires, and record internal observations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedVacancy}
            onChange={(e) => setSelectedVacancy(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-purple-500 max-w-xs"
          >
            <option value="all">🌟 All Vacancies ({applications.length})</option>
            {vacancies.map((v) => (
              <option key={v.id} value={String(v.id)}>
                {v.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <RecruitmentSubNav />

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-6">
        {PIPELINE_COLUMNS.map((col) => {
          const colApps = filteredApplications.filter((a) => a.stage === col.key);

          return (
            <div
              key={col.key}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 min-w-[240px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {colApps.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 min-h-[300px]">
                {colApps.length === 0 ? (
                  <div className="py-12 text-center text-[11px] text-slate-600 border border-dashed border-slate-800/80 rounded-2xl">
                    No candidates
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedCandidate(app)}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 cursor-pointer shadow-xs hover:shadow-md transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-purple-400 font-bold">
                          {app.application_number}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-2.5 h-2.5 ${
                                s <= app.recruiter_rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                        {app.applicant_name}
                      </h4>

                      <p className="text-[11px] text-slate-400 truncate">
                        {app.vacancy_title}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                        <span className="truncate">{app.subsidiary_name}</span>
                        <select
                          value={app.stage}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStageMove(app.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-hidden"
                        >
                          <option value="submitted">Received</option>
                          <option value="under_review">Screening</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="selected">Offer</option>
                          <option value="not_selected">Declined</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* Candidate Profile & Internal Recruiter Notes Drawer */}
      {/* ========================================================================= */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-end p-0">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full shadow-2xl p-6 sm:p-8 space-y-6 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">
                  {selectedCandidate.application_number}
                </span>
                <h3 className="text-xl font-bold text-white">{selectedCandidate.applicant_name}</h3>
                <p className="text-xs text-slate-400">{selectedCandidate.vacancy_title} &bull; {selectedCandidate.subsidiary_name}</p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions: Stage & Rating */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Advance Candidate Stage:</span>
                <select
                  value={selectedCandidate.stage}
                  onChange={(e) => handleStageMove(selectedCandidate.id, e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-purple-300 font-bold rounded-xl px-3 py-1.5 focus:outline-hidden"
                >
                  <option value="submitted">Application Received</option>
                  <option value="under_review">Under Screening</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview">Interview Scheduled</option>
                  <option value="selected">Offer Extended 🎉</option>
                  <option value="not_selected">Declined / Archived</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400 font-semibold">Recruiter Score (1-5):</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(selectedCandidate.id, star)}
                      className="hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= selectedCandidate.recruiter_rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Candidate Cover Letter */}
            {selectedCandidate.cover_letter && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white block">Cover Letter / Inbound Message:</span>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {selectedCandidate.cover_letter}
                </p>
              </div>
            )}

            {/* Answers to Screening Questions */}
            {selectedCandidate.answers && selectedCandidate.answers.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-white block">Screening Question Answers:</span>
                <div className="space-y-2">
                  {selectedCandidate.answers.map((ans) => (
                    <div key={ans.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <p className="text-slate-400 font-medium">{ans.question_text}</p>
                      <p className="text-white font-semibold">{ans.answer_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resume Link */}
            {selectedCandidate.resume_url && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs">
                <div className="flex items-center gap-2 text-purple-300">
                  <FileText className="w-4 h-4" />
                  <span className="font-semibold">Candidate Resume Attachment</span>
                </div>
                <a
                  href={selectedCandidate.resume_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1"
                >
                  <span>Open CV</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Internal Recruiter Notes */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-white block flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Internal Recruiter Notes ({selectedCandidate.notes?.length || 0})</span>
              </span>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedCandidate.notes && selectedCandidate.notes.length > 0 ? (
                  selectedCandidate.notes.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-semibold text-purple-300">{n.author_name}</span>
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-300">{n.note_text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-2">No notes recorded yet.</p>
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add private recruiter note..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-hidden focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={addingNote || !newNoteText.trim()}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shrink-0 flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
