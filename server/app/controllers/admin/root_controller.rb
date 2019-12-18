class Admin::RootController < Admin::BaseController
  def show
    json = JSON.parse(File.read(Rails.root + '../client/package.json')) rescue {}
    @version = json['version']
    render
  end

  def code
    render
  end

  def run_code(code)
    begin
      ActiveRecord::Base.transaction do
        flash[:notice] = eval(code)
      end
    rescue Exception => e
      return render plain: e.message, status: 500
    end

    redirect_to admin_code_path
  end
end
