class CreateJobs < ActiveRecord::Migration[7.1]
  def change
    create_table :jobs do |t|
      t.references :company_profile, null: false, foreign_key: true
      t.string :title
      t.text :description
      t.text :required_documents
      t.string :location
      t.integer :status

      t.timestamps
    end
  end
end
