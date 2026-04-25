# frozen_string_literal: true

class CreateMembershipTierConfigs < ActiveRecord::Migration[7.1]
  def up
    create_table :membership_tier_configs do |t|
      t.string :audience, null: false
      t.string :slug, null: false
      t.string :display_name
      t.integer :monthly_fee_cents, null: false, default: 0
      t.decimal :commission_percent, precision: 6, scale: 3, null: false
      t.integer :early_access_delay_hours
      t.integer :sort_order, null: false, default: 0
      t.string :stripe_price_id

      t.timestamps
    end

    add_index :membership_tier_configs, %i[audience slug], unique: true
    add_index :membership_tier_configs, %i[audience sort_order]

    seed_rows
  end

  def down
    drop_table :membership_tier_configs
  end

  private

  def seed_rows
    now = Time.current
    rows = [
      { audience: "technician", slug: "basic", display_name: "Basic", monthly_fee_cents: 0, commission_percent: 20, early_access_delay_hours: 48, sort_order: 0, stripe_price_id: nil },
      { audience: "technician", slug: "pro", display_name: "Pro", monthly_fee_cents: 4_900, commission_percent: 20, early_access_delay_hours: 24, sort_order: 1, stripe_price_id: ENV["STRIPE_TECHNICIAN_PRO_PRICE_ID"].presence },
      { audience: "technician", slug: "premium", display_name: "Premium", monthly_fee_cents: 24_900, commission_percent: 10, early_access_delay_hours: 0, sort_order: 2, stripe_price_id: ENV["STRIPE_TECHNICIAN_PREMIUM_PRICE_ID"].presence },
      { audience: "company", slug: "basic", display_name: "Basic", monthly_fee_cents: 0, commission_percent: 10, early_access_delay_hours: nil, sort_order: 0, stripe_price_id: nil },
      { audience: "company", slug: "pro", display_name: "Pro", monthly_fee_cents: 25_000, commission_percent: 5, early_access_delay_hours: nil, sort_order: 1, stripe_price_id: ENV["STRIPE_COMPANY_PRO_PRICE_ID"].presence },
      { audience: "company", slug: "premium", display_name: "Premium", monthly_fee_cents: 100_000, commission_percent: 0, early_access_delay_hours: nil, sort_order: 2, stripe_price_id: ENV["STRIPE_COMPANY_PREMIUM_PRICE_ID"].presence }
    ]
    MembershipTierConfig.reset_column_information
    MembershipTierConfig.insert_all!(
      rows.map { |r| r.merge(created_at: now, updated_at: now) }
    )
  end
end
