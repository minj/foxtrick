#!/bin/bash
echo 'update supporters'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)
cd "$DIR/../cdn" || log "Cannot cd to cdn"

git stash
git pull --rebase || log "Cannot git pull rebase"
python "$DIR/../$NIGHTLY/maintainer/locale/updateFTStaff.py" 'res/staff/foxtrick.json' || log "Cannot update staff"
git commit -a -m "*automated* supporter update"
git push origin cdn || log "Cannot push cdn"
log "Success supporter update."
