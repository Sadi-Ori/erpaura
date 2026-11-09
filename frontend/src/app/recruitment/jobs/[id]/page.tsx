'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Send,
  Save,
  FileText,
  User,
  ShieldCheck,
  Check,
  Calendar,
  AlertCircle,
  X,
  Upload,
} from 'lucide-react';
import { Vacancy, ApplicantProfile, JobApplication } from '@/lib/types';
import { getVacancy, submitOrDraftApplication, getApplicantProfileByEmail } from '@/lib/recruitment-api';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [loading, setLoading] = useState(true);

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<JobApplication | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields (Reusable Profile)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [headline, setHeadline] = useState('');
  const [bioSummary, setBioSummary] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  // Education list
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [gradYear, setGradYear] = useState('2022');

  // Work experience
  const [company, setCompany] = useState('');
  const [jobPosition, setJobPosition] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');

  // Dynamic Question Answers: { questionId: answerText }
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      const data = await getVacancy(resolvedParams.id);
      if (!data) {
        setLoading(false);
        return;
      }
      setVacancy(data);
      setLoading(false);
    }
    fetchJob();
  }, [resolvedParams.id]);

  // Load existing profile by email helper
  const handleLookupProfile = async (targetEmail: string) => {
    if (!targetEmail || !targetEmail.includes('@')) return;
    try {
      const prof = await getApplicantProfileByEmail(targetEmail);
      if (prof) {
        setFirstName(prof.first_name);
        setLastName(prof.last_name);
        setPhone(prof.phone || '');
        setAddress(prof.address || '');
        setHeadline(prof.headline || '');
        setBioSummary(prof.bio_summary || '');
        setResumeUrl(prof.resume_url || '');

        if (prof.educations && prof.educations.length > 0) {
          const e = prof.educations[0];
          setInstitution(e.institution);
          setDegree(e.degree);
          setFieldOfStudy(e.field_of_study);
          setGradYear(String(e.end_year || 2022));
        }

        if (prof.experiences && prof.experiences.length > 0) {
          const w = prof.experiences[0];
          setCompany(w.company);
          setJobPosition(w.position);
          setExperienceSummary(w.description || '');
        }
      }
    } catch (e) {
      // Ignored
    }
  };

  const prefillSample = () => {
    setEmail('marcus.vance@example.com');
    setFirstName('Marcus');
    setLastName('Vance');
    setPhone('+1 (415) 890-2134');
    setAddress('San Francisco, CA');
    setHeadline('Senior Full-Stack & Systems Architect');
    setBioSummary('7+ years scaling Django REST Framework, Next.js, and high-concurrency PostgreSQL databases.');
    setResumeUrl('https://storage.auraerp.com/resumes/marcus_vance_cv_2026.pdf');
    setInstitution('UC Berkeley');
    setDegree('B.S.');
    setFieldOfStudy('Computer Science');
    setGradYear('2019');
    setCompany('Stripe');
    setJobPosition('Senior Software Engineer');
    setExperienceSummary('Led billing infrastructure and developer API portal SDKs.');
    setCoverLetter('I am extremely excited about the prospect of bringing my distributed systems and Django/Next.js experience to Aura ERP.');
  };

  const handleAnswerChange = (qId: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!email || !firstName || !lastName) {
      setErrorMsg('Please enter your First Name, Last Name, and Email.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const payload = {
      vacancy_id: vacancy?.id,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      address,
      headline,
      bio_summary: bioSummary,
      resume_url: resumeUrl,
      cover_letter: coverLetter,
      is_draft: isDraft,
      educations: institution && degree ? [
        {
          institution,
          degree,
          field_of_study: fieldOfStudy,
          start_year: Number(gradYear) - 4,
          end_year: Number(gradYear),
        }
      ] : [],
      experiences: company && jobPosition ? [
        {
          company,
          position: jobPosition,
          description: experienceSummary,
          start_date: '2021-01-01',
          is_current: true,
        }
      ] : [],
      answers,
    };

    const res = await submitOrDraftApplication(payload);
    setSubmitting(false);

    if (res && res.id) {
      setSubmissionSuccess(res);
    } else {
      setErrorMsg('Failed to submit application. Please check your inputs and try again.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm animate-pulse">
        Retrieving vacancy details from recruitment engine...
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Vacancy Not Found</h2>
        <p className="text-xs text-slate-400">The requested job opening does not exist or has closed.</p>
        <Link href="/recruitment" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Open Positions</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        href="/recruitment"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Vacancies</span>
      </Link>

      {/* Vacancy Header Card */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-purple-950/70 text-purple-300 border border-purple-500/30">
                {vacancy.subsidiary_code || vacancy.subsidiary_name}
              </span>
              {vacancy.department_name && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {vacancy.department_name}
                </span>
              )}
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                {vacancy.openings_count} {vacancy.openings_count === 1 ? 'Open Position' : 'Open Positions'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {vacancy.title}
            </h1>

            <p className="text-xs text-slate-400">
              Role Code: <span className="font-mono text-purple-400">{vacancy.vacancy_code}</span> | Managed by {vacancy.hiring_manager_name || 'HR Recruitment Team'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                setIsApplyModalOpen(true);
                setCurrentStep(1);
                setSubmissionSuccess(null);
              }}
              className="px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Apply for this Position</span>
            </button>
          </div>
        </div>

        {/* Highlight Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              Location & Mode
            </span>
            <span className="font-bold text-slate-200">{vacancy.location}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              Employment Type
            </span>
            <span className="font-bold text-slate-200 capitalize">{vacancy.job_type.replace('_', ' ')}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-purple-400" />
              Compensation Band
            </span>
            <span className="font-bold text-slate-200">
              {vacancy.salary_min && vacancy.salary_max
                ? `$${Number(vacancy.salary_min).toLocaleString()} - $${Number(vacancy.salary_max).toLocaleString()} ${vacancy.salary_currency}`
                : 'Competitive Enterprise Package'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-slate-400 block mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              Experience Required
            </span>
            <span className="font-bold text-slate-200">{vacancy.min_experience_years}+ Years ({vacancy.experience_level})</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mission & Overview */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Role Overview</span>
            </h2>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {vacancy.description}
            </div>
          </div>

          {/* Core Responsibilities */}
          {vacancy.responsibilities && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Key Responsibilities</span>
              </h2>
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {vacancy.responsibilities}
              </div>
            </div>
          )}

          {/* Qualifications & Requirements */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>Requirements & Qualifications</span>
            </h2>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {vacancy.requirements}
            </div>
          </div>

          {/* Benefits & Perks */}
          {vacancy.benefits && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Benefits & Total Rewards</span>
              </h2>
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {vacancy.benefits}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Info & Apply CTA */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            <h3 className="text-sm font-bold text-white">Skills Matrix</h3>
            <div className="flex flex-wrap gap-2">
              {vacancy.required_skills?.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-950/50 text-purple-300 border border-purple-500/30"
                >
                  {sk}
                </span>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Education Prerequisite:</span>
                <span className="font-semibold text-slate-200 text-right">{vacancy.required_education}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Application Deadline:</span>
                <span className="font-semibold text-slate-200">
                  {vacancy.deadline ? new Date(vacancy.deadline).toLocaleDateString() : 'Rolling Admission'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Subsidiary:</span>
                <span className="font-semibold text-purple-300">{vacancy.subsidiary_name}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsApplyModalOpen(true);
                setCurrentStep(1);
                setSubmissionSuccess(null);
              }}
              className="w-full py-3 rounded-2xl font-bold text-xs sm:text-sm bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Apply with Reusable Profile</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3 text-xs text-slate-400">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Equal Opportunity Organization</span>
            </h4>
            <p className="leading-relaxed">
              Aura ERP is an affirmative action employer. We celebrate diversity and are committed to creating an inclusive workspace for all team members across our global subsidiaries.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Interactive Multi-Step Application Modal */}
      {/* ========================================================================= */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                  Candidate Application
                </span>
                <h3 className="text-lg font-bold text-white">{vacancy.title}</h3>
                <p className="text-xs text-slate-400">{vacancy.subsidiary_name}</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success State */}
            {submissionSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white">
                  {submissionSuccess.is_draft ? 'Application Saved as Draft!' : 'Application Successfully Submitted!'}
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  {submissionSuccess.is_draft
                    ? 'Your application draft has been saved. You can resume editing and submit it anytime from your applications tracker.'
                    : 'Thank you for applying. Your reusable profile has been saved, and our recruitment team will review your qualifications shortly.'}
                </p>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-w-xs mx-auto text-xs space-y-1">
                  <span className="text-slate-400 block">Tracking Reference Number</span>
                  <span className="font-mono text-purple-400 font-bold text-sm">
                    {submissionSuccess.application_number}
                  </span>
                </div>

                <div className="pt-4 flex items-center justify-center gap-3">
                  <Link
                    href="/recruitment/applications"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                  >
                    View My Applications Tracker
                  </Link>
                  <button
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Steps Indicator */}
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-800 pb-3">
                  <div className={`flex items-center gap-1.5 ${currentStep === 1 ? 'text-purple-400' : ''}`}>
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">1</span>
                    <span>Profile Info</span>
                  </div>
                  <span className="text-slate-700">&bull;</span>
                  <div className={`flex items-center gap-1.5 ${currentStep === 2 ? 'text-purple-400' : ''}`}>
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">2</span>
                    <span>Experience</span>
                  </div>
                  <span className="text-slate-700">&bull;</span>
                  <div className={`flex items-center gap-1.5 ${currentStep === 3 ? 'text-purple-400' : ''}`}>
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">3</span>
                    <span>Screening</span>
                  </div>
                  <span className="text-slate-700">&bull;</span>
                  <div className={`flex items-center gap-1.5 ${currentStep === 4 ? 'text-purple-400' : ''}`}>
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">4</span>
                    <span>Review</span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Step 1: Personal & Reusable Profile */}
                {currentStep === 1 && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Already applied before? Enter your email to auto-fill your saved profile:</span>
                      <button
                        type="button"
                        onClick={prefillSample}
                        className="text-[11px] text-purple-400 hover:text-purple-300 underline"
                      >
                        (Demo: Auto-fill Marcus Vance)
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">First Name *</label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="e.g. Alex"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Last Name *</label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="e.g. Mercer"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            handleLookupProfile(e.target.value);
                          }}
                          placeholder="alex.mercer@example.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 019-2834"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Professional Headline</label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. Senior Software Architect | Python & Distributed Systems"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Current City / Location</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="San Francisco, CA or Remote"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Education & Work History */}
                {currentStep === 2 && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <span className="font-bold text-white text-xs block">Highest Degree / Education</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">Institution</label>
                          <input
                            type="text"
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            placeholder="e.g. UC Berkeley"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Degree & Field</label>
                          <input
                            type="text"
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                            placeholder="e.g. B.S. in Computer Science"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <span className="font-bold text-white text-xs block">Most Recent Work Experience</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-400 mb-1">Company</label>
                          <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g. Stripe or AWS"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Position / Job Title</label>
                          <input
                            type="text"
                            value={jobPosition}
                            onChange={(e) => setJobPosition(e.target.value)}
                            placeholder="e.g. Senior Software Engineer"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Key Impact / Accomplishments</label>
                        <textarea
                          rows={2}
                          value={experienceSummary}
                          onChange={(e) => setExperienceSummary(e.target.value)}
                          placeholder="Brief description of responsibilities and technical accomplishments..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Screening Questions */}
                {currentStep === 3 && (
                  <div className="space-y-4 text-xs">
                    <p className="text-slate-400">
                      Please answer the following vacancy-specific questions defined by the hiring committee:
                    </p>

                    {vacancy.questions && vacancy.questions.length > 0 ? (
                      vacancy.questions.map((q, idx) => (
                        <div key={q.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                          <label className="block text-slate-200 font-semibold">
                            {idx + 1}. {q.question_text} {q.is_required && <span className="text-purple-400">*</span>}
                          </label>

                          {q.question_type === 'multiple_choice' ? (
                            <div className="space-y-1.5 pt-1">
                              {q.options?.map((opt, oIdx) => (
                                <label
                                  key={oIdx}
                                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800/80 cursor-pointer hover:border-purple-500"
                                >
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    value={opt}
                                    checked={answers[q.id] === opt}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    className="accent-purple-600"
                                  />
                                  <span className="text-slate-300">{opt}</span>
                                </label>
                              ))}
                            </div>
                          ) : q.question_type === 'boolean' ? (
                            <div className="flex items-center gap-4 pt-1">
                              {['Yes', 'No'].map((opt) => (
                                <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    value={opt}
                                    checked={answers[q.id] === opt}
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    className="accent-purple-600"
                                  />
                                  <span className="text-slate-300">{opt}</span>
                                </label>
                              ))}
                            </div>
                          ) : q.question_type === 'paragraph' ? (
                            <textarea
                              rows={3}
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              placeholder="Write your answer..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                            />
                          ) : (
                            <input
                              type="text"
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              placeholder="Your answer..."
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                            />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-500">
                        No screening questions required for this position.
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Resume & Cover Letter */}
                {currentStep === 4 && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Resume / CV Attachment URL *
                      </label>
                      <input
                        type="url"
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        placeholder="https://storage.example.com/resumes/my_resume.pdf or Google Drive link"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        PDF, DOCX, or direct shareable URL to your latest CV.
                      </span>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Cover Note / Message to Recruiter</label>
                      <textarea
                        rows={4}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Share why you are interested in this position and how your background aligns..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-purple-500"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-200">
                      <span className="font-semibold block mb-0.5">Reusable Profile Confirmation</span>
                      <span>
                        Submitting this application automatically synchronizes with your reusable profile ({email}), saving you time on future applications.
                      </span>
                    </div>
                  </div>
                )}

                {/* Navigation and Submission Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Back
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-2">
                    {/* Save Draft Button (always available) */}
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleSubmit(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-400" />
                      <span>{submitting ? 'Saving...' : 'Save Draft'}</span>
                    </button>

                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep((prev) => prev + 1)}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleSubmit(false)}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
