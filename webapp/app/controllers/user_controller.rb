class UserController < ApplicationController

  def index
    User.find_or_create_by_username(params[:username])
    render :template => 'editor/index.html.erb', :layout => false
  end

end

