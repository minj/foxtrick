#!/bin/bash

## setup:
# mkdir build-root
# cd build-root
# mkdir trunk
# cd trunk
# git svn init https://foxtrick.googlecode.com/svn/trunk
# git svn fetch -rHEAD
## follow same steps for other branches and build
## copy critical files to $branch/maintainer

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
LOG_FILE="$DIR"/foxtrick-cron.log
ERROR_FILE="$DIR"/error
VERBATIM_FILE="$DIR"/verbatim

function log {
	echo "[`date`] $1" >> $LOG_FILE
	echo "################ [`date`] $1 ###############" >> $ERROR_FILE
	echo "################ [`date`] $1 ###############" >> $VERBATIM_FILE
	exit 1
}

. ~/.bashrc
LANG=en_US.utf-8
LC_ALL=en_US.utf-8

cd "$DIR"
. cron-config.sh
cd ..

cd $NIGHTLY || log "Cannot cd to $NIGHTLY"
git stash
git svn rebase || log "Cannot git-svn rebase"
cd maintainer || log "Cannot cd to maintainer"
#./crowdin-upload.sh || echo "Cannot upload external translations"
#./crowdin-download.sh || echo "Cannot download external translations"
#./commit.locale.sh || echo "Cannot commit locale"
./upload-nightly.sh XAR=/usr/local/bin/xar || log "Cannot upload nightly"
cd ..
#git stash apply
log "Success nightly upload."
