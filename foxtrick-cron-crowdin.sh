#!/bin/bash
echo 'update crowdin'

set -e
DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || logf "==============ERROR=========== include.sh"
. "$DIR"/cron-config.sh || logf "==============ERROR=========== cron-config.sh"

unset GIT_DIR GIT_WORK_TREE
TARGET_REPO=l10n

cd "$DIR/../$TARGET_REPO" || logf "Cannot cd to $TARGET_REPO"
git stash
git checkout $TARGET_REPO || logf "Cannot checkout $TARGET_REPO"
git pull --rebase origin $TARGET_REPO || logf "Cannot git pull rebase $TARGET_REPO"
cd maintainer || logf "Cannot cd to maintainer"
#./crowdin-upload.sh || echo "Cannot upload external translations"
./crowdin-download.sh || logf "Cannot download external translations"
./commit.locale.sh || logf "Cannot commit locale"
git push origin $TARGET_REPO || logf "Cannot push $TARGET_REPO"

cd "$DIR/../$BETA" || logf "Cannot cd to $BETA"
git stash
git checkout master || logf "Cannot checkout master"
git fetch --all || logf "Cannot fetch"
git rebase origin/master || logf "Cannot rebase master"
git merge --no-ff --no-edit origin/$TARGET_REPO || logf "Cannot merge origin/$TARGET_REPO"
git push origin master || logf "Cannot push $TARGET_REPO merge"

log "Success crowdin update."
