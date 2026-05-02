class UserSerializer < ActiveModel::Serializer
  attributes :id,
             :email,
             :first_name,
             :last_name,
             :phone,
             :role,
             :company_profile_id,
             :membership_level,
             :email_notifications_enabled,
             :email_notification_preferences,
             :job_alert_notifications_enabled,
             :ui_preferences,
             :created_at,
             :updated_at

  def company_profile_id
    object.company_profile&.id
  end

  def membership_level
    if object.company?
      MembershipPolicy.normalized_level(object.company_profile&.membership_level, audience: :company)
    elsif object.technician?
      MembershipPolicy.normalized_level(object.technician_profile&.membership_level, audience: :technician)
    end
  end

  def email_notification_preferences
    object.email_notification_preferences_hash
  end

  def ui_preferences
    object.ui_preferences_hash
  end
end 