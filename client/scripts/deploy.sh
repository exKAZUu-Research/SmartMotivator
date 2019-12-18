#!/bin/bash

set -Ceu

# Edit.
target_binary_version=""
description=""

no_dry_run() {
  dryrun=""
}

android() {
  platform="android"
  app_name="WillingQuiz-Android"
}

ios() {
  platform="ios"
  app_name="WillingQuiz-iOS"
}

alpha() {
  deployment="Mission"
}

staging() {
  deployment="Staging"
}

production() {
  deployment="Production"
}

upload() {
  param=""
  if [ -n "$target_binary_version" ]; then
    param="$param --targetBinaryVersion "$target_binary_version""
  fi
  if [ -n "$description" ]; then
    param="$param --description "$description""
  fi
  _yarn
  _code_push release-react "$app_name" "$platform" -d "$deployment" -x -m $param
}

confirm() {
  _code_push deployment history "$app_name" "$deployment"
}

release() {
  _code_push patch "$app_name" "$deployment" --disabled false
}

keys() {
  _code_push deployment list -k "$app_name"
}

_yarn() {
  if [ -z "${yarned+x}" ]; then
    yarned="1"
    if [ -n "$dryrun" ]; then
      echo yarn
    else
      (set -x; yarn)
    fi
  fi
}

_code_push() {
  if [ -n "$dryrun" ]; then
    echo code-push "$@"
  else
    (set -x; code-push "$@")
  fi
}

unknown_command() {
  printf 'Unknown command `%s`' "$1" 1>&2
  exit 1
}

# Don't edit.
dryrun="true"
deployment="Staging"

cd "$(dirname "$0")/.."

for arg in "$@"
do
  case "$arg" in
    "-f" | "--force" ) no_dry_run ;;
    "android" | "ios" | "alpha" | "staging" | "production" | "upload" | "release" | "confirm" | "keys" ) "$arg" ;;
    * ) unknown_command "$arg" ;;
  esac
done
