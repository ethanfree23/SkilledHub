# frozen_string_literal: true

class AddNotificationPreferencesToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :email_notifications_enabled, :boolean, null: false, default: true
    add_column :users, :job_alert_notifications_enabled, :boolean, null: false, default: true
  end
end
