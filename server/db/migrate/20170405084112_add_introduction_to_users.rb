class AddIntroductionToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :introduction, :string, null: false, default: ''
  end
end
