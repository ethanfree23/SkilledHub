# frozen_string_literal: true

# Mail mode selection for production (and audit). Required from
# `config/environments/production.rb` before `app/` autoloads — do not reference
# `MailDelivery` there (NameError on boot in Docker/Railway).
module MailEnv
  def self.mailtrap_http_delivery?
    flag = ENV["MAILTRAP_USE_HTTP"].to_s.strip.downcase
    return false if %w[false 0 no].include?(flag)
    return true if %w[true 1 yes].include?(flag)

    return true if ENV["MAILTRAP_USE_HTTP"].blank? && ENV["MAILTRAP_API_TOKEN"].present?

    # Railway often blocks outbound SMTP :587. If Mailtrap SMTP vars are set but the deploy never
    # set MAILTRAP_USE_HTTP, prefer HTTPS (same token in SMTP_PASSWORD) so mail still sends.
    if ENV["MAILTRAP_USE_HTTP"].blank? &&
       ENV["SMTP_PASSWORD"].present? &&
       ENV["SMTP_ADDRESS"].to_s.include?("mailtrap") &&
       railway_host?
      return true
    end

    false
  end

  def self.railway_host?
    ENV.keys.any? { |k| k.start_with?("RAILWAY_") && ENV[k].present? }
  end
end
