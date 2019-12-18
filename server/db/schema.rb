# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180306062603) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "uuid-ossp"
  enable_extension "pgcrypto"

  create_table "commitments", id: :serial, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.datetime "start_commitment", null: false
    t.datetime "end_commitment", null: false
    t.integer "count_goal", default: 0, null: false
    t.integer "correct_count", default: 0, null: false
    t.integer "total_count", default: 0, null: false
    t.string "course", null: false
  end

  create_table "courses", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "key", null: false
    t.string "label", null: false
    t.boolean "editable", default: false, null: false
    t.index ["key"], name: "index_courses_on_key", unique: true
  end

  create_table "follows", id: :serial, force: :cascade do |t|
    t.uuid "follower_id", null: false
    t.uuid "followee_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["follower_id", "followee_id"], name: "index_follows_on_follower_id_and_followee_id", unique: true
  end

  create_table "genre_completions", force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "course", null: false
    t.string "genre", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "genres", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "key", null: false
    t.string "course_key", null: false
    t.string "label", null: false
    t.integer "ordering", default: 0, null: false
    t.integer "quiz_size", default: 0, null: false
    t.index ["course_key", "key"], name: "index_genres_on_course_key_and_key", unique: true
  end

  create_table "global_settings", id: false, force: :cascade do |t|
    t.string "key", null: false
    t.string "value", null: false
    t.index ["key"], name: "index_global_settings_on_key", unique: true
  end

  create_table "mutes", id: :serial, force: :cascade do |t|
    t.uuid "muter_id", null: false
    t.uuid "mutee_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["muter_id", "mutee_id"], name: "index_mutes_on_muter_id_and_mutee_id", unique: true
  end

  create_table "prediction_models", force: :cascade do |t|
    t.binary "dump_data", null: false
    t.datetime "trained_at"
  end

  create_table "quiz_genres", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "course_key", null: false
    t.string "genre_key", null: false
    t.string "quiz_key", null: false
    t.index ["course_key", "genre_key", "quiz_key"], name: "index_quiz_genres_on_course_key_and_genre_key_and_quiz_key", unique: true
  end

  create_table "quizzes", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "key", null: false
    t.string "course_key", null: false
    t.string "label", null: false
    t.string "sub_label"
    t.string "pre_text"
    t.string "problem", null: false
    t.string "input_type", null: false
    t.string "answers", default: [], null: false, array: true
    t.integer "answer_size", default: 0, null: false
    t.integer "correct_index", default: 0, null: false
    t.boolean "shuffle", default: false, null: false
    t.string "commentary_label"
    t.string "commentary"
    t.integer "default_percentage"
    t.string "font"
    t.jsonb "images", default: {}, null: false
    t.index ["course_key", "key"], name: "index_quizzes_on_course_key_and_key", unique: true
  end

  create_table "schools", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.string "internal_name", null: false
    t.string "prefix", null: false
    t.string "course", default: "", null: false
    t.string "read_password", default: "", null: false
    t.string "write_password", default: "", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "login_id", default: "", null: false
    t.string "login_password", default: "", null: false
    t.string "email_domain"
    t.boolean "is_experiment", default: false, null: false
    t.text "contact_text", default: "", null: false
    t.string "display_name", default: "", null: false
    t.boolean "use_beacon", default: false, null: false
    t.boolean "is_experiment2", default: false, null: false
    t.boolean "quiz_editable", default: false, null: false
  end

  create_table "studies", id: :serial, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "course", null: false
    t.string "quiz_key", null: false
    t.integer "total_count", default: 0, null: false
    t.integer "consecutive_correct_count", default: 0, null: false
    t.datetime "available_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "correct_count", default: 0, null: false
    t.string "genre", null: false
    t.integer "leitner_box", default: 0, null: false
    t.boolean "memorized", default: false, null: false
    t.index ["user_id", "course", "genre", "quiz_key"], name: "index_studies_on_user_id_and_course_and_genre_and_quiz_key", unique: true
  end

  create_table "study_histories", id: :serial, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.date "week_start", null: false
    t.float "rate_goal"
    t.integer "count_goal"
    t.integer "correct_count", default: 0, null: false
    t.integer "total_count", default: 0, null: false
    t.boolean "cached", default: false, null: false
    t.integer "cache_rate_rank", default: 0, null: false
    t.integer "cache_count_rank", default: 0, null: false
    t.integer "spent_time_goal"
    t.integer "total_spent_time", default: 0, null: false
    t.integer "cahce_spent_time_rank", default: 0, null: false
    t.string "course", null: false
    t.integer "memorized_word_goal"
    t.integer "memorized_word", default: 0, null: false
    t.integer "cache_memorized_word_rank", default: 0, null: false
    t.index ["course", "user_id", "week_start"], name: "index_study_histories_on_course_and_user_id_and_week_start", unique: true
    t.index ["week_start"], name: "index_study_histories_on_week_start"
  end

  create_table "teachers", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.string "name", null: false
    t.uuid "school_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "user_data", id: :serial, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "kind", null: false
    t.jsonb "value", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "time", null: false
    t.index ["kind", "user_id"], name: "index_user_data_on_kind_and_user_id"
  end

  create_table "users", id: :uuid, default: -> { "uuid_generate_v4()" }, force: :cascade do |t|
    t.jsonb "setting", default: {}, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name", default: "", null: false
    t.datetime "last_access"
    t.string "client_version", default: "", null: false
    t.datetime "survey_started_at"
    t.datetime "survey_resumed_at"
    t.datetime "survey_finished_at"
    t.boolean "ready", default: false, null: false
    t.string "course", default: "", null: false
    t.string "email"
    t.string "passcode"
    t.datetime "passcode_expire"
    t.jsonb "pseudo_room", default: {}, null: false
    t.uuid "school_id"
    t.uuid "teacher_id"
    t.string "login_id"
    t.string "password"
    t.string "role", default: "", null: false
    t.string "icon", default: "", null: false
    t.string "color", default: "", null: false
    t.string "ip_address", default: "", null: false
    t.string "introduction", default: "", null: false
    t.string "experiment_mode"
    t.bigint "point", default: 0, null: false
    t.jsonb "mission", default: {}, null: false
    t.index ["login_id"], name: "index_users_on_login_id", unique: true
  end


  create_view "study_summaries",  sql_definition: <<-SQL
      SELECT u.id AS user_id,
      COALESCE(sum(s.correct_count), (0)::bigint) AS correct_count,
      COALESCE(sum(s.total_count), (0)::bigint) AS total_count,
      COALESCE(sum(s.total_spent_time), (0)::bigint) AS total_spent_time,
      COALESCE(sum(s.memorized_word), (0)::bigint) AS memorized_word
     FROM (users u
       LEFT JOIN study_histories s ON (((u.id = s.user_id) AND ((u.course)::text = (s.course)::text))))
    GROUP BY u.id;
  SQL

end
