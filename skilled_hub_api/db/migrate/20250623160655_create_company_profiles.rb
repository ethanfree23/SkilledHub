class CreateCompanyProfiles < ActiveRecord::Migration[7.1]
  def change
    create_table :company_profiles do |t|
      t.references :user, null: false, foreign_key: true
      t.string :company_name
      t.string :industry
      t.string :location

      t.timestamps
    end
  end
end
