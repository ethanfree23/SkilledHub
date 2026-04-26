class CreatePlatformSettings < ActiveRecord::Migration[7.1]
  def change
    create_table :platform_settings do |t|
      t.string :key, null: false
      t.json :value_json, null: false, default: {}

      t.timestamps
    end

    add_index :platform_settings, :key, unique: true
  end
end
