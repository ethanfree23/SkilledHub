# frozen_string_literal: true

# Creates a Stripe Product + monthly recurring Price for a paid MembershipTierConfig row and
# stores the returned price id on the record. Requires STRIPE_SECRET_KEY and admin-only API access.
class MembershipTierStripeProvisioning
  class Error < StandardError; end

  def self.provision!(config)
    new(config).provision!
  end

  def initialize(membership_tier_config)
    @config = membership_tier_config
  end

  def provision!
    raise Error, "Stripe is not configured" if Stripe.api_key.blank?
    if @config.stripe_price_id.present?
      raise Error,
            "A Stripe price is already set for this tier. Remove the price ID in TechFlash to create a new " \
            "Stripe price (e.g. after a fee change), or manage prices in the Stripe Dashboard."
    end
    if @config.monthly_fee_cents.to_i <= 0
      raise Error, "Only paid tiers (monthly fee above zero) need a subscription price in Stripe."
    end

    display = @config.display_name.to_s.strip.presence || @config.slug
    product_name = "TechFlash #{@config.audience.humanize} — #{display}"

    price = Stripe::Price.create(
      currency: "usd",
      unit_amount: @config.monthly_fee_cents,
      recurring: { interval: "month" },
      product_data: {
        name: product_name,
        metadata: {
          "techflash_audience" => @config.audience,
          "techflash_tier_slug" => @config.slug
        }
      },
      metadata: {
        "techflash_audience" => @config.audience,
        "techflash_tier_slug" => @config.slug
      }
    )

    @config.update!(stripe_price_id: price.id)
    { stripe_price_id: price.id, stripe_product_id: price.product }
  rescue Stripe::StripeError => e
    raise Error, e.message
  end
end
