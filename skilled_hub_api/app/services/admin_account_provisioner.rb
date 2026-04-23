# frozen_string_literal: true

# Creates technician or company users from the admin panel with email-derived temp password
# and sends the standard password-reset email.
module AdminAccountProvisioner
  class Error < StandardError; end

  module_function

  def provision_company!(email:, company_name: nil, industry: nil, location: nil, bio: nil)
    email = normalize_email(email)
    assert_email_available!(email)

    pw = User.initial_password_from_email(email)
    user = nil
    profile = nil

    ActiveRecord::Base.transaction do
      user = User.create!(
        email: email,
        password: pw,
        password_confirmation: pw,
        role: :company
      )
      profile = CompanyProfile.create!(
        user: user,
        company_name: company_name.to_s.strip.presence || "Company",
        industry: industry.to_s.strip.presence,
        location: location.to_s.strip.presence,
        bio: bio.to_s.strip.presence
      )
      user.generate_password_reset_token!
    end

    send_reset_email(user)
    { user: user, profile: profile }
  end

  def provision_technician!(email:, trade_type: nil, location: nil, experience_years: nil, availability: nil, bio: nil)
    email = normalize_email(email)
    assert_email_available!(email)

    pw = User.initial_password_from_email(email)
    user = nil
    profile = nil

    ActiveRecord::Base.transaction do
      user = User.create!(
        email: email,
        password: pw,
        password_confirmation: pw,
        role: :technician
      )
      profile = TechnicianProfile.create!(
        user: user,
        trade_type: trade_type.to_s.strip.presence || "Technician",
        location: location.to_s.strip.presence,
        experience_years: experience_years.present? ? experience_years.to_i : nil,
        availability: availability.to_s.strip.presence,
        bio: bio.to_s.strip.presence
      )
      user.generate_password_reset_token!
    end

    send_reset_email(user)
    { user: user, profile: profile }
  end

  def send_reset_email(user)
    MailDelivery.safe_deliver do
      UserMailer.password_reset_instructions(user, reason: :admin_provisioned).deliver_now
    end
  end

  def normalize_email(email)
    e = email.to_s.strip.downcase
    raise Error, "Email is required" if e.blank?

    e
  end

  def assert_email_available!(email)
    return unless User.where("LOWER(email) = ?", email).exists?

    raise Error, "An account with this email already exists"
  end
end
