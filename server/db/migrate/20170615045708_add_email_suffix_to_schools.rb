class AddEmailSuffixToSchools < ActiveRecord::Migration[5.0]
  def change
    add_column :schools, :email_domain, :string
  end
end
