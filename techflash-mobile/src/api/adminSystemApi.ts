import { apiRequest } from './client';

export async function adminListTierConfigs(audience: string) {
  const data = await apiRequest<{ membership_tier_configs?: Record<string, unknown>[] }>(
    `/admin/membership_tier_configs?audience=${encodeURIComponent(audience)}`
  );
  return Array.isArray(data?.membership_tier_configs) ? data.membership_tier_configs : [];
}

export async function adminCreateTierConfig(payload: Record<string, unknown>) {
  return apiRequest<{ membership_tier_config?: Record<string, unknown> }>('/admin/membership_tier_configs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminUpdateTierConfig(id: number, payload: Record<string, unknown>) {
  return apiRequest<{ membership_tier_config?: Record<string, unknown> }>(
    `/admin/membership_tier_configs/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}

export async function adminRemoveTierConfig(id: number) {
  return apiRequest<null>(`/admin/membership_tier_configs/${id}`, { method: 'DELETE' });
}

export async function adminProvisionStripe(id: number) {
  return apiRequest<Record<string, unknown>>(`/admin/membership_tier_configs/${id}/provision_stripe`, {
    method: 'POST',
  });
}

export async function adminGetLicensingSettings() {
  return apiRequest<{ local_only_state_codes?: string[] }>('/admin/licensing_settings');
}

export async function adminUpdateLicensingSettings(localOnlyStateCodes: string[]) {
  return apiRequest<Record<string, unknown>>('/admin/licensing_settings', {
    method: 'PATCH',
    body: JSON.stringify({ local_only_state_codes: localOnlyStateCodes }),
  });
}

export async function adminMailtrapAudit() {
  return apiRequest<Record<string, unknown>>('/admin/mailtrap_audit');
}

export async function adminEmailQaListTemplates() {
  const data = await apiRequest<{ templates?: Record<string, unknown>[] }>('/admin/email_qa/templates');
  return Array.isArray(data?.templates) ? data.templates : [];
}

export async function adminEmailQaSend(templateKey: string, confirmation: string, toEmail?: string) {
  return apiRequest<Record<string, unknown>>('/admin/email_qa/send', {
    method: 'POST',
    body: JSON.stringify({
      template_key: templateKey,
      confirmation,
      ...(toEmail?.trim() ? { to_email: toEmail.trim() } : {}),
    }),
  });
}

export async function adminEmailQaSendAll(confirmation: string, toEmail?: string) {
  return apiRequest<Record<string, unknown>>('/admin/email_qa/send_all', {
    method: 'POST',
    body: JSON.stringify({
      confirmation,
      ...(toEmail?.trim() ? { to_email: toEmail.trim() } : {}),
    }),
  });
}
