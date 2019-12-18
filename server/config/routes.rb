Rails.application.routes.draw do

  root to: 'application#index'

  scope module: :api, constraints: ->(req) { req.format.json? } do
    get 'status', to: 'application#status'

    get   'users/:id/recommended_setting', to: 'users#show_recommended_setting'
    get   'users/:id/following',           to: 'users#show_following'
    get   'users/:id/search',              to: 'users#search_user'
    get   'users/:id/user_details',        to: 'users#show_user_details'
    put   'users/:id/toggle_follow',       to: 'users#toggle_follow'
    put   'users/:id/toggle_mute',         to: 'users#toggle_mute'
    post  'users',                         to: 'users#create'
    get   'users/:id',                     to: 'users#show', as: 'user'
    patch 'users/:id',                     to: 'users#update'
    put   'users/:id',                     to: 'users#update'

    get  'mission',              to: 'missions#show'
    get  'mission/ranking',      to: 'missions#ranking'
    get  'mission/self_ranking', to: 'missions#self_ranking'
    post 'mission',              to: 'missions#create'

    get  'user_data/:kind', to: 'user_data#index'
    post 'user_data',       to: 'user_data#create'

    get  'study_histories',        to: 'study_histories#show'
    post 'study_histories',        to: 'study_histories#create'

    get    'new_quizzes/progress',                 to: 'new_quizzes#progress'
    delete 'new_quizzes/progress',                 to: 'new_quizzes#delete_progress'
    get    'new_quizzes/courses',                  to: 'new_quizzes#courses'
    get    'new_quizzes/:course/:genre',           to: 'new_quizzes#list'
    post   'new_quizzes/:course/:genre/start',     to: 'new_quizzes#start'
    post   'new_quizzes/start_pretest',            to: 'new_quizzes#start_pretest'
    get    'new_quizzes/:course/:genre/memorized', to: 'new_quizzes#memorized'
    post 'quizzes/:course/:genre',    to: 'quizzes#create'

    get 'schools/:id', to: 'schools#show'
  end

  scope :admin, module: :admin, as: :admin do
    scope controller: 'root' do
      get_ '/', action: 'show'
      post '/', action: 'create'
      get_ :code
      post 'code', action: :run_code
    end

    resource :debug, only: :show do
      get :mail
      post 'mail', action: 'send_mail'
      get :report
    end

    resources :courses do
      member do
        get '(/:genre_key)/quizzes', action: 'quizzes', as: 'quizzes'
        get  'file', action: 'download_quiz'
        post 'file', action: 'update_quiz'
      end
    end

    resources :users, only: %w(index show edit update destroy) do
      member do
        get :study_histories
        get 'user_data(/:kind)', action: :user_data, as: :user_data
        get 'studies(/:course/:genre)', action: :studies, as: :studies
        get :download_studies
        get :toggle_developer_role

        get :edit_auth
      end
    end

    resource :prediction_models, only: %w(show create) do
      member do
        post :reset
        get :check_availability
      end
    end

    resources :rooms, only: :index
    resource :quizzes
    resource :reports
    resources :schools
    resource :global_settings, only: %w(show create)
  end

  scope '/schools/:school_id', module: :schools, as: :school do
    get '/', to: 'root#show'
    get  '/edit', to: 'root#edit'
    post '/edit', to: 'root#update'

    resources :users do
      collection do
        get :download_csv
        get :published
        get  :import
        post :import, action: :import!
      end
    end
    resources :teachers, only: %w(index new create edit update destroy)
    resources :quizzes, only: %w(index show create)
    resource :session, only: %w(new create destroy)
  end
end
