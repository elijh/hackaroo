class CreateFiles < ActiveRecord::Migration
  def self.up
    create_table :files do |t|
      t.string :name
      t.text :data
      t.integer :user_id
      t.timestamps
    end
  end

  def self.down
    drop_table :files
  end
end
