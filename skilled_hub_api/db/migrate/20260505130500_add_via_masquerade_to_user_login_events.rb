# frozen_string_literal: true

class AddViaMasqueradeToUserLoginEvents < ActiveRecord::Migration[7.1]
  def change
    add_column :user_login_events, :via_masquerade, :boolean, default: false, null: false
  end
end
