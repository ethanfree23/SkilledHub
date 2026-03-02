class CreateDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :documents do |t|
      t.references :uploadable, polymorphic: true, null: false
      t.string :file
      t.string :doc_type

      t.timestamps
    end
  end
end
