#!/bin/bash
echo 'upload ixweb nightly'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)
cd "$DIR/../$NIGHTLY" || log "Cannot cd to $NIGHTLY"

git stash
git pull --rebase || log "Cannot git pull rebase"
cd maintainer || log "Cannot cd to maintainer"
./upload-nightly.sh -c upload.ixweb.conf.sh XAR=/usr/local/bin/xar || log "Cannot upload nightly to ixweb"
cd ..

log "Success ixweb nightly upload."
