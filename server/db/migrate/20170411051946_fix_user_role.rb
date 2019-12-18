class FixUserRole < ActiveRecord::Migration[5.0]
  def change
    begin # -- specific email
      role = 'specific_email'
      email_suffix = [
        '+english@gmail.com',
        '+informatics@gmail.com',
        'ga.tera-house.ac.jp',
        'chiba-fjb.ac.jp',
        'stu.kawahara.ac.jp',
      ]
      email_suffix.each do |suffix|
        execute "UPDATE users SET role = '#{role}' WHERE email LIKE '%#{suffix}'"
      end
    end
    begin # -- id auth
      role = 'id_auth'
      execute "UPDATE users SET role = '#{role}' WHERE login_id IS NOT NULL AND login_id <> ''"
    end
  end
end
