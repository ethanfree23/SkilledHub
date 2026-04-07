# frozen_string_literal: true

class CreateCrmLeads < ActiveRecord::Migration[7.1]
  def change
    create_table :crm_leads do |t|
      t.string :name, null: false
      t.string :contact_name
      t.string :email
      t.string :phone
      t.string :website
      t.string :status, null: false, default: "lead"
      t.text :notes
      t.references :linked_user, foreign_key: { to_table: :users }, null: true, index: { unique: true }

      t.timestamps
    end

    add_index :crm_leads, :status
  end
end
