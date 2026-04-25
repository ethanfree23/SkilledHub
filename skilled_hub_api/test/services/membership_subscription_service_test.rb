# frozen_string_literal: true

require "test_helper"
require "ostruct"

class MembershipSubscriptionServiceTest < ActiveSupport::TestCase
  test "price_id_for prefers MembershipTierConfig stripe_price_id" do
    cfg = MembershipTierConfig.find_by!(audience: "technician", slug: "pro")
    before = cfg.stripe_price_id
    cfg.update!(stripe_price_id: "price_configured_abc")

    result = MembershipSubscriptionService.price_id_for(role: "technician", level: "pro")
    assert_equal "price_configured_abc", result
  ensure
    cfg.update!(stripe_price_id: before) if cfg
  end

  test "price_id_for falls back to ENV when config has no stripe_price_id" do
    cfg = MembershipTierConfig.find_by!(audience: "technician", slug: "pro")
    before = cfg.stripe_price_id
    key = MembershipSubscriptionService::PRICE_ENV_KEYS["technician"]["pro"]
    was_env = ENV[key]
    cfg.update!(stripe_price_id: nil)
    ENV[key] = "price_from_env_xyz"

    result = MembershipSubscriptionService.price_id_for(role: "technician", level: "pro")
    assert_equal "price_from_env_xyz", result
  ensure
    cfg.update!(stripe_price_id: before) if cfg
    if was_env.nil?
      ENV.delete(key)
    else
      ENV[key] = was_env
    end
  end

  test "level_from_subscription resolves slug via MembershipTierConfig stripe_price_id" do
    user = User.create!(email: "mss-map@example.com", password: "password123", password_confirmation: "password123", role: :technician)
    TechnicianProfile.create!(user: user, trade_type: "General", availability: "Full-time", membership_level: "basic")

    cfg = MembershipTierConfig.create!(
      audience: "technician",
      slug: "mss_slug_#{SecureRandom.hex(2)}",
      display_name: "MSS",
      monthly_fee_cents: 500,
      commission_percent: 5.0,
      early_access_delay_hours: 0,
      sort_order: 100,
      stripe_price_id: "price_mss_999"
    )

    price = OpenStruct.new(id: "price_mss_999")
    line = OpenStruct.new(price: price)
    items = OpenStruct.new(data: [line])
    subscription = OpenStruct.new(items: items)

    level = MembershipSubscriptionService.send(:level_from_subscription, user: user, subscription: subscription)
    assert_equal cfg.slug, level
  ensure
    user&.destroy
    cfg&.destroy
  end
end
