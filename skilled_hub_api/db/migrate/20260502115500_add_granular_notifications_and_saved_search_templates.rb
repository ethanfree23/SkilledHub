# frozen_string_literal: true

class AddGranularNotificationsAndSavedSearchTemplates < ActiveRecord::Migration[7.1]
  def change
    add_column :users,
               :email_notification_preferences,
               :text,
               null: false,
               default: '{"messages":true,"job_lifecycle":true,"reviews":true,"membership_updates":true}'

    add_column :saved_job_searches, :max_distance_miles, :integer
    add_column :saved_job_searches, :min_hourly_rate_cents, :integer
    add_column :saved_job_searches, :max_required_years_experience, :integer
    add_column :saved_job_searches, :required_certifications, :text

    remove_index :saved_job_searches, name: "index_saved_searches_on_tech_and_criteria"
    add_index :saved_job_searches,
              [
                :technician_profile_id,
                :keyword,
                :location,
                :skill_class,
                :max_distance_miles,
                :min_hourly_rate_cents,
                :max_required_years_experience,
                :required_certifications
              ],
              unique: true,
              name: "index_saved_searches_on_tech_and_template_criteria"
  end
end
