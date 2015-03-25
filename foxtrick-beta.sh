#!/bin/bash
echo 'upload beta'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)
cd "$DIR/../$BETA" || log "Cannot cd to $BETA"

git stash
git svn rebase || log "Cannot git-svn rebase"
cd maintainer || log "Cannot cd to maintainer"
#./crowdin-upload.sh || echo "Cannot upload external translations"
#./crowdin-download.sh || echo "Cannot download external translations"
#./commit.locale.sh || echo "Cannot commit locale"
./upload-nightly.sh -c upload.beta.conf.sh WEBSTORE=true BRANCH=beta XAR=/usr/local/bin/xar || log "Cannot upload beta"

log "Success beta upload."
