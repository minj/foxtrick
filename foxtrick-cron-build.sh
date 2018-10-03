#!/bin/bash
echo 'update build scripts'

set -e

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (log "==============ERROR=========== include.sh" && false)
. "$DIR"/cron-config.sh || (log "==============ERROR=========== cron-config.sh" && false)
cd "$DIR" || (log "Cannot cd to $DIR" && false)

git stash
git pull --rebase || (log "Cannot git pull rebase" && false)
log "Success build script update."
