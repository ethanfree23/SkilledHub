# frozen_string_literal: true

# Shared rules for password reset / account recovery flows.
module PasswordStrength
  REQUIREMENT_TEXT =
    "Password must be at least 6 characters and include uppercase, lowercase, one number, and one special character."

  module_function

  def valid?(password)
    pw = password.to_s
    return false if pw.length < 6

    pw.match?(/[A-Z]/) && pw.match?(/[a-z]/) && pw.match?(/\d/) && pw.match?(/[^A-Za-z0-9]/)
  end
end
