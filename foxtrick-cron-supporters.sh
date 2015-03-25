#!/bin/bash
echo 'update supporters'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)
cd "$DIR/../$BETA" || log "Cannot cd to $BETA"

git stash
git svn rebase || log "Cannot git-svn rebase"
cd maintainer/locale || log "Cannot cd to maintainer/locale"
python updateFTStaff.py
git commit -a -m "*automated* supporter update"
git svn dcommit
log "Success supporter update."
