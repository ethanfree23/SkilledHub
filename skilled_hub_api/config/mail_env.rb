# frozen_string_literal: true

# Mail mode selection for production (and audit). Required from
# `config/environments/production.rb` before `app/` autoloads — do not reference
# `MailDelivery` there (NameError on boot in Docker/Railway).
module MailEnv
  def self.mailtrap_http_delivery?
    flag = ENV["MAILTRAP_USE_HTTP"].to_s.strip.downcase
    return false if %w[false 0 no].include?(flag)
    return true if %w[true 1 yes].include?(flag)

    ENV["MAILTRAP_USE_HTTP"].blank? && ENV["MAILTRAP_API_TOKEN"].present?
  end
end
