#!/bin/bash
echo 'update build scripts'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)
cd "$DIR" || log "Cannot cd to $DIR"

git stash
git svn rebase || log "Cannot git-svn rebase"
log "Success build script update."
