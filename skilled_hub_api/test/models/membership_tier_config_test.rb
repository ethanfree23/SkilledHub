# frozen_string_literal: true

require "test_helper"

class MembershipTierConfigTest < ActiveSupport::TestCase
  test "slug must match pattern" do
    c = MembershipTierConfig.new(
      audience: "company",
      slug: "Bad-Slug",
      monthly_fee_cents: 0,
      commission_percent: 10,
      sort_order: 0
    )
    assert_not c.valid?
  end

  test "company tier cannot set early access hours" do
    c = MembershipTierConfig.new(
      audience: "company",
      slug: "x_tier",
      monthly_fee_cents: 0,
      commission_percent: 10,
      early_access_delay_hours: 5,
      sort_order: 0
    )
    assert_not c.valid?
  end
end
