# frozen_string_literal: true

class CreateUserLoginEvents < ActiveRecord::Migration[7.1]
  def change
    create_table :user_login_events do |t|
      t.references :user, null: false, foreign_key: true, index: true
      t.timestamps
    end

    add_index :user_login_events, %i[user_id created_at]
  end
end
