'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  DollarSign,
  Users,
  X,
  FileQuestion,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import RecruitmentSubNav from '../RecruitmentSubNav';
import { Vacancy, Subsidiary, VacancyQuestion } from '@/lib/types';
import {
  getVacancies,
  getSubsidiaries,
  createVacancy,
  updateVacancyStatus,
  addVacancyQuestion,
} from '@/lib/recruitment-api';

export default function VacanciesManagementPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubId, setNewSubId] = useState<number>(1);
  const [newDeptName, setNewDeptName] = useState('Engineering & DevOps');
  const [newJobType, setNewJobType] = useState<'full_time' | 'part_time' | 'contract' | 'internship' | 'remote'>('full_time');
  const [newExpLevel, setNewExpLevel] = useState<'entry' | 'mid' | 'senior' | 'lead' | 'executive'>('mid');
  const [newLocation, setNewLocation] = useState('San Francisco, CA / Hybrid');
  const [newOpenings, setNewOpenings] = useState(1);
  const [newSalaryMin, setNewSalaryMin] = useState('130000');
  const [newSalaryMax, setNewSalaryMax] = useState('175000');
  const [newDesc, setNewDesc] = useState('');
  const [newReqs, setNewReqs] = useState('');
  const [newSkillsStr, setNewSkillsStr] = useState('Python, Django, React');

  // Question Modal
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [activeVacancyForQuestions, setActiveVacancyForQuestions] = useState<Vacancy | null>(null);
  const [newQText, setNewQText] = useState('');
  const [newQType, setNewQType] = useState<'text' | 'paragraph' | 'boolean' | 'multiple_choice'>('multiple_choice');
  const [newQOptions, setNewQOptions] = useState('1-2 years, 3-5 years, 5+ years');
  const [newQRequired, setNewQRequired] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [vacs, subs] = await Promise.all([getVacancies(), getSubsidiaries()]);
    setVacancies(vacs);
    setSubsidiaries(subs);
    if (subs.length > 0) setNewSubId(subs[0].id);
    setLoading(false);
  };

  const handleStatusChange = async (vacId: number, nextStatus: string) => {
    const updated = await updateVacancyStatus(vacId, nextStatus);
    if (updated) {
      setVacancies((prev) =>
        prev.map((v) => (v.id === vacId ? { ...v, status: updated.status } : v))
      );
    }
  };

  const handleCreateVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSaving(true);
    const skillsList = newSkillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const created = await createVacancy({
      title: newTitle,
      subsidiary: newSubId,
      department_name: newDeptName,
      job_type: newJobType,
      experience_level: newExpLevel,
      location: newLocation,
      openings_count: Number(newOpenings),
      salary_min: Number(newSalaryMin),
      salary_max: Number(newSalaryMax),
      salary_currency: 'USD',
      description: newDesc || 'Exciting career opportunity joining our growing team.',
      requirements: newReqs || 'Relevant industry experience and domain passion.',
      required_skills: skillsList,
      status: 'published',
    });

    setSaving(false);
    if (created) {
      setVacancies([created, ...vacancies]);
      setCreateModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewReqs('');
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVacancyForQuestions || !newQText.trim()) return;

    const opts = newQType === 'multiple_choice'
      ? newQOptions.split(',').map((o) => o.trim()).filter(Boolean)
      : [];

    const res = await addVacancyQuestion(activeVacancyForQuestions.id, {
      question_text: newQText,
      question_type: newQType,
      options: opts,
      is_required: newQRequired,
    });

    if (res) {
      // Reload vacancy
      loadData();
      setNewQText('');
      setQuestionModalOpen(false);
    }
  };

  const filteredVacancies = vacancies.filter((v) => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (subsidiaryFilter !== 'all' && String(v.subsidiary) !== subsidiaryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.vacancy_code.toLowerCase().includes(q) ||
        v.subsidiary_name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Vacancy Lifecycle Management
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {vacancies.length} Total Openings
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create, approve, publish, and configure vacancy-specific screening questions across subsidiaries.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Post New Vacancy</span>
        </button>
      </div>

      <RecruitmentSubNav />

      {/* Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vacancies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="approved">Approved</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={subsidiaryFilter}
            onChange={(e) => setSubsidiaryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 focus:outline-hidden"
          >
            <option value="all">All Subsidiaries</option>
            {subsidiaries.map((s) => (
              <option key={s.id} value={String(s.id)}>{s.name}</option>
            ))}
          </select>
        </div>

        <span className="text-slate-500 text-[11px]">
          Showing {filteredVacancies.length} of {vacancies.length} vacancies
        </span>
      </div>

      {/* Vacancies Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Code & Role Title</th>
                <th className="py-3 px-4">Subsidiary / Dept</th>
                <th className="py-3 px-4">Type / Location</th>
                <th className="py-3 px-4">Compensation</th>
                <th className="py-3 px-4 text-center">Openings</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredVacancies.map((vac) => (
                <tr key={vac.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-mono font-bold text-purple-400 block">
                      {vac.vacancy_code}
                    </span>
                    <Link
                      href={`/recruitment/jobs/${vac.id}`}
                      target="_blank"
                      className="font-bold text-white hover:text-purple-300 transition-colors text-sm"
                    >
                      {vac.title}
                    </Link>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-200 block">{vac.subsidiary_name}</span>
                    <span className="text-[11px] text-slate-500">{vac.department_name}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="capitalize block">{vac.job_type.replace('_', ' ')}</span>
                    <span className="text-[11px] text-slate-500">{vac.location}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    {vac.salary_min && vac.salary_max
                      ? `$${Number(vac.salary_min).toLocaleString()} - $${Number(vac.salary_max).toLocaleString()}`
                      : 'Competitive'}
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-white">
                    {vac.openings_count}
                  </td>

                  <td className="py-3.5 px-4">
                    <select
                      value={vac.status}
                      onChange={(e) => handleStatusChange(vac.id, e.target.value)}
                      className={`text-xs font-semibold rounded-lg px-2 py-1 border bg-slate-950 focus:outline-hidden ${
                        vac.status === 'published'
                          ? 'text-emerald-400 border-emerald-500/40'
                          : vac.status === 'draft'
                          ? 'text-amber-400 border-amber-500/40'
                          : vac.status === 'closed'
                          ? 'text-rose-400 border-rose-500/40'
                          : 'text-purple-300 border-purple-500/40'
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="approved">Approved</option>
                      <option value="published">Published</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => {
                        setActiveVacancyForQuestions(vac);
                        setQuestionModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 font-medium inline-flex items-center gap-1"
                    >
                      <FileQuestion className="w-3 h-3" />
                      <span>Questions</span>
                    </button>

                    <Link
                      href={`/recruitment/jobs/${vac.id}`}
                      target="_blank"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium inline-flex items-center gap-1"
                    >
                      <span>Public</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Create Vacancy Modal */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Enterprise Vacancy</h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVacancy} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Lead Kubernetes Platform Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subsidiary *</label>
                  <select
                    value={newSubId}
                    onChange={(e) => setNewSubId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                  >
                    {subsidiaries.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Type</label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  >
                    <option value="full_time">Full-Time</option>
                    <option value="remote">Remote</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Experience Level</label>
                  <select
                    value={newExpLevel}
                    onChange={(e) => setNewExpLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  >
                    <option value="entry">Entry (0-2 yrs)</option>
                    <option value="mid">Mid (3-5 yrs)</option>
                    <option value="senior">Senior (5-8 yrs)</option>
                    <option value="lead">Lead (8+ yrs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Openings</label>
                  <input
                    type="number"
                    min={1}
                    value={newOpenings}
                    onChange={(e) => setNewOpenings(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="San Francisco, CA / Remote"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Salary Band (Min - Max USD)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newSalaryMin}
                      onChange={(e) => setNewSalaryMin(e.target.value)}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                    />
                    <input
                      type="number"
                      value={newSalaryMax}
                      onChange={(e) => setNewSalaryMax(e.target.value)}
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Overview of the mission and team focus..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Requirements & Qualifications</label>
                <textarea
                  rows={3}
                  value={newReqs}
                  onChange={(e) => setNewReqs(e.target.value)}
                  placeholder="- 4+ years production experience with Python\n- Solid understanding of API systems..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Key Skills (comma-separated)</label>
                <input
                  type="text"
                  value={newSkillsStr}
                  onChange={(e) => setNewSkillsStr(e.target.value)}
                  placeholder="Python, Django, React, AWS"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                >
                  {saving ? 'Publishing...' : 'Create & Publish Vacancy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Screening Questions Modal */}
      {/* ========================================================================= */}
      {questionModalOpen && activeVacancyForQuestions && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Custom Question Builder</span>
                <h3 className="text-base font-bold text-white">{activeVacancyForQuestions.title}</h3>
              </div>
              <button
                onClick={() => setQuestionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Questions List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 block">Configured Screening Questions:</span>
              {activeVacancyForQuestions.questions && activeVacancyForQuestions.questions.length > 0 ? (
                activeVacancyForQuestions.questions.map((q, idx) => (
                  <div key={q.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{idx + 1}. {q.question_text}</span>
                      <span className="text-[10px] font-mono text-purple-300 px-1.5 py-0.5 rounded bg-slate-800">
                        {q.question_type}
                      </span>
                    </div>
                    {q.options && q.options.length > 0 && (
                      <p className="text-slate-500 text-[11px]">Options: {q.options.join(', ')}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-slate-500 text-xs rounded-xl bg-slate-950">
                  No screening questions added yet.
                </div>
              )}
            </div>

            {/* Add New Question Form */}
            <form onSubmit={handleAddQuestion} className="pt-4 border-t border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-white text-xs block">Add New Question:</span>
              <div>
                <label className="block text-slate-400 mb-1">Question Prompt *</label>
                <input
                  type="text"
                  required
                  value={newQText}
                  onChange={(e) => setNewQText(e.target.value)}
                  placeholder="e.g. How many years of experience do you have with Kubernetes?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Question Type</label>
                  <select
                    value={newQType}
                    onChange={(e) => setNewQType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="text">Single Line Text</option>
                    <option value="paragraph">Paragraph Text</option>
                    <option value="boolean">Yes / No</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newQRequired}
                      onChange={(e) => setNewQRequired(e.target.checked)}
                      className="accent-purple-600"
                    />
                    <span className="text-slate-300">Mandatory / Required</span>
                  </label>
                </div>
              </div>

              {newQType === 'multiple_choice' && (
                <div>
                  <label className="block text-slate-400 mb-1">Options (comma-separated)</label>
                  <input
                    type="text"
                    value={newQOptions}
                    onChange={(e) => setNewQOptions(e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
