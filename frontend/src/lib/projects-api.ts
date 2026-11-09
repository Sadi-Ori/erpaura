import { Project, Milestone, Task, TaskChecklist, Timesheet, Issue, ProjectStats } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function fetchPMS<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
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
      console.warn(`PMS API error on ${endpoint}: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`PMS API fetch failed on ${endpoint}:`, err);
    return null;
  }
}

// 1. Projects
export async function getProjects(params?: {
  status?: string;
  category?: string;
  health?: string;
  search?: string;
}): Promise<Project[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.category) query.set('category', params.category);
  if (params?.health) query.set('health', params.health);
  if (params?.search) query.set('search', params.search);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchPMS<any>(`/projects/projects/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function getProject(id: number | string): Promise<Project | null> {
  return await fetchPMS<Project>(`/projects/projects/${id}/`);
}

export async function createProject(data: Partial<Project>): Promise<Project | null> {
  return await fetchPMS<Project>('/projects/projects/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProject(id: number | string, data: Partial<Project>): Promise<Project | null> {
  return await fetchPMS<Project>(`/projects/projects/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// 2. Milestones
export async function getMilestones(params?: { project?: number | string }): Promise<Milestone[]> {
  const query = new URLSearchParams();
  if (params?.project) query.set('project', String(params.project));

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchPMS<any>(`/projects/milestones/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function createMilestone(data: Partial<Milestone>): Promise<Milestone | null> {
  return await fetchPMS<Milestone>('/projects/milestones/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 3. Tasks
export async function getTasks(params?: {
  project?: number | string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  search?: string;
}): Promise<Task[]> {
  const query = new URLSearchParams();
  if (params?.project) query.set('project', String(params.project));
  if (params?.status) query.set('status', params.status);
  if (params?.priority) query.set('priority', params.priority);
  if (params?.assigned_to) query.set('assigned_to', params.assigned_to);
  if (params?.search) query.set('search', params.search);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchPMS<any>(`/projects/tasks/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function createTask(data: Partial<Task>): Promise<Task | null> {
  return await fetchPMS<Task>('/projects/tasks/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTask(id: number | string, data: Partial<Task>): Promise<Task | null> {
  return await fetchPMS<Task>(`/projects/tasks/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function moveTaskStatus(id: number | string, newStatus: string): Promise<any> {
  return await fetchPMS<any>(`/projects/tasks/${id}/move_status/`, {
    method: 'POST',
    body: JSON.stringify({ status: newStatus }),
  });
}

export async function logTaskTime(taskId: number | string, data: {
  worker_name: string;
  hours: number;
  work_date?: string;
  notes?: string;
  is_billable?: boolean;
  hourly_rate?: number;
}): Promise<any> {
  return await fetchPMS<any>(`/projects/tasks/${taskId}/log_time/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function toggleChecklistItem(id: number | string): Promise<any> {
  return await fetchPMS<any>(`/projects/checklists/${id}/toggle/`, {
    method: 'POST',
  });
}

// 4. Timesheets
export async function getTimesheets(params?: {
  project?: number | string;
  task?: number | string;
  worker_name?: string;
  status?: string;
}): Promise<Timesheet[]> {
  const query = new URLSearchParams();
  if (params?.project) query.set('project', String(params.project));
  if (params?.task) query.set('task', String(params.task));
  if (params?.worker_name) query.set('worker_name', params.worker_name);
  if (params?.status) query.set('status', params.status);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchPMS<any>(`/projects/timesheets/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function approveTimesheet(id: number | string, approved_by?: string): Promise<Timesheet | null> {
  return await fetchPMS<Timesheet>(`/projects/timesheets/${id}/approve/`, {
    method: 'POST',
    body: JSON.stringify({ approved_by }),
  });
}

export async function rejectTimesheet(id: number | string, approved_by?: string): Promise<Timesheet | null> {
  return await fetchPMS<Timesheet>(`/projects/timesheets/${id}/reject/`, {
    method: 'POST',
    body: JSON.stringify({ approved_by }),
  });
}

// 5. Issues
export async function getIssues(params?: {
  project?: number | string;
  severity?: string;
  status?: string;
}): Promise<Issue[]> {
  const query = new URLSearchParams();
  if (params?.project) query.set('project', String(params.project));
  if (params?.severity) query.set('severity', params.severity);
  if (params?.status) query.set('status', params.status);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchPMS<any>(`/projects/issues/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function createIssue(data: Partial<Issue>): Promise<Issue | null> {
  return await fetchPMS<Issue>('/projects/issues/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function resolveIssue(id: number | string, resolution_notes?: string): Promise<Issue | null> {
  return await fetchPMS<Issue>(`/projects/issues/${id}/resolve/`, {
    method: 'POST',
    body: JSON.stringify({ resolution_notes }),
  });
}

// 6. Project Stats
export async function getProjectStats(): Promise<ProjectStats | null> {
  return await fetchPMS<ProjectStats>('/projects/stats/');
}
