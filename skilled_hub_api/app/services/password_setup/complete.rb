# frozen_string_literal: true

module PasswordSetup
  class Complete
    INVALID_MESSAGE = "Your verification session expired. Start again."
    MISMATCH_MESSAGE = "Passwords do not match"
    ALREADY_SETUP_MESSAGE = "Your account is already set up."

    def self.call(challenge_id:, verification_token:, password:, password_confirmation:)
      new(
        challenge_id: challenge_id,
        verification_token: verification_token,
        password: password,
        password_confirmation: password_confirmation
      ).call
    end

    def initialize(challenge_id:, verification_token:, password:, password_confirmation:)
      @challenge_id = challenge_id.to_s
      @verification_token = verification_token.to_s
      @password = password.to_s
      @password_confirmation = password_confirmation.to_s
    end

    def call
      challenge = PasswordSetupChallenge.find_by(public_id: @challenge_id)
      unless completeable_challenge?(challenge)
        return invalid_result
      end

      unless PasswordStrength.valid?(@password)
        return Result.new(
          http_status: :unprocessable_entity,
          body: {
            status: "invalid_password",
            error: PasswordStrength::REQUIREMENT_TEXT,
            errors: [PasswordStrength::REQUIREMENT_TEXT]
          }
        )
      end

      if @password != @password_confirmation
        return Result.new(
          http_status: :unprocessable_entity,
          body: { status: "mismatch", error: MISMATCH_MESSAGE, errors: [MISMATCH_MESSAGE] }
        )
      end

      result = nil
      user = challenge.user
      challenge.with_lock do
        challenge.reload
        user.reload
        unless completeable_challenge?(challenge)
          result = invalid_result
          next
        end

        unless user.first_time_password_setup_eligible?
          result = Result.new(
            http_status: :unprocessable_entity,
            body: { status: "already_setup", error: ALREADY_SETUP_MESSAGE }
          )
          next
        end

        user.password = @password
        user.password_confirmation = @password_confirmation
        user.password_set_actor = "user"
        unless user.save
          result = Result.new(
            http_status: :unprocessable_entity,
            body: {
              status: "invalid_password",
              error: user.errors.full_messages.to_sentence,
              errors: user.errors.full_messages
            }
          )
          next
        end

        challenge.update!(consumed_at: Time.current)
        user.clear_password_reset_token! if user.password_reset_token.present?
        result = Result.new(
          http_status: :ok,
          body: { status: "password_created" }
        )
      end

      result
    end

    private

    def completeable_challenge?(challenge)
      challenge.present? &&
        challenge.verified? &&
        !challenge.consumed? &&
        !challenge.expired? &&
        challenge.verification_token_matches?(@verification_token)
    end

    def invalid_result
      Result.new(
        http_status: :unprocessable_entity,
        body: { status: "invalid_or_expired", error: INVALID_MESSAGE }
      )
    end
  end
end
