class NormalizeStandardTechnicianTierDelays < ActiveRecord::Migration[7.1]
  def up
    return unless table_exists?(:membership_tier_configs)

    now = Time.current
    updates = {
      "premium" => 0,
      "pro" => 24,
      "basic" => 48
    }

    updates.each do |slug, delay|
      MembershipTierConfig
        .where(audience: "technician", slug: slug)
        .update_all(early_access_delay_hours: delay, updated_at: now)
    end

    MembershipPolicy.invalidate_cache! if defined?(MembershipPolicy)
  end

  def down
    # no-op
  end
end
