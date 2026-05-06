import { apiRequest } from './client';

export async function getLicensingSettings() {
  return apiRequest<{ local_only_state_codes?: string[] }>('/licensing_settings');
}
