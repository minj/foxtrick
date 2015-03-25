#!/bin/bash
echo 'update crowdin'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)
cd "$DIR/../$BETA" || log "Cannot cd to $BETA"

git stash
git svn rebase || log "Cannot git-svn rebase"
cd maintainer || log "Cannot cd to maintainer"
#./crowdin-upload.sh || echo "Cannot upload external translations"
./crowdin-download.sh || echo "Cannot download external translations"
./commit.locale.sh || echo "Cannot commit locale"
cd ../..
echo "Success crowdin update."
cd $NIGHTLY || log "Cannot cd to $NIGHTLY"
git stash
git svn rebase || log "Cannot git-svn rebase"
cd maintainer || log "Cannot cd to maintainer"
cd ..
#git stash apply
log "Success crowdin update."
