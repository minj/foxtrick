#!/bin/bash
echo 'update crowdin'

set -e
DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || logf "==============ERROR=========== include.sh"
. "$DIR"/cron-config.sh || logf "==============ERROR=========== cron-config.sh"

unset GIT_DIR GIT_WORK_TREE

cd "$DIR/../l10" || logf "Cannot cd to l10n"
git stash
git checkout l10n || logf "Cannot checkout l10n"
git pull --rebase origin l10n || logf "Cannot git pull rebase l10n"
cd maintainer || logf "Cannot cd to maintainer"
#./crowdin-upload.sh || echo "Cannot upload external translations"
./crowdin-download.sh || logf "Cannot download external translations"
./commit.locale.sh || logf "Cannot commit locale"
git push origin l10n || logf "Cannot push l10n"

cd "$DIR/../$BETA" || logf "Cannot cd to $BETA"
git stash
git checkout master || logf "Cannot checkout master"
git pull --rebase origin master || logf "Cannot git pull rebase master"
git merge --no-ff --no-edit l10n || logf "Cannot merge l10n"
git push origin master || logf "Cannot push l10n merge"

log "Success crowdin update."
