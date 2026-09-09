# frozen_string_literal: true

class PasswordSetupChallenge < ApplicationRecord
  CODE_TTL = 10.minutes
  RESEND_COOLDOWN = 60.seconds
  MAX_ATTEMPTS = 5
  STALE_AFTER = 24.hours

  belongs_to :user

  before_validation :assign_public_id, on: :create

  validates :public_id, presence: true, uniqueness: true
  validates :code_digest, presence: true
  validates :expires_at, presence: true

  scope :active, -> { where(consumed_at: nil).where("expires_at > ?", Time.current) }

  def self.generate_code
    format("%06d", SecureRandom.random_number(1_000_000))
  end

  def self.digest(value, public_id:)
    OpenSSL::HMAC.hexdigest("SHA256", Rails.application.secret_key_base, "#{public_id}:#{value}")
  end

  def self.cleanup_stale!
    cutoff = STALE_AFTER.ago
    where("expires_at < :cutoff OR consumed_at < :cutoff", cutoff: cutoff).delete_all
  end

  def expired?
    expires_at.blank? || expires_at <= Time.current
  end

  def consumed?
    consumed_at.present?
  end

  def locked?
    attempt_count >= MAX_ATTEMPTS
  end

  def verified?
    verified_at.present?
  end

  def resend_available_at
    return Time.current if last_sent_at.blank?

    last_sent_at + RESEND_COOLDOWN
  end

  def resend_cooling_down?
    last_sent_at.present? && Time.current < resend_available_at
  end

  def code_matches?(code)
    expected = self.class.digest(normalize_code(code), public_id: public_id)
    ActiveSupport::SecurityUtils.secure_compare(code_digest.to_s, expected)
  end

  def verification_token_matches?(token)
    return false if verification_token_digest.blank?

    expected = self.class.digest(token.to_s, public_id: public_id)
    ActiveSupport::SecurityUtils.secure_compare(verification_token_digest.to_s, expected)
  end

  def assign_code!(code)
    ensure_public_id
    self.code_digest = self.class.digest(normalize_code(code), public_id: public_id)
    self.expires_at = CODE_TTL.from_now
    self.attempt_count = 0
    self.verified_at = nil
    self.verification_token_digest = nil
  end

  private

  def assign_public_id
    ensure_public_id
  end

  def ensure_public_id
    self.public_id = SecureRandom.uuid if public_id.blank?
  end

  def normalize_code(code)
    code.to_s.gsub(/\s+/, "")
  end
end
