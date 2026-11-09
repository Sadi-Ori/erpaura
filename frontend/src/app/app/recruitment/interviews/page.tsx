'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Star,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  User,
  Users,
  Award,
  X,
  Send,
  FileText,
} from 'lucide-react';
import RecruitmentSubNav from '../RecruitmentSubNav';
import { Interview, JobApplication, InterviewEvaluation } from '@/lib/types';
import {
  getInterviews,
  getJobApplications,
  createInterview,
  evaluateInterview,
} from '@/lib/recruitment-api';

export default function InterviewsManagementPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Schedule Interview Modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number>(1);
  const [roundType, setRoundType] = useState<'screening' | 'technical' | 'cultural' | 'executive' | 'final'>('technical');
  const [interviewType, setInterviewType] = useState<'video' | 'phone' | 'in_person'>('video');
  const [schedDate, setSchedDate] = useState('2026-11-10');
  const [schedTime, setSchedTime] = useState('14:00');
  const [schedDuration, setSchedDuration] = useState(45);
  const [schedUrl, setSchedUrl] = useState('https://meet.google.com/aur-recr-app');
  const [schedPanelists, setSchedPanelists] = useState('Alex Vance (Lead Architect), Sara Chen (HR)');
  const [schedNotes, setSchedNotes] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Scorecard Evaluation Modal
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [activeInterviewForEval, setActiveInterviewForEval] = useState<Interview | null>(null);
  const [evaluatorName, setEvaluatorName] = useState('Elena Chen (Executive Talent Director)');
  const [techScore, setTechScore] = useState(4);
  const [commScore, setCommScore] = useState(4);
  const [probScore, setProbScore] = useState(4);
  const [cultScore, setCultScore] = useState(4);
  const [overallScore, setOverallScore] = useState(4);
  const [recommendation, setRecommendation] = useState<'strong_hire' | 'hire' | 'hold' | 'reject'>('hire');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [savingEval, setSavingEval] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [ints, apps] = await Promise.all([getInterviews(), getJobApplications()]);
    setInterviews(ints);
    setApplications(apps);
    if (apps.length > 0) setSelectedAppId(apps[0].id);
    setLoading(false);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSchedule(true);

    const created = await createInterview({
      application: selectedAppId,
      title: `${roundType.toUpperCase()} Interview`,
      round_type: roundType,
      interview_type: interviewType,
      scheduled_date: schedDate,
      scheduled_time: schedTime,
      duration_minutes: schedDuration,
      location_or_url: schedUrl,
      panelist_names: schedPanelists,
      meeting_notes: schedNotes,
      status: 'scheduled',
    });

    setSavingSchedule(false);
    if (created) {
      loadData();
      setScheduleModalOpen(false);
    }
  };

  const handleEvaluationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterviewForEval || !feedbackNotes.trim()) return;

    setSavingEval(true);
    const result = await evaluateInterview(activeInterviewForEval.id, {
      evaluator_name: evaluatorName,
      technical_score: techScore,
      communication_score: commScore,
      problem_solving_score: probScore,
      cultural_fit_score: cultScore,
      overall_score: overallScore,
      recommendation,
      feedback_notes: feedbackNotes,
    });

    setSavingEval(false);
    if (result) {
      loadData();
      setEvaluationModalOpen(false);
      setActiveInterviewForEval(null);
    }
  };

  const filteredInterviews = interviews.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Interview Management & Scorecards
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Evaluations Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Coordinate panel interviews across time zones, conduct live evaluations, and maintain structured 1-5 rubric scoring.
          </p>
        </div>

        <button
          onClick={() => setScheduleModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Interview</span>
        </button>
      </div>

      <RecruitmentSubNav />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">Filter By Status:</span>
        {['all', 'scheduled', 'completed', 'cancelled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-all ${
              statusFilter === st
                ? 'bg-purple-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Interviews Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs animate-pulse">
            Loading interview calendar...
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No interviews found</h3>
            <p className="text-xs text-slate-400">Schedule your first panel or technical interview round above.</p>
          </div>
        ) : (
          filteredInterviews.map((intw) => {
            const hasEval = intw.evaluations && intw.evaluations.length > 0;
            const evalRecord = hasEval ? intw.evaluations![0] : null;

            return (
              <div
                key={intw.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 uppercase">
                        {intw.round_type} Round
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {intw.status === 'completed' ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="text-cyan-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Scheduled
                          </span>
                        )}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">
                      {intw.applicant_name} &bull; <span className="text-slate-400 text-sm font-normal">{intw.vacancy_title}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {intw.location_or_url && (
                      <a
                        href={intw.location_or_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Meeting</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setActiveInterviewForEval(intw);
                        setEvaluationModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{hasEval ? 'Update Scorecard' : 'Record Scorecard'}</span>
                    </button>
                  </div>
                </div>

                {/* Details Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Date: {intw.scheduled_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Time: {intw.scheduled_time} ({intw.duration_minutes} mins)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="truncate">Panel: {intw.panelist_names}</span>
                  </div>
                </div>

                {/* Existing Evaluation Result Card */}
                {evalRecord && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-indigo-950/40 border border-purple-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Scorecard by {evalRecord.evaluator_name}</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        evalRecord.recommendation === 'strong_hire' || evalRecord.recommendation === 'hire'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-950 text-rose-300 border-rose-500/30'
                      }`}>
                        {evalRecord.recommendation.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-[11px] text-slate-400 pt-1">
                      <span>Technical: <strong className="text-white">{evalRecord.technical_score}/5</strong></span>
                      <span>Communication: <strong className="text-white">{evalRecord.communication_score}/5</strong></span>
                      <span>Problem Solving: <strong className="text-white">{evalRecord.problem_solving_score}/5</strong></span>
                      <span>Cultural Fit: <strong className="text-white">{evalRecord.cultural_fit_score}/5</strong></span>
                      <span>Overall: <strong className="text-amber-400 font-bold">{evalRecord.overall_score}/5</strong></span>
                    </div>

                    <p className="text-slate-300 pt-1 leading-relaxed whitespace-pre-line">
                      &quot;{evalRecord.feedback_notes}&quot;
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* Schedule Interview Modal */}
      {/* ========================================================================= */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Schedule Candidate Interview</h3>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Candidate Application *</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.applicant_name} — {app.vacancy_title} ({app.application_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Round Type</label>
                  <select
                    value={roundType}
                    onChange={(e) => setRoundType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  >
                    <option value="screening">Initial Phone Screening</option>
                    <option value="technical">Technical Assessment</option>
                    <option value="cultural">Culture & Leadership Fit</option>
                    <option value="executive">Executive Partner Round</option>
                    <option value="final">Final Offer Discussion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Format</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  >
                    <option value="video">Google Meet / Video</option>
                    <option value="phone">Phone Call</option>
                    <option value="in_person">Onsite In-Person</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min={15}
                    step={15}
                    value={schedDuration}
                    onChange={(e) => setSchedDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Video Meeting Link / Room</label>
                <input
                  type="text"
                  value={schedUrl}
                  onChange={(e) => setSchedUrl(e.target.value)}
                  placeholder="https://meet.google.com/xyz"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Panelists</label>
                <input
                  type="text"
                  value={schedPanelists}
                  onChange={(e) => setSchedPanelists(e.target.value)}
                  placeholder="e.g. Elena Rostova (VP Eng), Marcus Vance"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  {savingSchedule ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Scorecard Evaluation Modal */}
      {/* ========================================================================= */}
      {evaluationModalOpen && activeInterviewForEval && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Interview Scorecard</span>
                <h3 className="text-base font-bold text-white">{activeInterviewForEval.applicant_name}</h3>
                <p className="text-xs text-slate-400">{activeInterviewForEval.vacancy_title}</p>
              </div>
              <button
                onClick={() => setEvaluationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEvaluationSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Evaluator / Reviewer Name *</label>
                <input
                  type="text"
                  required
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              {/* Rubric Criteria 1-5 */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-white block">Competency Assessment (1 to 5 Stars):</span>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Technical Depth & System Design:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setTechScore(s)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= techScore ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Communication & Clarity:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setCommScore(s)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= commScore ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Problem Solving & Logic:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setProbScore(s)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= probScore ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cultural & Team Fit:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setCultScore(s)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= cultScore ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="font-bold text-white">Overall Scorecard Average:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setOverallScore(s)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= overallScore ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Final Recommendation *</label>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-hidden"
                >
                  <option value="strong_hire">Strong Hire 🌟 (Immediate Offer Recommended)</option>
                  <option value="hire">Hire 👍 (Meets High Quality Bar)</option>
                  <option value="hold">Hold / Needs Follow-up Round 🤔</option>
                  <option value="reject">Do Not Hire ❌ (Does Not Meet Bar)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Evaluation Commentary *</label>
                <textarea
                  rows={4}
                  required
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Summarize candidate's technical strengths, key trade-offs evaluated, and rationale for hire decision..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEvaluationModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEval}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                >
                  {savingEval ? 'Saving...' : 'Submit Evaluation & Complete Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
