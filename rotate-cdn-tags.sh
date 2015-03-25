#!/bin/bash
DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh

ago=$(date -d '2 days ago' +'%y%m%d')
tomorrow=$(date -d 'tomorrow' +'%y%m%d')

cd "$DIR" || log "Cannot cd to $DIR"
git tag cdn/$tomorrow cdn || log "Cannot create cdn/$tomorrow"
git tag --delete cdn/$ago || log "Cannot delete cdn/$ago"
git push --tags origin :cdn/$ago || log "Cannot push tags to origin"
