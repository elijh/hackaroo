class UserController < ApplicationController

  def index
    render :template => 'editor/index.html.erb', :layout => false
  end

end

