#!/bin/bash
echo 'update translations'

set -e

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || logf "==============ERROR=========== include.sh"

unset GIT_DIR GIT_WORK_TREE
TARGET_REPO=l10n

cd "$DIR/../$TARGET_REPO" || logf "Cannot cd to $TARGET_REPO"

git stash
python "$DIR/../master/maintainer/locale/getTranslations.py" . || logf "Cannot build"
git commit -am getTranslations.py || true
git push origin $TARGET_REPO || logf "Cannot push $TARGET_REPO to origin"

log 'success update translations'
