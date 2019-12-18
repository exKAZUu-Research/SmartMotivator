class SimpleMailer < ApplicationMailer
  def build(hash)
    mail(to: hash['to'], subject: hash['subject'], body: hash['body'])
  end
end
