import {
  Subsidiary,
  Vacancy,
  VacancyQuestion,
  ApplicantProfile,
  JobApplication,
  Interview,
  InterviewEvaluation,
  RecruitmentNote,
  RecruitmentStats,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function fetchRMS<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`RMS API error on ${endpoint}: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`RMS API fetch failed on ${endpoint}:`, err);
    return null;
  }
}

// 1. Subsidiaries
export async function getSubsidiaries(): Promise<Subsidiary[]> {
  const data = await fetchRMS<any>('/recruitment/subsidiaries/');
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

// 2. Vacancies
export async function getVacancies(params?: {
  status?: string;
  subsidiary?: string | number;
  job_type?: string;
  experience_level?: string;
  search?: string;
}): Promise<Vacancy[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.subsidiary) query.set('subsidiary', String(params.subsidiary));
  if (params?.job_type) query.set('job_type', params.job_type);
  if (params?.experience_level) query.set('experience_level', params.experience_level);
  if (params?.search) query.set('search', params.search);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchRMS<any>(`/recruitment/vacancies/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function getVacancy(id: number | string): Promise<Vacancy | null> {
  return await fetchRMS<Vacancy>(`/recruitment/vacancies/${id}/`);
}

export async function createVacancy(data: Partial<Vacancy>): Promise<Vacancy | null> {
  return await fetchRMS<Vacancy>('/recruitment/vacancies/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVacancyStatus(id: number | string, status: string): Promise<Vacancy | null> {
  return await fetchRMS<Vacancy>(`/recruitment/vacancies/${id}/change_status/`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export async function addVacancyQuestion(vacancyId: number | string, questionData: Partial<VacancyQuestion>): Promise<VacancyQuestion | null> {
  return await fetchRMS<VacancyQuestion>(`/recruitment/vacancies/${vacancyId}/add_question/`, {
    method: 'POST',
    body: JSON.stringify(questionData),
  });
}

// 3. Applicant Profiles
export async function getApplicantProfiles(search?: string): Promise<ApplicantProfile[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  const data = await fetchRMS<any>(`/recruitment/profiles/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function getApplicantProfileByEmail(email: string): Promise<ApplicantProfile | null> {
  return await fetchRMS<ApplicantProfile>(`/recruitment/profiles/by_email/?email=${encodeURIComponent(email)}`);
}

// 4. Job Applications
export async function getJobApplications(params?: {
  stage?: string;
  vacancy?: string | number;
  email?: string;
  is_draft?: boolean;
  search?: string;
}): Promise<JobApplication[]> {
  const query = new URLSearchParams();
  if (params?.stage) query.set('stage', params.stage);
  if (params?.vacancy) query.set('vacancy', String(params.vacancy));
  if (params?.email) query.set('email', params.email);
  if (params?.is_draft !== undefined) query.set('is_draft', String(params.is_draft));
  if (params?.search) query.set('search', params.search);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchRMS<any>(`/recruitment/applications/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function getJobApplication(id: number | string): Promise<JobApplication | null> {
  return await fetchRMS<JobApplication>(`/recruitment/applications/${id}/`);
}

export async function submitOrDraftApplication(payload: any): Promise<JobApplication | null> {
  return await fetchRMS<JobApplication>('/recruitment/applications/submit_or_draft/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function advanceApplicationStage(id: number | string, stage: string): Promise<JobApplication | null> {
  return await fetchRMS<JobApplication>(`/recruitment/applications/${id}/advance_stage/`, {
    method: 'POST',
    body: JSON.stringify({ stage }),
  });
}

export async function rateApplication(id: number | string, rating: number): Promise<JobApplication | null> {
  return await fetchRMS<JobApplication>(`/recruitment/applications/${id}/rate/`, {
    method: 'POST',
    body: JSON.stringify({ rating }),
  });
}

export async function addApplicationNote(
  id: number | string,
  note_text: string,
  author_name: string = 'Recruiter HR',
  is_confidential: boolean = false
): Promise<RecruitmentNote | null> {
  return await fetchRMS<RecruitmentNote>(`/recruitment/applications/${id}/add_note/`, {
    method: 'POST',
    body: JSON.stringify({ note_text, author_name, is_confidential }),
  });
}

// 5. Interviews
export async function getInterviews(params?: {
  application?: string | number;
  status?: string;
  search?: string;
}): Promise<Interview[]> {
  const query = new URLSearchParams();
  if (params?.application) query.set('application', String(params.application));
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchRMS<any>(`/recruitment/interviews/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function createInterview(data: Partial<Interview>): Promise<Interview | null> {
  return await fetchRMS<Interview>('/recruitment/interviews/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function evaluateInterview(
  interviewId: number | string,
  evaluationData: {
    evaluator_name: string;
    technical_score: number;
    communication_score: number;
    problem_solving_score: number;
    cultural_fit_score: number;
    overall_score: number;
    feedback_notes: string;
    recommendation: string;
  }
): Promise<InterviewEvaluation | null> {
  return await fetchRMS<InterviewEvaluation>(`/recruitment/interviews/${interviewId}/evaluate/`, {
    method: 'POST',
    body: JSON.stringify(evaluationData),
  });
}

// 6. Recruitment KPIs & Stats
export async function getRecruitmentStats(): Promise<RecruitmentStats | null> {
  return await fetchRMS<RecruitmentStats>('/recruitment/stats/');
}
