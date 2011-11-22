class SourceFile < ActiveRecord::Base

  belongs_to :user

  def self.find_or_create!(params)
    user = User.find_by_username(params[:user_id])
    file = SourceFile.find(:first, :conditions => {:user_id => user.id, :exercise_name => params[:exercise_name], :section_name => params[:section_name]})
    file ||= SourceFile.create!(:user => user, :exercise_name => params[:exercise_name], :section_name => params[:section_name])
    return file
  end
  
  def self.find_by_params(params)
    user = User.find_by_username(params[:user_id])
    return SourceFile.find(:first, :conditions => {:user_id => user.id, :exercise_name => params[:exercise_name], :section_name => params[:section_name]})
  end
  
end
