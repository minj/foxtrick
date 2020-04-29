#!/bin/bash
echo 'update coaches'

set -e

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || logf "==============ERROR=========== include.sh"

unset GIT_DIR GIT_WORK_TREE
TARGET_REPO=cdn

cd "$DIR/../$TARGET_REPO" || logf "Cannot cd to $TARGET_REPO"

git stash
python "$DIR/../master/maintainer/locale/updateCoaches.py" ./res/staff || logf "Cannot build"
git commit -am updateCoaches.py || true
git push origin $TARGET_REPO || logf "Cannot push $TARGET_REPO to origin"

log 'success update coaches'
