# frozen_string_literal: true

class CreateCrmNotes < ActiveRecord::Migration[7.1]
  def change
    create_table :crm_notes do |t|
      t.references :crm_lead, null: false, foreign_key: true
      t.references :parent_note, null: true, foreign_key: { to_table: :crm_notes }
      t.string :contact_method, null: false, default: "note"
      t.string :title
      t.text :body, null: false
      t.boolean :made_contact, null: false, default: false

      t.timestamps
    end

    add_index :crm_notes, %i[crm_lead_id created_at]
  end
end
