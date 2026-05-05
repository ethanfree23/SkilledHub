# frozen_string_literal: true

class AddShareTokenToJobs < ActiveRecord::Migration[7.1]
  def up
    add_column :jobs, :share_token, :string

    say_with_time "Backfilling share_token for existing jobs" do
      Job.reset_column_information
      Job.unscoped.find_each do |job|
        token = loop do
          t = SecureRandom.urlsafe_base64(32)
          break t unless Job.unscoped.exists?(share_token: t)
        end
        job.update_column(:share_token, token)
      end
    end

    change_column_null :jobs, :share_token, false
    add_index :jobs, :share_token, unique: true
  end

  def down
    remove_index :jobs, :share_token
    remove_column :jobs, :share_token
  end
end
