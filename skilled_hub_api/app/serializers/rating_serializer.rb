class RatingSerializer < ActiveModel::Serializer
  attributes :id, :job_id, :score, :comment, :created_at, :updated_at,
             :reviewer_type, :reviewer_id, :reviewee_type, :reviewee_id
end 