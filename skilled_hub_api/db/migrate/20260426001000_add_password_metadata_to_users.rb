class AddPasswordMetadataToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :password_set_at, :datetime
    add_column :users, :password_set_by, :string
    add_index :users, :password_set_by
  end
end
