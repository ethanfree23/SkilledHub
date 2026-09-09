# frozen_string_literal: true

module PasswordSetup
  class Verify
    VERIFY_IP_LIMIT = 30
    VERIFY_IP_WINDOW = 15.minutes

    INVALID_MESSAGE = "That verification code is invalid or expired."
    INCORRECT_MESSAGE = "That verification code is incorrect."
    LOCKED_MESSAGE = "Too many incorrect attempts. Request a new code."
    RATE_LIMITED_MESSAGE = "Too many attempts. Please try again later."

    def self.call(challenge_id:, code:, ip:)
      new(challenge_id: challenge_id, code: code, ip: ip).call
    end

    def initialize(challenge_id:, code:, ip:)
      @challenge_id = challenge_id.to_s
      @code = code.to_s.gsub(/\s+/, "")
      @ip = ip.to_s.presence || "unknown"
    end

    def call
      ip_limit = AuthRateLimit.throttle!(
        scope: "password_setup_verify_ip",
        bucket: @ip,
        limit: VERIFY_IP_LIMIT,
        window: VERIFY_IP_WINDOW
      )
      if ip_limit[:limited]
        return Result.new(
          http_status: :too_many_requests,
          body: { status: "rate_limited", error: RATE_LIMITED_MESSAGE }
        )
      end

      challenge = PasswordSetupChallenge.find_by(public_id: @challenge_id)
      unless usable_challenge?(challenge)
        return Result.new(
          http_status: :unprocessable_entity,
          body: { status: "invalid_or_expired", error: INVALID_MESSAGE }
        )
      end

      result = nil
      challenge.with_lock do
        challenge.reload
        unless usable_challenge?(challenge)
          result = Result.new(
            http_status: :unprocessable_entity,
            body: { status: "invalid_or_expired", error: INVALID_MESSAGE }
          )
          next
        end

        if challenge.locked?
          result = Result.new(
            http_status: :unprocessable_entity,
            body: { status: "locked", error: LOCKED_MESSAGE }
          )
          next
        end

        unless challenge.code_matches?(@code)
          challenge.increment!(:attempt_count)
          result = if challenge.locked?
                     Result.new(
                       http_status: :unprocessable_entity,
                       body: { status: "locked", error: LOCKED_MESSAGE }
                     )
                   else
                     Result.new(
                       http_status: :unprocessable_entity,
                       body: { status: "invalid_code", error: INCORRECT_MESSAGE }
                     )
                   end
          next
        end

        verification_token = SecureRandom.urlsafe_base64(32)
        challenge.update!(
          verified_at: Time.current,
          verification_token_digest: PasswordSetupChallenge.digest(verification_token, public_id: challenge.public_id)
        )

        result = Result.new(
          http_status: :ok,
          body: {
            status: "verified",
            challenge_id: challenge.public_id,
            verification_token: verification_token,
            masked_email: challenge.user.masked_email
          }
        )
      end

      result
    end

    private

    def usable_challenge?(challenge)
      challenge.present? && !challenge.consumed? && !challenge.expired?
    end
  end
end
