class ApplicationMailer < ActionMailer::Base
  include ApplicationHelper
  default from: "from@example.com"
  layout "mailer"
  helper ApplicationHelper
  before_action :assign_email_branding

  private

  def assign_email_branding
    @email_asset_base_url = ENV.fetch("EMAIL_ASSET_BASE_URL", ENV.fetch("FRONTEND_URL", "http://localhost:5173")).to_s.chomp("/")
    @email_logo_url = ENV.fetch("EMAIL_LOGO_URL", "#{@email_asset_base_url}/techflash-logo.png")
    @email_brand_font_family = ENV.fetch("EMAIL_BRAND_FONT_FAMILY", "inherit")
    @email_brand_font_url = ENV["EMAIL_BRAND_FONT_URL"].to_s.presence
  end

  def email_asset_base_url
    @email_asset_base_url || ENV.fetch("EMAIL_ASSET_BASE_URL", ENV.fetch("FRONTEND_URL", "http://localhost:5173")).to_s.chomp("/")
  end

  def email_logo_url
    @email_logo_url || ENV.fetch("EMAIL_LOGO_URL", "#{email_asset_base_url}/techflash-logo.png")
  end

  def email_brand_font_family
    @email_brand_font_family || ENV.fetch("EMAIL_BRAND_FONT_FAMILY", "inherit")
  end

  def email_brand_font_url
    return @email_brand_font_url if defined?(@email_brand_font_url)

    ENV["EMAIL_BRAND_FONT_URL"].to_s.presence
  end
end
