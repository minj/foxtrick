#!/bin/bash
DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)

ago=$(date -d '2 days ago' +'%y%m%d')
tomorrow=$(date -d 'tomorrow' +'%y%m%d')

cd "$DIR" || log "Cannot cd to $DIR"

branch=$(git-branch)

git stash
git fetch --prune origin "+refs/tags/*:refs/tags/*" || log "Cannot update tags"
git fetch origin || log "Cannot fetch origin"
git checkout cdn || log "Cannot checkout cdn"
git reset --hard origin/cdn || (git checkout "$branch" && log "Cannot reset to origin/cdn")
git checkout "$branch" || log "Cannot checkout $branch"
git tag cdn/$tomorrow cdn || log "Cannot create cdn/$tomorrow"
git tag --delete cdn/$ago || log "Cannot delete cdn/$ago"
git push --tags origin :cdn/$ago || log "Cannot push tags to origin"
