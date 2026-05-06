import { apiRequest } from './client';

export async function listSavedJobSearches() {
  const data = await apiRequest<Record<string, unknown>[]>('/saved_job_searches');
  return Array.isArray(data) ? data : [];
}

export async function createSavedJobSearch(payload: Record<string, unknown>) {
  return apiRequest<Record<string, unknown>>('/saved_job_searches', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function removeSavedJobSearch(id: number) {
  return apiRequest<null>(`/saved_job_searches/${id}`, {
    method: 'DELETE',
  });
}
