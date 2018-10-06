#!/bin/bash
echo 'update build scripts'

set -e

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || logf "==============ERROR=========== include.sh"
. "$DIR"/cron-config.sh || logf "==============ERROR=========== cron-config.sh"

cd "$DIR" || logf "Cannot cd to $DIR"

git stash
git pull --rebase || logf "Cannot git pull rebase"
log "Success build script update."
