#!/bin/bash
echo 'update crowdin'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)
cd "$DIR/../$BETA" || log "Cannot cd to $BETA"

git stash
git checkout master || log "Cannot checkout master"
git pull --rebase origin master || log "Cannot git pull rebase master"
git checkout l10n || log "Cannot checkout l10n"
git pull --rebase origin l10n || log "Cannot git pull rebase l10n"
cd maintainer || log "Cannot cd to maintainer"
#./crowdin-upload.sh || echo "Cannot upload external translations"
./crowdin-download.sh || log "Cannot download external translations"
./commit.locale.sh || log "Cannot commit locale"
git push origin l10n || log "Cannot push l10n"
git checkout master || log "Cannot checkout master"
git merge --no-ff --no-edit l10n || log "Cannot merge l10n"
git push origin master || log "Cannot push l10n merge"

log "Success crowdin update."
