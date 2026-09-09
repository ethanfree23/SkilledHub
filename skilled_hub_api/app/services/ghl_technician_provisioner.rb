# frozen_string_literal: true

class GhlTechnicianProvisioner
  class Error < StandardError; end

  TRADE_LICENSE_DOC_TYPES = %w[license certificate cert].freeze
  DEFAULT_LICENSE_DOC_TYPE = "certificate"
  DEFAULT_RELATIONSHIP = "Professional reference"
  GHL_CREDENTIAL_SOURCE = "ghl_intake"

  def self.upsert!(attrs)
    new(attrs).upsert!
  end

  def initialize(attrs)
    @existing_user = attrs[:user]
    @email = attrs[:email].to_s.strip.downcase
    @phone = attrs[:phone].to_s.strip
    @first_name = attrs[:first_name]
    @last_name = attrs[:last_name]
    @ghl_contact_id = attrs[:ghl_contact_id].to_s.strip
    @ghl_location_id = attrs[:ghl_location_id].to_s.strip
    @ghl_conversation_id = attrs[:ghl_conversation_id]
    @zip_code = attrs[:zip_code]
    @trade_type = TradeCatalog.normalized_label(attrs[:trade_type]).presence || attrs[:trade_type].to_s.strip.presence
    @experience_years = attrs[:experience_years]
    @skill_class = TechnicianClassCatalog.normalized_slug(attrs[:skill_class])
    @has_trade_credential = attrs[:has_trade_credential]
    @min_hourly_rate_cents = attrs[:min_hourly_rate_cents]
    @max_distance_miles = attrs[:max_distance_miles]
    @intake_contact_info = attrs[:tf_intake_contact_info]
    @intake_references = attrs[:tf_intake_references]
    @parsed_references = Array(attrs[:parsed_references])
  end

  def upsert!
    created = @existing_user.blank?
    user = @existing_user || User.new(role: :technician)
    assign_user_attributes!(user, created: created)
    profile = nil

    ActiveRecord::Base.transaction do
      user.save!
      profile = user.technician_profile || user.build_technician_profile
      assign_profile_attributes!(profile)
      profile.save!
      persist_job_alert_preferences!(user)
      persist_trade_credential!(profile)
      persist_references!(user)
    end

    { user: user.reload, profile: profile.reload, created: created }
  rescue ActiveRecord::RecordInvalid => e
    raise Error, e.record.errors.full_messages.to_sentence.presence || e.message
  end

  private

  def assign_user_attributes!(user, created:)
    if created
      # Unusable internal password. The technician never receives this value.
      # First-time login is via /create-password after email verification.
      # Do not use email, phone, ZIP, name, or any other predictable default.
      password = SecureRandom.urlsafe_base64(32)
      user.password = password
      user.password_confirmation = password
      user.password_set_actor = "system"
      user.role = :technician
      user.ghl_onboarded_at = Time.current
    else
      user.ghl_onboarded_at ||= Time.current
    end

    assign_unless_blank(user, :email, @email)
    assign_unless_blank(user, :phone, @phone)
    assign_unless_blank(user, :first_name, @first_name)
    assign_unless_blank(user, :last_name, @last_name)
    assign_unless_blank(user, :ghl_contact_id, @ghl_contact_id)
    assign_unless_blank(user, :ghl_location_id, @ghl_location_id)
    assign_unless_blank(user, :ghl_conversation_id, @ghl_conversation_id)
    assign_unless_blank(user, :ghl_intake_contact_info, @intake_contact_info)
    assign_unless_blank(user, :ghl_intake_references, @intake_references)
    user.phone_normalized = GhlPhoneNormalizer.normalize(@phone.presence || user.phone)
  end

  def assign_profile_attributes!(profile)
    profile.background_verified = false if profile.new_record?
    assign_unless_blank(profile, :phone, @phone)
    assign_unless_blank(profile, :zip_code, @zip_code)
    assign_unless_blank(profile, :trade_type, @trade_type)
    assign_unless_blank(profile, :skill_class, @skill_class)
    assign_unless_blank(profile, :experience_years, @experience_years)
  end

  def persist_job_alert_preferences!(user)
    return if @min_hourly_rate_cents.nil? && @max_distance_miles.nil? && @trade_type.blank?

    pref = user.job_alert_preference || user.build_job_alert_preference(
      min_hourly_rate_cents: 0,
      max_distance_miles: 200,
      email_enabled: true,
      sms_enabled: true,
      app_enabled: true
    )
    assign_unless_blank(pref, :min_hourly_rate_cents, @min_hourly_rate_cents)
    assign_unless_blank(pref, :max_distance_miles, @max_distance_miles)
    assign_unless_blank(pref, :trade_label, @trade_type)
    pref.save!
  end

  def persist_trade_credential!(profile)
    return unless @has_trade_credential == true

    existing = profile.documents.where(doc_type: TRADE_LICENSE_DOC_TYPES)
    return if existing.any?

    profile.documents.create!(
      doc_type: DEFAULT_LICENSE_DOC_TYPE,
      status: :pending_review,
      issuer: "Self-reported via GHL intake",
      document_number: "GHL_SELF_REPORTED",
      metadata: { "source" => GHL_CREDENTIAL_SOURCE, "has_trade_credential" => true }
    )
  end

  def persist_references!(user)
    @parsed_references.each do |ref|
      full_name = (ref[:full_name] || ref["full_name"]).to_s.strip
      next if full_name.blank?

      phone = (ref[:phone] || ref["phone"]).to_s.strip.presence
      email = GhlIntakeParser.extract_email(ref[:email] || ref["email"])
      phone_normalized = GhlPhoneNormalizer.normalize(phone)
      next if phone_normalized.blank? && email.blank?

      existing = find_existing_reference(user, phone_normalized: phone_normalized, email: email)
      if existing
        assign_unless_blank(existing, :full_name, full_name)
        assign_unless_blank(existing, :company_name, ref[:company_name] || ref["company_name"])
        assign_unless_blank(existing, :relationship, ref[:relationship] || ref["relationship"])
        assign_unless_blank(existing, :phone, phone)
        assign_unless_blank(existing, :email, email)
        existing.save!
        next
      end

      user.verification_references_as_technician.create!(
        full_name: full_name,
        phone: phone,
        email: email,
        company_name: (ref[:company_name] || ref["company_name"]).to_s.strip.presence,
        relationship: (ref[:relationship] || ref["relationship"]).to_s.strip.presence || DEFAULT_RELATIONSHIP,
        status: :requested,
        requested_at: Time.current
      )
    end
  end

  def find_existing_reference(user, phone_normalized:, email:)
    scope = user.verification_references_as_technician
    if phone_normalized.present?
      found = scope.find_by(phone_normalized: phone_normalized)
      return found if found
    end
    return nil if email.blank?

    scope.find_by(email_normalized: email)
  end

  def assign_unless_blank(record, field, value)
    return if value.nil?

    cleaned = value.is_a?(String) ? value.strip : value
    return if cleaned.blank?

    record.public_send("#{field}=", cleaned)
  end
end
