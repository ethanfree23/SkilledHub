# frozen_string_literal: true

class CrmLead < ApplicationRecord
  STATUSES = %w[lead contacted qualified proposal prospect customer competitor churned lost].freeze
  COMPANY_TYPES = [
    "hvac",
    "plumbing",
    "electrical",
    "refrigeration",
    "fire_protection",
    "general_contracting",
    "handyman",
    "roofing",
    "solar",
    "appliance_repair",
    "facility_maintenance",
    "other"
  ].freeze

  belongs_to :linked_user, class_name: "User", optional: true, inverse_of: :crm_leads
  belongs_to :linked_company_profile, class_name: "CompanyProfile", optional: true
  has_many :crm_notes, -> { order(created_at: :asc) }, dependent: :destroy

  validates :name, presence: true
  validates :status, inclusion: { in: STATUSES }
  validate :company_types_must_be_supported

  validate :linked_target_must_be_company
  validate :contacts_must_be_supported

  before_validation :normalize_company_types!
  before_validation :normalize_contacts!

  private

  def linked_target_must_be_company
    return if linked_user_id.blank? && linked_company_profile_id.blank?

    if linked_user_id.present?
      u = linked_user
      unless u&.company?
        errors.add(:linked_user_id, "must be a company account")
        return
      end
      if linked_company_profile_id.present? && u.company_profile&.id != linked_company_profile_id
        errors.add(:linked_company_profile_id, "must match the selected company user")
      elsif linked_company_profile_id.blank? && u.company_profile.blank?
        errors.add(:linked_user_id, "has no company profile yet")
      end
    end

    return if linked_company_profile_id.blank?

    unless linked_company_profile
      errors.add(:linked_company_profile_id, "is invalid")
      return
    end

    unless linked_company_profile.company_users.exists?(role: :company) || linked_company_profile.user&.company?
      errors.add(:linked_company_profile_id, "must belong to a company")
    end
  end

  def company_types_must_be_supported
    return if company_types.blank?
    unless company_types.is_a?(Array)
      errors.add(:company_types, "must be an array")
      return
    end

    invalid = company_types - COMPANY_TYPES
    return if invalid.empty?

    errors.add(:company_types, "contains unsupported values: #{invalid.join(', ')}")
  end

  def contacts_must_be_supported
    return if contacts.blank?
    unless contacts.is_a?(Array)
      errors.add(:contacts, "must be an array")
      return
    end

    contacts.each_with_index do |contact, idx|
      unless contact.is_a?(Hash)
        errors.add(:contacts, "entry #{idx + 1} must be an object")
        next
      end

      unsupported = contact.keys.map(&:to_s) - %w[name email phone]
      errors.add(:contacts, "entry #{idx + 1} has unsupported keys: #{unsupported.join(', ')}") if unsupported.any?
    end
  end

  def normalize_company_types!
    normalized =
      case company_types
      when String
        company_types.split(/[,|;]/)
      when Array
        company_types
      else
        []
      end

    self.company_types = normalized.map { |v| v.to_s.strip.downcase }.reject(&:blank?).uniq
  end

  def normalize_contacts!
    normalized =
      case contacts
      when String
        begin
          JSON.parse(contacts)
        rescue JSON::ParserError
          []
        end
      when Array
        contacts
      else
        []
      end

    self.contacts = normalized.filter_map do |entry|
      hash = entry.respond_to?(:to_h) ? entry.to_h : {}
      name = hash["name"].to_s.strip.presence || hash[:name].to_s.strip.presence
      email = hash["email"].to_s.strip.presence || hash[:email].to_s.strip.presence
      phone = hash["phone"].to_s.strip.presence || hash[:phone].to_s.strip.presence
      next if name.blank? && email.blank? && phone.blank?

      { name: name, email: email, phone: phone }.compact
    end
  end
end
