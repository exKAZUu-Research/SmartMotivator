#!/bin/bash

git pull
git branch -D update_deps
git checkout -b update_deps

script_dir=$(cd $(dirname ${BASH_SOURCE:-$0}); pwd)

cd $script_dir/../client
npm i
npm update
yarn
yarn upgrade
rm flow-typed/npm/*.js
yarn run flow-typed update
rm flow-typed/npm/*vx.x.x.js
yarn run format

cd $script_dir/../server
bundle update

git add -A
git commit -m "Update dependencies. Reformat code."

cd $script_dir/../client
yarn run bump patch

git push origin update_deps -f
