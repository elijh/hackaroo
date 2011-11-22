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
    file = SourceFile.find_or_create!(params)
    file.data = params[:body]
    file.save!
    render :nothing => true
  end

  #
  # GET /files/?exercise_id=x&user_id=x&timestamp=time_t
  #
  def show
    if file = SourceFile.find_by_params(params)
      # if file.updated_at > Time.at(params[:timestamp].to_i)
        p file
        render :json => {:exercise_name => params[:exercise_name], :section_name => params[:section_name], :body => file.data}
      #else
      #  render :nothing => true, :status => 304
    else
      render :nothing => true, :status => 304
    end
  end
  
end

