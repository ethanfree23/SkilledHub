/** Mirrors skilled-hub-frontend adminJobAccessSettingsState.buildTierUpdatePayload */

export type JobAccessRow = {
  id: number;
  accessAfterLiveHours: string;
  additionalFeatures: {
    minimumExperienceYears: string;
    minimumJobsCompleted: string;
    minimumSuccessfulJobs: string;
    minimumProfileCompletenessPercent: string;
    requiresVerifiedBackground: boolean;
  };
};

export function buildTierUpdatePayload(row: JobAccessRow): Record<string, unknown> {
  const accessAfterLiveHours = parseInt(row.accessAfterLiveHours, 10);
  const minimumExperienceYears = parseInt(row.additionalFeatures?.minimumExperienceYears, 10);
  const minimumJobsCompleted = parseInt(row.additionalFeatures?.minimumJobsCompleted, 10);
  const minimumSuccessfulJobs = parseInt(row.additionalFeatures?.minimumSuccessfulJobs, 10);
  const minimumProfileCompletenessPercent = parseInt(
    row.additionalFeatures?.minimumProfileCompletenessPercent,
    10
  );

  return {
    early_access_delay_hours: Number.isNaN(accessAfterLiveHours) ? 0 : Math.max(0, accessAfterLiveHours),
    job_access_min_experience_years: Number.isNaN(minimumExperienceYears)
      ? 0
      : Math.max(0, minimumExperienceYears),
    job_access_min_jobs_completed: Number.isNaN(minimumJobsCompleted)
      ? 0
      : Math.max(0, minimumJobsCompleted),
    job_access_min_successful_jobs: Number.isNaN(minimumSuccessfulJobs)
      ? 0
      : Math.max(0, minimumSuccessfulJobs),
    job_access_min_profile_completeness_percent: Number.isNaN(minimumProfileCompletenessPercent)
      ? 0
      : Math.max(0, Math.min(100, minimumProfileCompletenessPercent)),
    job_access_requires_verified_background: Boolean(row.additionalFeatures?.requiresVerifiedBackground),
  };
}

export function rowFromTier(tier: Record<string, unknown>): JobAccessRow {
  return {
    id: Number(tier.id),
    accessAfterLiveHours: String(tier.early_access_delay_hours ?? 0),
    additionalFeatures: {
      minimumExperienceYears: String(tier.job_access_min_experience_years ?? 0),
      minimumJobsCompleted: String(tier.job_access_min_jobs_completed ?? 0),
      minimumSuccessfulJobs: String(tier.job_access_min_successful_jobs ?? 0),
      minimumProfileCompletenessPercent: String(tier.job_access_min_profile_completeness_percent ?? 0),
      requiresVerifiedBackground: Boolean(tier.job_access_requires_verified_background),
    },
  };
}
