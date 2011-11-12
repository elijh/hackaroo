class Timestamp < ActiveRecord::Base

  belongs_to :user
  belongs_to :file

end
