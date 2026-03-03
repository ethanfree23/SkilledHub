class RatingSerializer < ActiveModel::Serializer
  attributes :id, :job_id, :score, :comment, :category_scores, :category_labels, :created_at, :updated_at,
             :reviewer_type, :reviewer_id, :reviewee_type, :reviewee_id

  def category_labels
    Rating.categories_for(object.reviewer_type)
  end
end 