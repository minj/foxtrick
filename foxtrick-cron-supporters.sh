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

echo 'update crowdin'
cd $BETA || log "Cannot cd to $BETA"
git stash
git svn rebase || log "Cannot git-svn rebase"
cd maintainer/locale || log "Cannot cd to maintainer/locale"
python updateFTStaff.py
git commit -a -m "*automated* supporter update"
git svn dcommit
log "Success supporter update."
