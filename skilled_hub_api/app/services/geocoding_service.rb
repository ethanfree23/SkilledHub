# frozen_string_literal: true

require 'net/http'
require 'json'
require 'set'

class GeocodingService
  NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
  USER_AGENT = 'TechFlash/1.0 (contact@techflash.com)'

  US_STATE_FULL_TO_ABBR = {
    'alabama' => 'AL', 'alaska' => 'AK', 'arizona' => 'AZ', 'arkansas' => 'AR',
    'california' => 'CA', 'colorado' => 'CO', 'connecticut' => 'CT', 'delaware' => 'DE',
    'district of columbia' => 'DC', 'florida' => 'FL', 'georgia' => 'GA', 'hawaii' => 'HI',
    'idaho' => 'ID', 'illinois' => 'IL', 'indiana' => 'IN', 'iowa' => 'IA',
    'kansas' => 'KS', 'kentucky' => 'KY', 'louisiana' => 'LA', 'maine' => 'ME',
    'maryland' => 'MD', 'massachusetts' => 'MA', 'michigan' => 'MI', 'minnesota' => 'MN',
    'mississippi' => 'MS', 'missouri' => 'MO', 'montana' => 'MT', 'nebraska' => 'NE',
    'nevada' => 'NV', 'new hampshire' => 'NH', 'new jersey' => 'NJ', 'new mexico' => 'NM',
    'new york' => 'NY', 'north carolina' => 'NC', 'north dakota' => 'ND', 'ohio' => 'OH',
    'oklahoma' => 'OK', 'oregon' => 'OR', 'pennsylvania' => 'PA', 'rhode island' => 'RI',
    'south carolina' => 'SC', 'south dakota' => 'SD', 'tennessee' => 'TN', 'texas' => 'TX',
    'utah' => 'UT', 'vermont' => 'VT', 'virginia' => 'VA', 'washington' => 'WA',
    'west virginia' => 'WV', 'wisconsin' => 'WI', 'wyoming' => 'WY'
  }.freeze

  class GeocodingError < StandardError; end

  # Geocode an address and return [latitude, longitude] or nil
  def self.geocode(address:, city:, state: nil, zip_code: nil, country: nil)
    parts = [address, city, state, zip_code, country].compact.reject(&:blank?)
    return nil if parts.empty?

    query = parts.join(', ')
    uri = URI(NOMINATIM_URL)
    uri.query = URI.encode_www_form(
      q: query,
      format: 'json',
      limit: 1,
      addressdetails: 0
    )

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 5
    http.read_timeout = 5

    request = Net::HTTP::Get.new(uri)
    request['User-Agent'] = USER_AGENT

    response = http.request(request)
    return nil unless response.is_a?(Net::HTTPSuccess)

    results = JSON.parse(response.body)
    return nil if results.empty?

    lat = results.first['lat']&.to_f
    lon = results.first['lon']&.to_f
    lat && lon ? [lat, lon] : nil
  rescue StandardError => e
    Rails.logger.warn("Geocoding failed: #{e.message}")
    nil
  end

  # Haversine formula: distance in miles between two lat/lon points
  def self.distance_miles(lat1, lon1, lat2, lon2)
    return Float::INFINITY if [lat1, lon1, lat2, lon2].any?(&:nil?)

    rad_per_deg = Math::PI / 180
    earth_radius_miles = 3959

    dlat = (lat2 - lat1) * rad_per_deg
    dlon = (lon2 - lon1) * rad_per_deg
    a = Math.sin(dlat / 2)**2 + Math.cos(lat1 * rad_per_deg) * Math.cos(lat2 * rad_per_deg) * Math.sin(dlon / 2)**2
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    earth_radius_miles * c
  end

  # US city autocomplete for admin service areas; returns [{ "label" => "Austin, TX", "city" => "...", "state" => "TX" }, ...]
  def self.city_suggestions(query)
    q = query.to_s.strip
    return [] if q.length < 2

    uri = URI(NOMINATIM_URL)
    uri.query = URI.encode_www_form(
      q: q,
      format: 'json',
      limit: 15,
      addressdetails: 1,
      countrycodes: 'us'
    )

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 5
    http.read_timeout = 8

    request = Net::HTTP::Get.new(uri)
    request['User-Agent'] = USER_AGENT

    response = http.request(request)
    return [] unless response.is_a?(Net::HTTPSuccess)

    results = JSON.parse(response.body)
    return [] unless results.is_a?(Array)

    out = []
    seen = Set.new

    results.each do |r|
      addr = r['address'] || {}
      next unless addr['country_code'].to_s.casecmp('us').zero?

      city = addr['city'] || addr['town'] || addr['village'] || addr['hamlet'] || addr['municipality']
      state = extract_us_state_code(addr)
      next if city.blank? || state.blank?

      label = "#{city}, #{state}"
      next if seen.include?(label)

      seen.add(label)
      out << { 'label' => label, 'city' => city, 'state' => state }
      break if out.size >= 10
    end

    out
  rescue StandardError => e
    Rails.logger.warn("city_suggestions failed: #{e.message}")
    []
  end

  def self.extract_us_state_code(addr)
    iso = addr['ISO3166-2-lvl4'].to_s
    if (m = iso.match(/\AUS-([A-Z]{2})\z/i))
      return m[1].upcase
    end

    s = addr['state'].to_s.strip
    return s.upcase if s.length == 2 && s.match?(/\A[A-Za-z]{2}\z/)

    US_STATE_FULL_TO_ABBR[s.downcase]
  end
end
