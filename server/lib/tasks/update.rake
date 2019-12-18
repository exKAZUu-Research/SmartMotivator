task update_studies_genre: :environment do
  require 'json'

  cnt = 0
  Dir.chdir(Rails.root + 'config/quiz') do
    Dir.glob('*') do |dir|
      next unless File.directory?(dir)
      course = dir
      Dir.chdir(dir) do
        Dir.glob('*.json') do |f|
          genre = File.basename(f, '.*')
          keys = JSON.parse(File.read(f))
          cnt += Study
            .where(course: course, quiz_key: keys)
            .where.not(genre: genre)
            .update_all(genre: genre)
        end
      end
    end
  end
  puts "#{cnt} data updated."
end

task migrate_school_email: :environment do
  count = 0
  School.transaction do
    School.find_each do |school|
      next unless domain = school.email_domain.presence
      count += User
        .where(school_id: nil)
        .where.not(email: nil)
        .where("email LIKE ('%' || ?)", domain)
        .update_all(school_id: school.id)
    end
  end
  puts "#{count} users are updated"
end

task initialize_mission_info: :environment do
  start_time = Time.now
  success = 0
  skip = 0
  update_list = []

  yesterday = Date.yesterday.iso8601
  puts "There are #{User.count} users."
  User.find_each do |user|
    mission_goals = API::MissionsController::MISSION_GOALS[user.course]
    unless mission_goals
      skip += 1
      next
    end
    counts = MissionService.initial_counts(mission_goals)
    UserData.where(user_id: user.id, kind: UserData::KIND_QUIZ).find_each do |ud|
      next if ud.value['course'] != user.course
      MissionService.update_counts(counts, mission_goals, ud.value['answers'])
    end

    counts['memorized'] = Study.where(user_id: user.id).memorized.count

    last_reset_at = user.mission.fetch('lastResetAt', yesterday)
    missions = user.mission.fetch('missions', [])
    mission = {
      'counts' => counts,
      'lastResetAt' => last_reset_at,
      'missions' => missions,
    }
    update_list << [user.id, point, mission]
    print '.'
  end
  read_end = Time.now
  # readとwriteは分けたほうが速かった
  User.transaction do
    update_list.each do |(user_id, point, mission)|
      success += User.where(id: user_id).update_all(point: point, mission: mission)
    end
  end
  puts
  puts "Initialized: success: %d, skip: %d, read time: %.2f, write time: %.2f" % [
    success,
    skip,
    read_end - start_time,
    Time.now - read_end,
  ]
end
