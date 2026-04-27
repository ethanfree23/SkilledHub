class CompanyProfile < ApplicationRecord

  has_one_attached :avatar

  before_validation :normalize_service_cities_list
  before_validation :normalize_membership_level
  before_validation :normalize_state_and_license
  before_save :sync_location_from_service_cities

  belongs_to :user, inverse_of: :company_profile
  has_many :company_users, class_name: "User", foreign_key: :company_profile_id, inverse_of: :shared_company_profile, dependent: :nullify
  has_many :jobs, dependent: :destroy
  has_many :job_counter_offers, dependent: :destroy
  has_many :conversations, dependent: :destroy
  has_many :messages, through: :conversations
  has_many :documents, as: :uploadable, dependent: :destroy
  has_many :ratings_received, -> { order(created_at: :desc) }, class_name: 'Rating', as: :reviewee, dependent: :destroy
  has_many :favorite_technician_entries, class_name: 'FavoriteTechnician', dependent: :destroy
  has_many :favorite_technician_profiles, through: :favorite_technician_entries, source: :technician_profile

  validate :membership_level_must_be_configured
  validate :state_and_license_requirements

  def average_rating
    Rating.average_for(self)
  end

  private

  def normalize_service_cities_list
    raw = service_cities
    arr =
      case raw
      when String
        begin
          parsed = JSON.parse(raw)
          parsed.is_a?(Array) ? parsed : []
        rescue JSON::ParserError
          []
        end
      else
        Array(raw)
      end
    self.service_cities = arr.map { |c| c.to_s.strip.presence }.compact.uniq
  end

  def sync_location_from_service_cities
    cities = Array(service_cities).map(&:to_s).map(&:strip).reject(&:blank?)
    self.location = cities.join(", ") if cities.any?
  end

  def normalize_membership_level
    self.membership_level = MembershipPolicy.normalized_level(membership_level, audience: :company)
  end

  def normalize_state_and_license
    self.state = state.to_s.strip.presence
    self.electrical_license_number = electrical_license_number.to_s.strip.presence
  end

  def normalized_state_code
    value = state.to_s.strip
    return nil if value.blank?

    state_map = {
      "alabama" => "AL", "alaska" => "AK", "arizona" => "AZ", "arkansas" => "AR",
      "california" => "CA", "colorado" => "CO", "connecticut" => "CT", "delaware" => "DE",
      "florida" => "FL", "georgia" => "GA", "hawaii" => "HI", "idaho" => "ID",
      "illinois" => "IL", "indiana" => "IN", "iowa" => "IA", "kansas" => "KS",
      "kentucky" => "KY", "louisiana" => "LA", "maine" => "ME", "maryland" => "MD",
      "massachusetts" => "MA", "michigan" => "MI", "minnesota" => "MN", "mississippi" => "MS",
      "missouri" => "MO", "montana" => "MT", "nebraska" => "NE", "nevada" => "NV",
      "new hampshire" => "NH", "new jersey" => "NJ", "new mexico" => "NM", "new york" => "NY",
      "north carolina" => "NC", "north dakota" => "ND", "ohio" => "OH", "oklahoma" => "OK",
      "oregon" => "OR", "pennsylvania" => "PA", "rhode island" => "RI", "south carolina" => "SC",
      "south dakota" => "SD", "tennessee" => "TN", "texas" => "TX", "utah" => "UT",
      "vermont" => "VT", "virginia" => "VA", "washington" => "WA", "west virginia" => "WV",
      "wisconsin" => "WI", "wyoming" => "WY", "district of columbia" => "DC", "dc" => "DC"
    }
    upper = value.upcase
    return upper if state_map.value?(upper)

    state_map[value.downcase]
  end

  def requires_statewide_electrical_license?
    code = normalized_state_code
    return false if code.blank?

    !PlatformSetting.local_only_license_state_codes.include?(code)
  end

  def state_and_license_requirements
    return if state.blank?
    return unless requires_statewide_electrical_license?
    return if electrical_license_number.present?

    errors.add(:electrical_license_number, "is required for companies in #{state}")
  end

  def membership_level_must_be_configured
    return if membership_level.blank?

    unless MembershipPolicy.level_valid?(membership_level, audience: :company)
      errors.add(:membership_level, "is not a valid tier")
    end
  end
end
