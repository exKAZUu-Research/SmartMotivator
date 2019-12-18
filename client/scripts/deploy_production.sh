#!/bin/bash

set -x

script_dir=$(cd $(dirname ${BASH_SOURCE:-$0}); pwd)
cd $script_dir

bash deploy.sh --force production ios upload android upload
bash deploy.sh --force production ios release android release
