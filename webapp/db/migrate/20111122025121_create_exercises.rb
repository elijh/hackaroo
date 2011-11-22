
class CreateExercises < ActiveRecord::Migration
  def self.up
    create_table :exercises do |t|
      t.string :name
      t.text :data
    end
  end

  def self.down
    drop_table :source_files
  end
end

