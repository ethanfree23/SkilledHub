# frozen_string_literal: true

class GhlReferenceParser
  PHONE_REGEX = /(?:\+?1[\s.\-]*)?(?:\(?\d{3}\)?[\s.\-]*\d{3}[\s.\-]*\d{4}|\d{10,11})/
  MAX_REFERENCES = 3
  DEFAULT_RELATIONSHIP = "Professional reference"

  def self.from_payload(payload)
    payload = (payload.presence || {}).to_h.stringify_keys
    structured = from_array(payload["references"])
    structured = from_numbered_fields(payload) if structured.empty?
    structured = parse(payload["tf_intake_references"]) if structured.empty?
    structured.first(MAX_REFERENCES)
  end

  def self.parse(raw)
    split_chunks(raw).filter_map { |chunk| parse_chunk(chunk) }
  end

  def self.split_chunks(raw)
    text = raw.to_s.strip
    return [] if text.blank?

    parts = text.split(/\r?\n/).map(&:strip).reject(&:blank?)
    parts = text.split(/\s*;\s*/).map(&:strip).reject(&:blank?) if parts.size <= 1
    if parts.size == 1 && text.match?(/\d+[\.)]\s/)
      parts = text.split(/(?=\d+[\.)]\s)/).map(&:strip).reject(&:blank?)
    end
    parts
  end

  def self.parse_chunk(chunk)
    cleaned = chunk.to_s.sub(/\A\d+[\.)]\s*/, "").strip
    match = cleaned.match(PHONE_REGEX)
    return nil unless match

    phone = match[0]
    name = cleaned[0...match.begin(0)].gsub(/[,:\-\s]+\z/, "").strip
    return nil if name.blank?

    after = cleaned[match.end(0)..].to_s.sub(/\A[,\s]+/, "").strip
    extras = after.split(",").map(&:strip).reject(&:blank?)

    {
      full_name: name,
      phone: phone,
      company_name: extras[0],
      relationship: extras[1],
      email: GhlIntakeParser.extract_email(after)
    }
  end

  def self.from_array(raw)
    list =
      case raw
      when String
        parsed = JSON.parse(raw)
        parsed.is_a?(Array) ? parsed : []
      when Array
        raw
      else
        []
      end

    list.filter_map { |item| normalize_structured(item) }
  rescue JSON::ParserError
    []
  end

  def self.from_numbered_fields(payload)
    (1..MAX_REFERENCES).filter_map do |index|
      normalize_structured(
        {
          full_name: payload["reference_#{index}_name"] || payload["reference_#{index}_full_name"],
          company_name: payload["reference_#{index}_company"] || payload["reference_#{index}_company_name"],
          phone: payload["reference_#{index}_phone"],
          email: payload["reference_#{index}_email"]
        }
      )
    end
  end

  def self.normalize_structured(item)
    hash =
      case item
      when Hash
        item.stringify_keys
      else
        item.respond_to?(:to_unsafe_h) ? item.to_unsafe_h.stringify_keys : nil
      end
    return nil if hash.blank?

    full_name = (hash["full_name"] || hash["name"]).to_s.strip.presence
    return nil if full_name.blank?

    phone = hash["phone"].to_s.strip.presence
    email = GhlIntakeParser.extract_email(hash["email"])
    return nil if phone.blank? && email.blank?

    {
      full_name: full_name,
      phone: phone,
      email: email,
      company_name: (hash["company_name"] || hash["company"]).to_s.strip.presence,
      relationship: hash["relationship"].to_s.strip.presence || DEFAULT_RELATIONSHIP
    }
  end
end
