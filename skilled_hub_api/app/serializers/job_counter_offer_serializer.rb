class JobCounterOfferSerializer < ActiveModel::Serializer
  attributes :id, :job_id, :technician_profile_id, :company_profile_id, :parent_offer_id,
             :status, :created_by_role, :proposed_hourly_rate_cents, :proposed_hours_per_day,
             :proposed_days, :proposed_start_at, :proposed_end_at, :proposed_start_mode,
             :responded_at, :created_at, :updated_at
end
