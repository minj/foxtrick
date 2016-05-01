#!/bin/bash
echo 'update crowdin'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)
cd "$DIR/../$BETA" || log "Cannot cd to $BETA"

git stash
git checkout l10n || log "Cannot checkout l10n"
git pull --rebase || log "Cannot git pull rebase"
cd maintainer || log "Cannot cd to maintainer"
#./crowdin-upload.sh || echo "Cannot upload external translations"
./crowdin-download.sh || echo "Cannot download external translations"
./commit.locale.sh || echo "Cannot commit locale"
git checkout master || log "Cannot checkout master"
git merge --no-ff l10n || log "Cannot merge l10n"
git push origin master || log "Cannot push l10n merge"

log "Success crowdin update."
