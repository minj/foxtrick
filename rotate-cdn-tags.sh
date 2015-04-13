#!/bin/bash
echo 'rotate cdn tags'

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)

ago=$(date -d '2 days ago' +'%y%m%d')
tomorrow=$(date -d 'tomorrow' +'%y%m%d')

cd "$DIR/../cdn" || log "Cannot cd to cdn"

git stash
git fetch --prune origin "+refs/tags/*:refs/tags/*" || log "Cannot update tags"
git pull --rebase || log "Cannot pull rebase"
git tag cdn/$tomorrow cdn || log "Cannot create cdn/$tomorrow"
git tag --delete cdn/$ago || log "Cannot delete cdn/$ago"
git push --tags origin cdn :cdn/$ago || log "Cannot push tags to origin"

log 'success rotate cdn tags'