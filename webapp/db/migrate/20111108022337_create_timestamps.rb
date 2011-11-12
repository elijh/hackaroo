class CreateTimestamps < ActiveRecord::Migration
  def self.up
    create_table :timestamps do |t|
      t.datetime :created_at
      t.integer :user_id
      t.integer :file_id
    end
  end

  def self.down
    drop_table :timestamps
  end
end
