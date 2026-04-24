# frozen_string_literal: true

class CrmLead < ApplicationRecord
  STATUSES = %w[lead contacted qualified proposal prospect customer churned lost].freeze

  belongs_to :linked_user, class_name: "User", optional: true, inverse_of: :crm_leads

  validates :name, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :linked_user_id, uniqueness: { allow_nil: true }

  validate :linked_user_must_be_company_with_profile

  private

  def linked_user_must_be_company_with_profile
    return if linked_user_id.blank?

    u = linked_user
    unless u&.company?
      errors.add(:linked_user_id, "must be a company account")
      return
    end
    unless u.company_profile.present?
      errors.add(:linked_user_id, "has no company profile yet")
    end
  end
end
