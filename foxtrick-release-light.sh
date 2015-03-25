#!/bin/bash
echo 'upload release light'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)
cd "$DIR/../$RELEASE" || log "Cannot cd to $RELEASE"

git stash
git pull --rebase || log "Cannot git pull rebase"
./version.sh 0.14.0.3
./version.sh
cd maintainer || log "Cannot cd to maintainer"
#./crowdin-upload.sh || echo "Cannot upload external translations"
#./crowdin-download.sh || echo "Cannot download external translations"
#./commit.locale.sh || echo "Cannot commit locale"
echo "--- foxtrick.org release---"
./upload-nightly.sh -c upload.light.conf.sh BRANCH=light XAR=/usr/local/bin/xar || log "Cannot upload light"
#echo "--- ixweb release ---"
#./upload-nightly.sh -c upload.ixweb.light.conf.sh BRANCH=light XAR=/usr/local/bin/xar || log "Cannot upload nightly"
#echo "--- ixweb hosting ---"
#./upload-nightly.sh -c upload.ixweb.hosting.conf.sh XAR=/usr/local/bin/xar || log "Cannot upload nightly"
cd ..
git stash
log "Success light upload."
