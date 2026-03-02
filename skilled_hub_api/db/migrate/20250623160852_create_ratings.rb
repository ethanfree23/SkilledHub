class CreateRatings < ActiveRecord::Migration[7.1]
  def change
    create_table :ratings do |t|
      t.references :job, null: false, foreign_key: true
      t.references :reviewer, polymorphic: true, null: false
      t.references :reviewee, polymorphic: true, null: false
      t.integer :score
      t.text :comment

      t.timestamps
    end
  end
end
