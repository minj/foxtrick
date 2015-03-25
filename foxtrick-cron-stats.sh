#!/bin/bash
echo 'update stats'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)
cd "$DIR/stats" || log "Cannot cd to stats"

./stats.sh || log "Cannot upload stats"
cd ..
log "Success stats update."
