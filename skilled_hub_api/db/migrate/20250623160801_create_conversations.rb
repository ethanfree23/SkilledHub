class CreateConversations < ActiveRecord::Migration[7.1]
  def change
    create_table :conversations do |t|
      t.references :job, null: false, foreign_key: true
      t.references :technician_profile, null: false, foreign_key: true
      t.references :company_profile, null: false, foreign_key: true

      t.timestamps
    end
  end
end
