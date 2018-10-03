#!/bin/bash
echo 'rotate cdn tags'

set -e

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (log "==============ERROR=========== include.sh" && false)

ago=$(date -d '1 days ago' -u +'%y%m%d')
tomorrow=$(date -d 'tomorrow' -u +'%y%m%d')

cd "$DIR/../cdn" || (log "Cannot cd to cdn" && false)

unset GIT_DIR GIT_WORK_TREE

git stash
git fetch --prune origin "+refs/tags/*:refs/tags/*" || (log "Cannot update tags" && false)
git pull --rebase || (log "Cannot pull rebase" && false)
git tag res/$tomorrow cdn || (log "Cannot create res/$tomorrow" && false)
git tag --delete res/$ago || (log "Cannot delete res/$ago" && false)
git push --tags origin cdn :res/$ago || (log "Cannot push tags to origin" && false)

log 'success rotate cdn tags'
