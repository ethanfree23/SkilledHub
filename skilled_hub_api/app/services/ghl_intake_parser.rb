# frozen_string_literal: true

class GhlIntakeParser
  EMAIL_REGEX = /[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}/i
  ZIP_REGEX = /\b\d{5}\b/
  TRUTHY = %w[true t yes y 1 on].freeze
  FALSY = %w[false f no n 0 off].freeze

  def self.parse(email: nil, contact_info: nil, zip_code: nil, postal_code: nil, zip: nil)
    payload_email = extract_email(email.to_s)
    raw = contact_info.to_s
    parsed_email = extract_email(raw)
    structured_zip = extract_zip(zip_code) || extract_zip(postal_code) || extract_zip(zip)

    {
      email: payload_email.presence || parsed_email,
      zip_code: structured_zip.presence || raw[ZIP_REGEX]
    }
  end

  def self.split_name(full_name: nil, first_name: nil, last_name: nil)
    first = first_name.to_s.strip.presence
    last = last_name.to_s.strip.presence
    if first.blank? && last.blank?
      parts = full_name.to_s.strip.split(/\s+/, 2)
      first = parts[0].presence
      last = parts[1].presence
    end

    { first_name: first, last_name: last }
  end

  def self.parse_years(value)
    return nil if value.nil?
    return value if value.is_a?(Integer) && value >= 0

    match = value.to_s[/\d+/]
    return nil if match.blank?

    n = Integer(match)
    n >= 0 ? n : nil
  rescue ArgumentError, TypeError
    nil
  end

  def self.parse_money_cents(value)
    return nil if value.nil?
    return nil if value.to_s.strip.blank?

    digits = value.to_s.gsub(/[^\d.]/, "")
    return nil if digits.blank?

    (BigDecimal(digits) * 100).round.to_i
  rescue ArgumentError, TypeError
    nil
  end

  def self.parse_miles(value)
    return nil if value.nil?
    return value if value.is_a?(Integer) && value > 0

    match = value.to_s[/\d+/]
    return nil if match.blank?

    n = Integer(match)
    n.positive? ? n : nil
  rescue ArgumentError, TypeError
    nil
  end

  def self.parse_boolean(value)
    return value if value == true || value == false
    return nil if value.nil?

    token = value.to_s.strip.downcase
    return nil if token.blank?
    return true if TRUTHY.include?(token)
    return false if FALSY.include?(token)

    nil
  end

  def self.extract_email(text)
    match = text.to_s[EMAIL_REGEX]
    match&.strip&.downcase
  end

  def self.extract_zip(value)
    value.to_s[ZIP_REGEX]
  end
end
