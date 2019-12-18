#!/bin/bash

if [[ -n "$RELEASE_URL"  ]]; then
    version=$(cd "`dirname $0`/../client" && node -pe "require('./package.json').version")
    if [[ "staging" == $WERCKER_GIT_BRANCH ]] || [[ "staging" == $(git rev-parse --abbrev-ref HEAD) ]]; then
        curl --data "We've released a new version (v$version) of the client and server ($RELEASE_URL) programs [`date`]." $SLACK_URL
    else
        curl --data "We've released a new version (v$version) of the server ($RELEASE_URL) program [`date`]." $SLACK_URL
    fi
fi
