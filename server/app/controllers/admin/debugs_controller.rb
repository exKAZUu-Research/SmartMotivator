class Admin::DebugsController < Admin::BaseController
  def show
    @active = :show

    @text = request.headers.to_h
      .select { |k, v| /^[A-Z_]+$/ =~ k }
      .sort
      .map { |k, v| "#{k}: #{v}" }
      .join("\n")
    render :pre_text
  end

  def mail
    @active = :mail
    render
  end

  def send_mail
    mail = params['mail'].permit(:to, :subject, :body)
    SimpleMailer.build(mail).deliver_now
    redirect_to admin_mail_path
  end

  def report
    @active = :report
    @text = ScheduledJob.report_to_slack(now: Time.current, notify: false)
    render :pre_text
  end
end
