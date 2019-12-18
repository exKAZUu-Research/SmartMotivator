class UserMailer < ApplicationMailer
  def passcode(user)
    @user = user
    subject = '[スマートモチベーター] パスコード発行の手続き'
    mail(to: @user.email, subject: subject)
  end
end
