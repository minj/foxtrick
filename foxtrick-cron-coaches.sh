#!/bin/bash
echo 'update coaches'

set -e

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || logf "==============ERROR=========== include.sh"

unset GIT_DIR GIT_WORK_TREE

cd "$DIR/../cdn" || logf "Cannot cd to cdn"

git stash
python "$DIR/../master/maintainer/locale/updateCoaches.py" ./res/staff || logf "Cannot build"
git commit -am updateCoaches.py || true
git push origin cdn || logf "Cannot push cdn to origin"

log 'success update coaches'
