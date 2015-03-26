#!/bin/bash
echo 'update supporters'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)
cd "$DIR/../cdn" || log "Cannot cd to cdn"

git stash
git pull --rebase || log "Cannot git pull rebase"
cd maintainer/locale || log "Cannot cd to maintainer/locale"
python updateFTStaff.py || log "Cannot update staff"
git commit -a -m "*automated* supporter update"
git push origin cdn || log "Cannot push cdn"
log "Success supporter update."
