# frozen_string_literal: true

class SavedJobSearch < ApplicationRecord
  belongs_to :technician_profile

  before_validation :normalize_fields

  validates :technician_profile_id, presence: true
  validates :max_distance_miles, numericality: { greater_than: 0, allow_nil: true }
  validates :min_hourly_rate_cents, numericality: { greater_than_or_equal_to: 0, allow_nil: true }
  validates :max_required_years_experience, numericality: { greater_than_or_equal_to: 0, allow_nil: true }

  def required_certifications_array
    raw = self[:required_certifications]
    arr =
      case raw
      when Array
        raw
      else
        JSON.parse(raw.to_s)
      end
    arr.map { |v| v.to_s.strip.downcase }.reject(&:blank?).uniq.sort
  rescue JSON::ParserError
    []
  end

  private

  def normalize_fields
    self.keyword = keyword.to_s.strip.presence
    self.location = location.to_s.strip.presence
    self.skill_class = skill_class.to_s.strip.presence
    self.max_distance_miles = max_distance_miles.to_i if max_distance_miles.present?
    self.min_hourly_rate_cents = min_hourly_rate_cents.to_i if min_hourly_rate_cents.present?
    self.max_required_years_experience = max_required_years_experience.to_i if max_required_years_experience.present?
    certs = required_certifications_array
    self.required_certifications = certs.present? ? certs.to_json : nil
  end
end
