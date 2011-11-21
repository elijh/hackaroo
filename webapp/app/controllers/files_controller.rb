class FilesController < ApplicationController

  #def index
  #  render :template => 'editor/index.html.erb', :layout => false
  #end
 
  # 
  # POST /files
  #
  # params: exercise_id, user_id
  #
  def create
    user = User.find_by_username(params[:user_id])
    file = SourceFile.find_by_user_id_and_exercise_id(user.id, params[:exercise_id])
    if file
      file.data = params[:content]
      file.save!
    else
      SourceFile.create!(:user => user, :exercise_id => params[:exercise_id], :data => params[:content])
    end
    render :nothing => true
  end

  #
  # GET /files/?exercise_id=x&user_id=x&timestamp=time_t
  #
  def show
    user = User.find_by_username(params[:user_id])
    if file = SourceFile.find_by_user_id_and_exercise_id(user.id, params[:exercise_id])
      # if file.updated_at > Time.at(params[:timestamp].to_i)
        p file
        render :text => file.data
      #else
      #  render :nothing => true, :status => 304
    else
      render :nothing => true, :status => 304
    end
  end
  
end

