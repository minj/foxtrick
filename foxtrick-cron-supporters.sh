#!/bin/bash
echo 'update supporters'

set -e

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || logf "==============ERROR=========== include.sh"
. "$DIR"/cron-config.sh || logf "==============ERROR=========== cron-config.sh"

unset GIT_DIR GIT_WORK_TREE

cd "$DIR/../$NIGHTLY" || logf "Cannot cd to $NIGHTLY"

git stash
git pull --rebase origin master || logf "Cannot git pull rebase $NIGHTLY"

cd "$DIR/../cdn" || logf "Cannot cd to cdn"

git stash
git pull --rebase origin cdn || logf "Cannot git pull rebase cdn"
python "$DIR/../$NIGHTLY/maintainer/locale/updateFTStaff.py" 'res/staff/foxtrick.json' || logf "Cannot update staff"
git commit -am "*automated* supporter update"
git push origin cdn || logf "Cannot push cdn"
log "Success supporter update."
