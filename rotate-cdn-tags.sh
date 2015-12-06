#!/bin/bash
echo 'rotate cdn tags'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)

ago=$(date -d '1 days ago' -u +'%y%m%d')
tomorrow=$(date -d 'tomorrow' -u +'%y%m%d')

cd "$DIR/../cdn" || log "Cannot cd to cdn"

git stash
git fetch --prune origin "+refs/tags/*:refs/tags/*" || log "Cannot update tags"
git pull --rebase || log "Cannot pull rebase"
git tag res/$tomorrow cdn || log "Cannot create res/$tomorrow"
git tag --delete res/$ago || log "Cannot delete res/$ago"
git push --tags origin cdn :res/$ago || log "Cannot push tags to origin"

log 'success rotate cdn tags'
