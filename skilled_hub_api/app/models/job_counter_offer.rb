class JobCounterOffer < ApplicationRecord
  enum status: {
    pending_company: 0,
    pending_technician: 1,
    accepted: 2,
    declined: 3,
    superseded: 4
  }

  enum created_by_role: {
    technician: 0,
    company: 1
  }

  enum proposed_start_mode: {
    hard_start: 0,
    rolling_start: 1
  }

  belongs_to :job
  belongs_to :technician_profile
  belongs_to :company_profile
  belongs_to :parent_offer, class_name: "JobCounterOffer", optional: true
  has_many :countered_offers, class_name: "JobCounterOffer", foreign_key: :parent_offer_id, dependent: :nullify

  validates :proposed_hourly_rate_cents, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :proposed_hours_per_day, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 24 }, allow_nil: true
  validates :proposed_days, numericality: { only_integer: true, greater_than: 0 }, allow_nil: true
  validate :start_fields_consistent

  scope :latest_first, -> { order(created_at: :desc) }

  private

  def start_fields_consistent
    return unless hard_start?
    return if proposed_start_at.present?

    errors.add(:proposed_start_at, "is required for hard start offers")
  end
end
