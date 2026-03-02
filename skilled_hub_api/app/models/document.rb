class Document < ApplicationRecord
  belongs_to :uploadable, polymorphic: true
  has_one_attached :file

end
