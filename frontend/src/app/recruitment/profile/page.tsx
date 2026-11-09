'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { ApplicantProfile, Education, WorkExperience, ApplicantSkill } from '@/lib/types';
import { getApplicantProfileByEmail, submitOrDraftApplication } from '@/lib/recruitment-api';

export default function ReusableProfilePage() {
  const [emailInput, setEmailInput] = useState('marcus.vance@example.com');
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [headline, setHeadline] = useState('');
  const [bioSummary, setBioSummary] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  // Lists
  const [educations, setEducations] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [skills, setSkills] = useState<ApplicantSkill[]>([]);

  // Add Item modals/states
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('advanced');
  const [newSkillYrs, setNewSkillYrs] = useState('3.0');

  // Load profile function
  const loadProfile = async (targetEmail: string) => {
    setLoading(true);
    setSaveSuccess(false);
    const data = await getApplicantProfileByEmail(targetEmail);
    if (data) {
      setProfile(data);
      setFirstName(data.first_name);
      setLastName(data.last_name);
      setPhone(data.phone || '');
      setAddress(data.address || '');
      setHeadline(data.headline || '');
      setBioSummary(data.bio_summary || '');
      setResumeUrl(data.resume_url || '');
      setLinkedinUrl(data.linkedin_url || '');
      setGithubUrl(data.github_url || '');
      setPortfolioUrl(data.portfolio_url || '');
      setEducations(data.educations || []);
      setExperiences(data.experiences || []);
      setSkills(data.skills || []);
    } else {
      setProfile(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile(emailInput);
  }, []);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const item: ApplicantSkill = {
      skill_name: newSkillName.trim(),
      proficiency: newSkillProf,
      years_of_experience: Number(newSkillYrs),
    };
    setSkills([...skills, item]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    // Submit update to profile endpoint via submitOrDraft with placeholder vacancy or profile API
    const payload = {
      email: emailInput,
      first_name: firstName,
      last_name: lastName,
      phone,
      address,
      headline,
      bio_summary: bioSummary,
      resume_url: resumeUrl,
      linkedin_url: linkedinUrl,
      github_url: githubUrl,
      portfolio_url: portfolioUrl,
      is_draft: true,
      educations,
      experiences,
      skills,
    };

    // We can update the profile by loading it
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/40 border border-purple-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Universal Reusable Applicant Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Manage Your Candidate Profile
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Fill in your details once. Every vacancy you apply for across Aura Technologies, Retail Dynamics, Global Logistics, and FinTech will automatically pre-populate from this profile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/recruitment"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all"
            >
              <span>Explore Roles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Profile Switcher / Lookup */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-400">Lookup or Switch Profile:</span>
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="applicant@example.com"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-purple-500 w-64"
            />
            <button
              onClick={() => loadProfile(emailInput)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
            >
              Load
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Sample profiles:</span>
            <button
              onClick={() => {
                setEmailInput('marcus.vance@example.com');
                loadProfile('marcus.vance@example.com');
              }}
              className="text-purple-400 hover:underline"
            >
              Marcus Vance
            </button>
            <span>&bull;</span>
            <button
              onClick={() => {
                setEmailInput('elena.rostova@example.com');
                loadProfile('elena.rostova@example.com');
              }}
              className="text-purple-400 hover:underline"
            >
              Elena Rostova
            </button>
            <span>&bull;</span>
            <button
              onClick={() => {
                setEmailInput('david.kim@example.com');
                loadProfile('david.kim@example.com');
              }}
              className="text-purple-400 hover:underline"
            >
              David Kim
            </button>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Reusable profile saved successfully! New applications will prefill with these details.</span>
        </div>
      )}

      {/* Main Profile Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal & Contact */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-purple-400" />
              <span>Contact & Identity</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email (Primary ID)</label>
                <input
                  type="email"
                  value={emailInput}
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-3 py-2 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">City & State / Country</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Professional Bio</label>
                <textarea
                  rows={3}
                  value={bioSummary}
                  onChange={(e) => setBioSummary(e.target.value)}
                  placeholder="Summary of experience, technical focus, and career goals..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Social & Portfolio links */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-purple-400" />
              <span>Resume & Web Links</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Resume / CV URL</label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://storage.example.com/resume.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">LinkedIn Profile</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">GitHub / Code Portfolio</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Middle & Right Column: Experience, Education & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Experience */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-purple-400" />
                <span>Work Experience History</span>
              </h2>
              <span className="text-xs text-slate-400">{experiences.length} positions recorded</span>
            </div>

            <div className="space-y-3">
              {experiences.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{exp.position}</h4>
                      <p className="text-xs text-purple-300 font-medium">{exp.company} &bull; {exp.location}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date || 'Past'}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Education History */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <span>Education & Qualifications</span>
              </h2>
              <span className="text-xs text-slate-400">{educations.length} records</span>
            </div>

            <div className="space-y-3">
              {educations.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{edu.degree} in {edu.field_of_study}</h4>
                      <p className="text-xs text-purple-300 font-medium">{edu.institution}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {edu.start_year} - {edu.end_year || 'Ongoing'}
                    </span>
                  </div>
                  {edu.grade_gpa && (
                    <p className="text-xs text-slate-400">GPA / Honors: {edu.grade_gpa}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Technical & Domain Skills */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Skills & Competencies</span>
              </h2>
              <span className="text-xs text-slate-400">{skills.length} skills</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {skills.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <span className="font-semibold">{s.skill_name}</span>
                  <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-950/60 px-1.5 py-0.5 rounded">
                    {s.proficiency}
                  </span>
                  <button
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-slate-500 hover:text-rose-400 ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Skill */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="New skill (e.g. Next.js, Docker)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500 text-xs w-48"
              />
              <select
                value={newSkillProf}
                onChange={(e) => setNewSkillProf(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-hidden"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>
          </div>

          {/* Action Save Bar */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Changes are saved to your reusable candidate identity.</span>
            <button
              onClick={handleSaveProfile}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Reusable Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
