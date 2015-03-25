#!/bin/bash
echo 'upload nightly'

## setup:
# mkdir build-root
# cd build-root
# mkdir trunk
# cd trunk
# git svn init https://foxtrick.googlecode.com/svn/trunk
# git svn fetch -rHEAD
## follow same steps for other branches and build
## copy critical files to $branch/maintainer

## config git
# git config --global user.email foxtrickdev@gmail.com
# git config --global user.name foxtrickdev

## run:
# ./foxtrick-cron.sh >verbatim 2>>error
## verbatim is whole output
## error is error log
## ideally it should be added to crontab (needs full paths to files):
## edit:
# crontab -e
## list:
# crontab -l

DIR=$(cd $(dirname $0); pwd)
. "$DIR"/include.sh || (echo "==============ERROR=========== include.sh" && exit -1)
. "$DIR"/cron-config.sh || (echo "==============ERROR=========== cron-config.sh" && exit -1)
cd "$DIR/../$NIGHTLY" || log "Cannot cd to $NIGHTLY"

git stash
git pull --rebase || log "Cannot git pull rebase"
cd maintainer || log "Cannot cd to maintainer"
#./crowdin-upload.sh || echo "Cannot upload external translations"
#./crowdin-download.sh || echo "Cannot download external translations"
#./commit.locale.sh || echo "Cannot commit locale"
./upload-nightly.sh XAR=/usr/local/bin/xar || log "Cannot upload nightly"

log "Success nightly upload."
