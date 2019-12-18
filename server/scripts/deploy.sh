#!/bin/bash

set -x

export RAILS_ENV=production
export RAILS_SERVE_STATIC_FILES=true

TIME_STAMP=`date "+%Y%m%d_%H%M%S"`
NUM_KEEPING_FILES=10
WQ_PATH=~/WillingQuiz

# Install recommendation scripts' dependencies in the background
bash $WQ_PATH/repo/server/scripts/recommendation/install.sh &

# Backup DB
(cd && rbenv local 2.3.4 && backup perform --trigger pg_backup) &

# Create a new directory
cp -R $WQ_PATH/repo $WQ_PATH/$TIME_STAMP

# Update ruby-build
cd ~/.rbenv/plugins/ruby-build
git pull
cd $WQ_PATH/$TIME_STAMP/server

# Update Ruby and gems
yes N | rbenv install && rbenv rehash
gem install bundler
bundle install --without development test

# Precompile assets
bundle exec rails assets:precompile

# Remove old directories
COUNT=0

for FILE in `ls -r $WQ_PATH/`; do
  if [ $COUNT -ge $NUM_KEEPING_FILES ]; then
    rm -Rf $WQ_PATH/$FILE
  fi
  COUNT=`expr $COUNT + 1`
done

# Wait all background jobs
wait

# Stop Rails server
cd $WQ_PATH/current/server
bundle exec pumactl stop
bundle exec whenever --clear-crontab

# Update symbolic link
rm $WQ_PATH/current
ln -s $WQ_PATH/$TIME_STAMP $WQ_PATH/current

# Setup Rails server in the background
cd $WQ_PATH/current/server
bundle exec whenever --update-crontab
bundle exec rails db:migrate
bundle exec rails db:seed

# Start Rails server
SECRET_KEY_BASE=$(bundle exec rake secret) bundle exec puma -d -e production -w $(cat /proc/cpuinfo | grep processor | wc -l)
