class AddCategoryScoresToRatings < ActiveRecord::Migration[7.1]
  def change
    add_column :ratings, :category_scores, :jsonb, default: {}
    change_column :ratings, :score, :decimal, precision: 3, scale: 2
  end
end
