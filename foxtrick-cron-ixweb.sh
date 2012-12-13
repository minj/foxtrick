#!/bin/bash

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
./upload-nightly.sh -c upload.ixweb.conf.sh XAR=/usr/local/bin/xar || log "Cannot upload nightly to ixweb"
cd ..
#git stash apply
log "Success ixweb nightly upload."
