class CreateJobApplications < ActiveRecord::Migration[7.1]
  def change
    create_table :job_applications do |t|
      t.references :job, null: false, foreign_key: true
      t.references :technician_profile, null: false, foreign_key: true
      t.integer :status
      t.text :notes

      t.timestamps
    end
  end
end
