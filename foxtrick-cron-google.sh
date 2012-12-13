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

echo 'upload to google'
cd $RELEASE || log "Cannot cd to $RELEASE"
cd maintainer
./upload-google.sh || log "Cannot upload release to google"
cd ..
log "Success google release upload."
