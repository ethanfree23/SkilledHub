ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "jwt"

class ActiveSupport::TestCase
  setup :ensure_membership_tier_configs

  def ensure_membership_tier_configs
    seed_membership_audience!("technician") unless MembershipTierConfig.where(audience: "technician").exists?
    seed_membership_audience!("company") unless MembershipTierConfig.where(audience: "company").exists?
  end

  def seed_membership_audience!(audience)
    now = Time.current
    rows =
      if audience == "technician"
        [
          { audience: "technician", slug: "basic", display_name: "Basic", monthly_fee_cents: 0, commission_percent: 20.0, early_access_delay_hours: 48, sort_order: 0, stripe_price_id: nil },
          { audience: "technician", slug: "pro", display_name: "Pro", monthly_fee_cents: 4_900, commission_percent: 20.0, early_access_delay_hours: 24, sort_order: 1, stripe_price_id: nil },
          { audience: "technician", slug: "premium", display_name: "Premium", monthly_fee_cents: 24_900, commission_percent: 10.0, early_access_delay_hours: 0, sort_order: 2, stripe_price_id: nil }
        ]
      else
        [
          { audience: "company", slug: "basic", display_name: "Basic", monthly_fee_cents: 0, commission_percent: 10.0, early_access_delay_hours: nil, sort_order: 0, stripe_price_id: nil },
          { audience: "company", slug: "pro", display_name: "Pro", monthly_fee_cents: 25_000, commission_percent: 5.0, early_access_delay_hours: nil, sort_order: 1, stripe_price_id: nil },
          { audience: "company", slug: "premium", display_name: "Premium", monthly_fee_cents: 100_000, commission_percent: 0.0, early_access_delay_hours: nil, sort_order: 2, stripe_price_id: nil }
        ]
      end
    MembershipTierConfig.insert_all!(rows.map { |r| r.merge(created_at: now, updated_at: now) })
  end
end

module AuthTestHelper
  def auth_header_for(user)
    token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base, "HS256")
    { "Authorization" => "Bearer #{token}" }
  end
end
