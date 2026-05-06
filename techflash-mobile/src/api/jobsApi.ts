import { apiRequest } from './client';

/** Company dashboard — serialized jobs arrays */
export interface CompanyDashboardJobs {
  requested?: unknown[];
  unrequested?: unknown[];
  expired?: unknown[];
}

export async function getCompanyDashboardJobs(): Promise<CompanyDashboardJobs> {
  const data = await apiRequest<CompanyDashboardJobs>('/dashboard/jobs');
  return data || {};
}

export interface TechnicianJobRow {
  id: number;
  title?: string;
  location?: string | null;
  status?: string;
  company_profile?: { company_name?: string | null } | null;
}

export interface TechnicianDashboardJobs {
  in_progress: TechnicianJobRow[];
  completed: TechnicianJobRow[];
}

export async function getTechnicianDashboardJobs(): Promise<TechnicianDashboardJobs> {
  const data = await apiRequest<TechnicianDashboardJobs>('/dashboard/technician_jobs');
  return data || { in_progress: [], completed: [] };
}

export interface JobPayload {
  title: string;
  description?: string;
  location?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  scheduled_start_at?: string;
  scheduled_end_at?: string;
  budget_cents?: number;
}

export async function getJobs(filters: Record<string, string | number | undefined> = {}) {
  const clean = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
  );
  const params = new URLSearchParams(clean as Record<string, string>);
  return apiRequest<Record<string, unknown>[]>(`/jobs${params.toString() ? `?${params}` : ''}`);
}

export async function getJobById(id: number) {
  return apiRequest<Record<string, unknown>>(`/jobs/${id}`);
}

export async function createJob(payload: JobPayload) {
  return apiRequest<Record<string, unknown>>('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateJob(id: number, payload: Partial<JobPayload>) {
  return apiRequest<Record<string, unknown>>(`/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function claimJob(id: number, preferredStartAt?: string) {
  return apiRequest<Record<string, unknown>>(`/jobs/${id}/claim`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...(preferredStartAt ? { preferred_start_at: preferredStartAt } : {}),
    }),
  });
}

export async function finishJob(id: number) {
  return apiRequest<Record<string, unknown>>(`/jobs/${id}/finish`, {
    method: 'PATCH',
  });
}

export async function denyJob(id: number) {
  return apiRequest<Record<string, unknown>>(`/jobs/${id}/deny`, {
    method: 'PATCH',
  });
}

export async function extendJob(id: number, scheduledEndAt: string) {
  return apiRequest<Record<string, unknown>>(`/jobs/${id}/extend`, {
    method: 'PATCH',
    body: JSON.stringify({ scheduled_end_at: scheduledEndAt }),
  });
}
