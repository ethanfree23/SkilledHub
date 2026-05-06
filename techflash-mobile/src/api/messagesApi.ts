import { apiRequest } from './client';
import { asArray } from './normalize';

export interface MessageRow {
  id: number;
  content: string;
  sender_type?: string;
  sender_id?: number;
  sender_display_name?: string;
  created_at?: string;
  [key: string]: unknown;
}

export async function listMessages(conversationId: number) {
  const data = await apiRequest<MessageRow[]>(`/conversations/${conversationId}/messages`);
  return asArray<MessageRow>(data);
}

export async function createMessage(conversationId: number, content: string) {
  return apiRequest<MessageRow>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
