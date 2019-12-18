#!/bin/bash

set -x

script_dir=$(cd $(dirname ${BASH_SOURCE:-$0}); pwd)
cd $script_dir/..

yarn
code-push release-react WillingQuiz-Android android -d Staging -m --targetBinaryVersion '*'
code-push release-react WillingQuiz-iOS     ios     -d Staging -m --targetBinaryVersion '*'
true
