'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Star,
  Plus,
  Users,
  Search,
  CheckCircle2,
  TrendingUp,
  X,
  MessageSquare,
  Sparkles,
  Calendar,
} from 'lucide-react';
import HRSubNav from '../HRSubNav';
import { PerformanceReview, Employee } from '@/lib/types';
import {
  getPerformanceReviews,
  getEmployees,
  createPerformanceReview,
} from '@/lib/hr-payroll-api';

export default function PerformanceAppraisalsPage() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<number>(1);
  const [reviewerName, setReviewerName] = useState('Department Executive Lead');
  const [reviewPeriod, setReviewPeriod] = useState('Q3 2026 Comprehensive Appraisal');
  const [techRating, setTechRating] = useState(5);
  const [commRating, setCommRating] = useState(4);
  const [puncRating, setPuncRating] = useState(5);
  const [leadRating, setLeadRating] = useState(4);
  const [overallRating, setOverallRating] = useState(5);
  const [strengths, setStrengths] = useState('');
  const [growthAreas, setGrowthAreas] = useState('');
  const [comments, setComments] = useState('');
  const [promoRec, setPromoRec] = useState('Recommended for Advancement');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [revs, emps] = await Promise.all([getPerformanceReviews(), getEmployees()]);
    setReviews(revs);
    setEmployees(emps);
    if (emps.length > 0) setSelectedEmpId(emps[0].id || 1);
    setLoading(false);
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await createPerformanceReview({
      employee: selectedEmpId,
      reviewer_name: reviewerName,
      review_period: reviewPeriod,
      technical_rating: techRating,
      communication_rating: commRating,
      punctuality_rating: puncRating,
      leadership_rating: leadRating,
      overall_rating: overallRating,
      strengths: strengths || 'Demonstrated outstanding dedication and technical execution.',
      growth_areas: growthAreas || 'Continue leading architectural knowledge sharing across squads.',
      comments: comments || 'Valued contributor consistently meeting high delivery standards.',
      promotion_recommendation: promoRec,
      review_date: new Date().toISOString().split('T')[0],
    });
    setSaving(false);
    if (res) {
      loadData();
      setCreateModalOpen(false);
    }
  };

  const filtered = reviews.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.employee_name?.toLowerCase().includes(q) ||
      r.review_period.toLowerCase().includes(q) ||
      r.reviewer_name.toLowerCase().includes(q)
    );
  });

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.overall_rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Performance Appraisals & Evaluations
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Talent Growth
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Conduct 360-degree performance evaluations, maintain competency rating rubrics, and formalize promotion recommendations.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Conduct New Appraisal</span>
        </button>
      </div>

      <HRSubNav />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Appraisals Recorded</span>
          <div className="text-2xl font-extrabold text-white">{reviews.length}</div>
          <span className="text-[10px] text-blue-400 font-medium">Completed for Enterprise Staff</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Average Performance Score</span>
          <div className="text-2xl font-extrabold text-amber-400 flex items-center gap-1.5">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            <span>{avgRating} / 5.0</span>
          </div>
          <span className="text-[10px] text-slate-400">High Organizational Health Index</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Promotions Endorsed</span>
          <div className="text-2xl font-extrabold text-emerald-400">
            {reviews.filter((r) => r.promotion_recommendation?.includes('Advancement') || r.promotion_recommendation?.includes('Promotion')).length}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">Eligible For Next Compensation Tier</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500 ml-1" />
        <input
          type="text"
          placeholder="Search by employee name, review period, or reviewer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden"
        />
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs animate-pulse">
            Loading appraisals repository...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <Award className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No appraisal reviews found</h3>
            <p className="text-xs text-slate-400">Click &quot;Conduct New Appraisal&quot; to submit a performance review.</p>
          </div>
        ) : (
          filtered.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                      {rev.review_period}
                    </span>
                    <span className="text-xs text-slate-400">
                      Evaluated by <strong className="text-slate-200">{rev.reviewer_name}</strong> on {rev.review_date}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {rev.employee_name} &bull; <span className="text-sm text-slate-400 font-normal">{rev.job_title} ({rev.department_name})</span>
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.overall_rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-800'
                        }`}
                      />
                    ))}
                    <span className="font-bold text-white text-xs ml-1">{rev.overall_rating}/5</span>
                  </div>

                  <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                    {rev.promotion_recommendation || 'Standard Progress'}
                  </span>
                </div>
              </div>

              {/* Rubric Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-slate-400">
                <div>Technical Competency: <strong className="text-white">{rev.technical_rating}/5</strong></div>
                <div>Communication & Teamwork: <strong className="text-white">{rev.communication_rating}/5</strong></div>
                <div>Punctuality & Reliability: <strong className="text-white">{rev.punctuality_rating}/5</strong></div>
                <div>Leadership & Ownership: <strong className="text-white">{rev.leadership_rating}/5</strong></div>
              </div>

              {/* Commentary */}
              <div className="space-y-2 text-xs">
                {rev.strengths && (
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Key Accomplishments & Strengths:</span>
                    <p className="text-slate-300 leading-relaxed">{rev.strengths}</p>
                  </div>
                )}
                {rev.growth_areas && (
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Recommended Growth Areas:</span>
                    <p className="text-slate-300 leading-relaxed">{rev.growth_areas}</p>
                  </div>
                )}
                {rev.comments && (
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Executive Evaluator Rationale:</span>
                    <p className="text-slate-300 italic leading-relaxed">&quot;{rev.comments}&quot;</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* Conduct New Appraisal Modal */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Conduct Staff Performance Appraisal</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Employee *</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} ({e.job_title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reviewer Title / Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Review Period *</label>
                  <input
                    type="text"
                    required
                    value={reviewPeriod}
                    onChange={(e) => setReviewPeriod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 5-Star Rubrics */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="font-bold text-white block">Competency Assessment Rubric:</span>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Technical Depth & Code Quality:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setTechRating(s)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= techRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Communication & Teamwork:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setCommRating(s)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= commRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Punctuality & Reliability:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setPuncRating(s)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= puncRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Leadership & Initiative:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setLeadRating(s)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= leadRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="font-bold text-white">Overall Performance Score:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setOverallRating(s)}
                        className="hover:scale-125 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${s <= overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Key Strengths & Contributions</label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Specific achievements, architectural feats..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Recommended Growth Opportunities</label>
                <textarea
                  rows={2}
                  value={growthAreas}
                  onChange={(e) => setGrowthAreas(e.target.value)}
                  placeholder="Skills to develop in coming quarters..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Promotion / Advancement Recommendation</label>
                <select
                  value={promoRec}
                  onChange={(e) => setPromoRec(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-hidden"
                >
                  <option value="Accelerated Executive Tier">Accelerated Executive Tier 🌟</option>
                  <option value="Recommended for Advancement">Recommended for Advancement 👍</option>
                  <option value="Consistent Performer (Maintained)">Consistent Performer (Maintained)</option>
                  <option value="Action Plan Assigned">Action Plan Assigned</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
                >
                  {saving ? 'Saving...' : 'Record Performance Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
