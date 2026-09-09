# frozen_string_literal: true

class GhlProfilePhotoUrlExtractor
  URL_REGEX = %r{https?://[^\s"'<>\\]+}i
  UNINTERPOLATED = /\A\{\{.*\}\}\z/

  def self.first_url(payload)
    new(payload).first_url
  end

  def initialize(payload)
    @payload = payload.is_a?(Hash) ? payload.deep_stringify_keys : {}
  end

  def first_url
    candidates.each do |value|
      extract_urls(value).each do |url|
        return url if url.present?
      end
    end
    nil
  end

  private

  def candidates
    [
      @payload["profile_photo_url"],
      @payload["attachments"],
      @payload["message_attachments"],
      @payload["media_url"],
      @payload.dig("customData", "attachments"),
      @payload.dig("custom_data", "attachments")
    ]
  end

  def extract_urls(value)
    case value
    when nil
      []
    when Hash
      extract_urls(value["url"] || value[:url] || value["profile_photo_url"] || value.values)
    when Array
      value.flat_map { |item| extract_urls(item) }
    when String
      parse_string(value)
    else
      []
    end
  end

  def parse_string(raw)
    s = raw.to_s.strip
    return [] if s.blank? || s.match?(UNINTERPOLATED)

    if s.start_with?("[", "{")
      parsed = JSON.parse(s)
      return extract_urls(parsed)
    end

    s.split(/[\s,]+/).flat_map { |part| part.scan(URL_REGEX) }.map { |url| sanitize_url(url) }.compact
  rescue JSON::ParserError
    s.scan(URL_REGEX).map { |url| sanitize_url(url) }.compact
  end

  def sanitize_url(url)
    cleaned = url.to_s.sub(/[),.;]+$/, "")
    cleaned.presence
  end
end
