require 'test_helper'

class AdminPageTest < ActionDispatch::IntegrationTest
  DEBUG_BUTTON_COUNT = 7

  def test_button_0_run_daily
    button_index = 0

    visit '/admin/code'
    buttons = page.all('main button')
    assert_equal DEBUG_BUTTON_COUNT, buttons.length

    stdout = silent { buttons[button_index].click }
    assert_match 'run_daily_jobs', stdout
  end

  def test_button_1_run_weekly
    button_index = 1

    visit '/admin/code'
    buttons = page.all('main button')
    assert_equal DEBUG_BUTTON_COUNT, buttons.length

    stdout = silent { buttons[button_index].click }
    assert_match 'run_weekly_jobs', stdout
  end

  def test_button_2_clear_study_history_cache
    button_index = 2

    u = User.create!(id: SecureRandom.uuid, course: User::COURSE_ENGLISH, ready: true)
    assert_equal 0, StudyHistory.where(cached: true).count
    StudyStatsService.call(u.id, u.course, Calendar.start_of_week(Date.today))
    assert_equal 1, StudyHistory.where(cached: true).count

    visit '/admin/code'
    buttons = page.all('main button')
    assert_equal DEBUG_BUTTON_COUNT, buttons.length

    silent { buttons[button_index].click }
    assert_equal 0, StudyHistory.where(cached: true).count
  end

  def test_button_3_create_dummy
    button_index = 3

    assert_equal 0, User.count
    visit '/admin/code'
    buttons = page.all('main button')
    assert_equal DEBUG_BUTTON_COUNT, buttons.length

    silent { buttons[button_index].click }
    assert_equal 100, User.count
  end

  private

  def silent
    stdout = $stdout
    $stdout = StringIO.new("w")
    yield
    return $stdout.string
  ensure
    $stdout = stdout
  end
end
