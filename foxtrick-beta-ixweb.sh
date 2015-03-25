#!/bin/bash
echo 'upload ixweb beta'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)
cd "$DIR/../$BETA" || log "Cannot cd to $BETA"

git stash
git svn rebase || log "Cannot git-svn rebase"
cd maintainer || log "Cannot cd to maintainer"
./upload-nightly.sh -c upload.ixweb.beta.conf.sh BRANCH=beta XAR=/usr/local/bin/xar || log "Cannot upload beta to ixweb"
cd ..
#git stash apply
log "Success ixweb beta upload."
