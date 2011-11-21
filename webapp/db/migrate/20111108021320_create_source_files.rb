class CreateSourceFiles < ActiveRecord::Migration
  def self.up
    create_table :source_files do |t|
      t.string :name
      t.text :data
      t.integer :exercise_id
      t.integer :user_id
      t.timestamps
    end
  end

  def self.down
    drop_table :source_files
  end
end
