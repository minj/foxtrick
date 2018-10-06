#!/bin/bash
echo 'rotate cdn tags'

set -e

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || logf "==============ERROR=========== include.sh"

ago=$(date -d '1 days ago' -u +'%y%m%d')
tomorrow=$(date -d 'tomorrow' -u +'%y%m%d')

unset GIT_DIR GIT_WORK_TREE

cd "$DIR/../cdn" || logf "Cannot cd to cdn"

git stash
git fetch --prune origin "+refs/tags/*:refs/tags/*" || logf "Cannot update tags"
git pull --rebase || logf "Cannot pull rebase"
git tag res/$tomorrow cdn || logf "Cannot create res/$tomorrow"
git tag --delete res/$ago || logf "Cannot delete res/$ago"
git push --tags origin cdn :res/$ago || logf "Cannot push tags to origin"

log 'success rotate cdn tags'
