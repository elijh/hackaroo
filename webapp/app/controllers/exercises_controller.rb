EXERCISE_DIR = "#{Rails.root}/exercises"

class ExercisesController < ApplicationController

  def index
    data = read_exercise_directory(EXERCISE_DIR)
    render :json => data['sections']
  end

  private

  def read_exercise_directory(dirpath)
    return nil unless File.exists?(dirpath + '/INDEX.json')

    data = {'sections' => [], 'name' => File.basename(dirpath)}
    Dir.glob(dirpath + '/*').each do |file|
      if file.ends_with?('.txt')
        data['sections'] << read_exercise_file(file)
      elsif File.directory?(file)
        data['sections'] << read_exercise_directory(file)
      end
    end
    data['sections'].compact!
    return nil unless data['sections'].any?

    metadata = JSON.parse File.read(dirpath + '/INDEX.json')
    if metadata.any?
      data.merge!(metadata)
      if metadata['order'] and data['sections'].any?
        order = metadata['order']
        data['sections'].sort! do |a,b|
          (order.index(a['name'])||1000) <=> (order.index(b['name'])||1000)
        end
      end
    end
    return data
  end
  
  def read_exercise_file(filepath)
    name = File.basename(filepath).sub('.txt','')
    body = File.read(filepath)
    body.sub!(/.*?\n\n/m, '')
    meta = $~[0] || ""
    data = {}
    if meta.any?
      meta.lines.each do |line|
        variable, value = line.split(':');
        variable = variable.strip
        value = (value||'').strip
        if variable and variable.any? and value and value.any?
          data[variable] = value
        end
      end
    end
    data['body'] = BlueCloth.new(data['body'] || body).to_html
    data['name'] ||= name
    data['title'] ||= name.titleize
    return data
  end

end

