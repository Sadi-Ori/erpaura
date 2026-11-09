import {
  Department,
  Designation,
  Employee,
  AttendanceRecord,
  TimeOffRequest,
  LeaveBalance,
  PayrollEntry,
  PerformanceReview,
  HRStats,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function fetchHR<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
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
      console.warn(`HR API error on ${endpoint}: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`HR API fetch failed on ${endpoint}:`, err);
    return null;
  }
}

// 1. Departments & Designations
export async function getDepartments(): Promise<Department[]> {
  const data = await fetchHR<any>('/hr/departments/');
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function getDesignations(): Promise<Designation[]> {
  const data = await fetchHR<any>('/hr/designations/');
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

// 2. Employees
export async function getEmployees(params?: {
  status?: string;
  department?: string | number;
  employment_type?: string;
  search?: string;
}): Promise<Employee[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.department) query.set('department', String(params.department));
  if (params?.employment_type) query.set('employment_type', params.employment_type);
  if (params?.search) query.set('search', params.search);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchHR<any>(`/hr/employees/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function getEmployee(id: number | string): Promise<Employee | null> {
  return await fetchHR<Employee>(`/hr/employees/${id}/`);
}

export async function createEmployee(data: Partial<Employee>): Promise<Employee | null> {
  return await fetchHR<Employee>('/hr/employees/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEmployee(id: number | string, data: Partial<Employee>): Promise<Employee | null> {
  return await fetchHR<Employee>(`/hr/employees/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function clockInOut(employeeId: number | string): Promise<any> {
  return await fetchHR<any>(`/hr/employees/${employeeId}/clock_in_out/`, {
    method: 'POST',
  });
}

// 3. Attendance Records
export async function getAttendanceRecords(params?: {
  date?: string;
  status?: string;
  employee?: string | number;
}): Promise<AttendanceRecord[]> {
  const query = new URLSearchParams();
  if (params?.date) query.set('date', params.date);
  if (params?.status) query.set('status', params.status);
  if (params?.employee) query.set('employee', String(params.employee));

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchHR<any>(`/hr/attendances/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

// 4. Leave & Time Off
export async function getTimeOffRequests(params?: {
  status?: string;
  employee?: string | number;
  leave_type?: string;
}): Promise<TimeOffRequest[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.employee) query.set('employee', String(params.employee));
  if (params?.leave_type) query.set('leave_type', params.leave_type);

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchHR<any>(`/hr/timeoffs/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function createTimeOffRequest(data: Partial<TimeOffRequest>): Promise<TimeOffRequest | null> {
  return await fetchHR<TimeOffRequest>('/hr/timeoffs/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function approveTimeOffRequest(id: number | string, comment?: string): Promise<TimeOffRequest | null> {
  return await fetchHR<TimeOffRequest>(`/hr/timeoffs/${id}/approve/`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}

export async function rejectTimeOffRequest(id: number | string, comment?: string): Promise<TimeOffRequest | null> {
  return await fetchHR<TimeOffRequest>(`/hr/timeoffs/${id}/reject/`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
}

export async function getLeaveBalances(employeeId?: number | string): Promise<LeaveBalance[]> {
  const query = employeeId ? `?employee=${employeeId}` : '';
  const data = await fetchHR<any>(`/hr/balances/${query}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

// 5. Payroll Management
export async function getPayrollEntries(params?: {
  month?: number;
  year?: number;
  status?: string;
  employee?: string | number;
}): Promise<PayrollEntry[]> {
  const query = new URLSearchParams();
  if (params?.month) query.set('month', String(params.month));
  if (params?.year) query.set('year', String(params.year));
  if (params?.status) query.set('status', params.status);
  if (params?.employee) query.set('employee', String(params.employee));

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchHR<any>(`/hr/payroll/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function runPayrollBatch(month: number, year: number): Promise<any> {
  return await fetchHR<any>('/hr/payroll/run_monthly_batch/', {
    method: 'POST',
    body: JSON.stringify({ month, year }),
  });
}

export async function disbursePayroll(id: number | string, payment_method?: string): Promise<PayrollEntry | null> {
  return await fetchHR<PayrollEntry>(`/hr/payroll/${id}/disburse/`, {
    method: 'POST',
    body: JSON.stringify({ payment_method }),
  });
}

// 6. Performance Appraisals
export async function getPerformanceReviews(params?: {
  employee?: string | number;
}): Promise<PerformanceReview[]> {
  const query = new URLSearchParams();
  if (params?.employee) query.set('employee', String(params.employee));

  const qs = query.toString() ? `?${query.toString()}` : '';
  const data = await fetchHR<any>(`/hr/reviews/${qs}`);
  if (!data) return [];
  return Array.isArray(data) ? data : data.results || [];
}

export async function createPerformanceReview(data: Partial<PerformanceReview>): Promise<PerformanceReview | null> {
  return await fetchHR<PerformanceReview>('/hr/reviews/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// 7. HR KPIs
export async function getHRStats(): Promise<HRStats | null> {
  return await fetchHR<HRStats>('/hr/stats/');
}
