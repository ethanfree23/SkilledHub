import { apiRequest } from './client';

export async function listPublicTierConfigs(audience: 'company' | 'technician') {
  const data = await apiRequest<{ membership_tier_configs?: Record<string, unknown>[] }>(
    `/membership_tier_configs?audience=${encodeURIComponent(audience)}`
  );
  return Array.isArray(data?.membership_tier_configs) ? data.membership_tier_configs : [];
}
