import { apiRequest } from './client';
import { asArray, asRecord } from './normalize';

export interface Conversation {
  id: number;
  conversation_type?: string;
  inbox_category?: string;
  job_id?: number | null;
  technician_profile_id?: number | null;
  company_profile_id?: number | null;
  submitter_email?: string | null;
  feedback_kind?: string | null;
  [key: string]: unknown;
}

function normalizeConversations(data: unknown): Conversation[] {
  if (Array.isArray(data)) return asArray<Conversation>(data);
  const obj = asRecord(data);
  if (Array.isArray(obj.conversations)) return asArray<Conversation>(obj.conversations);
  if (Array.isArray(obj.data)) return asArray<Conversation>(obj.data);
  return [];
}

export async function listConversations() {
  const data = await apiRequest<Conversation[] | { conversations?: Conversation[]; data?: Conversation[] }>(
    '/conversations'
  );
  return normalizeConversations(data);
}

export async function getConversation(id: number) {
  const data = await apiRequest<Conversation>(`/conversations/${id}`);
  return data || ({} as Conversation);
}

export async function createConversationForJob(jobId: number, technicianProfileId?: number) {
  return apiRequest<Conversation>(`/jobs/${jobId}/conversations`, {
    method: 'POST',
    body: JSON.stringify({
      ...(technicianProfileId ? { technician_profile_id: technicianProfileId } : {}),
    }),
  });
}
