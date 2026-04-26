class PlatformSetting < ApplicationRecord
  validates :key, presence: true, uniqueness: true

  LICENSE_LOCAL_ONLY_STATE_CODES_KEY = "license_local_only_state_codes".freeze

  class << self
    def local_only_license_state_codes
      raw = find_by(key: LICENSE_LOCAL_ONLY_STATE_CODES_KEY)&.value_json
      arr = raw.is_a?(Array) ? raw : []
      arr.map { |v| v.to_s.strip.upcase }.select { |v| /\A[A-Z]{2}\z/.match?(v) }.uniq.sort
    end

    def set_local_only_license_state_codes!(codes)
      cleaned = Array(codes).map { |v| v.to_s.strip.upcase }.select { |v| /\A[A-Z]{2}\z/.match?(v) }.uniq.sort
      record = find_or_initialize_by(key: LICENSE_LOCAL_ONLY_STATE_CODES_KEY)
      record.value_json = cleaned
      record.save!
      cleaned
    end
  end
end
