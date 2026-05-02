# frozen_string_literal: true

class CreateEmailDeliveryLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :email_delivery_logs do |t|
      t.references :user, null: true, foreign_key: true
      t.string :to_email, null: false
      t.string :mailer_class, null: false
      t.string :mailer_action, null: false
      t.text :subject
      t.datetime :created_at, null: false
    end

    add_index :email_delivery_logs, :to_email
    add_index :email_delivery_logs, %i[user_id created_at]
  end
end
