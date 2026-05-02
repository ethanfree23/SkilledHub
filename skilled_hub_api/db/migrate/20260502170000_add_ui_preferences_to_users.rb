class AddUiPreferencesToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :ui_preferences, :json, null: false, default: {}
  end
end
