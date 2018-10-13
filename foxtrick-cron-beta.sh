#!/bin/bash
echo 'upload beta'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)

unset GIT_DIR GIT_WORK_TREE
cd "$DIR/../$BETA" || logf "Cannot cd to $BETA"

git stash
git checkout master || logf "Cannot checkout master"
git pull --rebase || logf "Cannot git pull rebase"
cd maintainer || logf "Cannot cd to maintainer"
#./crowdin-upload.sh || echo "Cannot upload external translations"
#./crowdin-download.sh || echo "Cannot download external translations"
#./commit.locale.sh || echo "Cannot commit locale"
./upload-nightly.sh -c upload.beta.conf.sh BRANCH=beta XAR=/usr/local/bin/xar || logf "Cannot upload beta"

log "Success beta upload."
