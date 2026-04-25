# frozen_string_literal: true

require "test_helper"
require "ostruct"

class MembershipTierStripeProvisioningTest < ActiveSupport::TestCase
  def setup
    @old_stripe_api_key = Stripe.api_key
    @tier = MembershipTierConfig.create!(
      audience: "technician",
      slug: "z_stripe_provision_#{SecureRandom.hex(3)}",
      display_name: "Test tier",
      monthly_fee_cents: 2_00,
      commission_percent: 10.0,
      early_access_delay_hours: 0,
      sort_order: 98,
      stripe_price_id: nil
    )
    @old_stripe_key = ENV["STRIPE_SECRET_KEY"]
  end

  def teardown
    @tier.destroy
    ENV["STRIPE_SECRET_KEY"] = @old_stripe_key
    Stripe.api_key = @old_stripe_api_key
  end

  test "raises when Stripe is not configured" do
    ENV["STRIPE_SECRET_KEY"] = nil
    Stripe.api_key = nil
    err = assert_raises(MembershipTierStripeProvisioning::Error) do
      MembershipTierStripeProvisioning.provision!(@tier)
    end
    assert_match(/not configured/i, err.message)
  end

  test "raises when price already set" do
    @tier.update!(stripe_price_id: "price_existing")
    ENV["STRIPE_SECRET_KEY"] = "sk_test_xxx"
    Stripe.api_key = "sk_test_xxx"
    err = assert_raises(MembershipTierStripeProvisioning::Error) do
      MembershipTierStripeProvisioning.provision!(@tier)
    end
    assert_match(/already set/i, err.message)
  end

  test "raises when monthly fee is zero" do
    @tier.update_column(:monthly_fee_cents, 0)
    ENV["STRIPE_SECRET_KEY"] = "sk_test_xxx"
    Stripe.api_key = "sk_test_xxx"
    err = assert_raises(MembershipTierStripeProvisioning::Error) do
      MembershipTierStripeProvisioning.provision!(@tier)
    end
    assert_match(/paid/i, err.message)
  end

  test "creates Stripe price and updates tier" do
    ENV["STRIPE_SECRET_KEY"] = "sk_test_xxx"
    Stripe.api_key = "sk_test_xxx"
    price_double = OpenStruct.new(id: "price_test_from_stub", product: "prod_test_from_stub")

    sclass = Stripe::Price.singleton_class
    sclass.alias_method :_orig_stripe_create, :create
    sclass.define_method(:create) { |*| price_double }
    begin
      @tier.update!(monthly_fee_cents: 3_00, stripe_price_id: nil)
      result = MembershipTierStripeProvisioning.provision!(@tier)

      assert_equal "price_test_from_stub", result[:stripe_price_id]
      assert_equal "prod_test_from_stub", result[:stripe_product_id]
      assert_equal "price_test_from_stub", @tier.reload.stripe_price_id
    ensure
      sclass.remove_method :create
      sclass.alias_method :create, :_orig_stripe_create
      sclass.remove_method :_orig_stripe_create
    end
  end
end
