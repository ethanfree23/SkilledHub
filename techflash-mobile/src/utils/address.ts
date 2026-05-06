export function formatJobAddress(job: Record<string, unknown> | null | undefined): string {
  if (!job) return 'Address pending';
  const location = String(job.location || '').trim();
  if (location) return location;
  const parts = [job.address, job.city, job.state, job.zip_code]
    .map((v) => String(v || '').trim())
    .filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  return 'Address pending';
}
