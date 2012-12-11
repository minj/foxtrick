#!/bin/bash

DIR=$(cd $(dirname $0); pwd)
echo $DIR
LOG_FILE="${DIR}/foxtrick-cron.log"
ERROR_FILE="${DIR}/error"
VERBATIM_FILE="${DIR}/verbatim"

function log {
	echo "[`date`] $1" >> $LOG_FILE
	echo "################ [`date`] $1 ###############" >> $ERROR_FILE
	echo "################ [`date`] $1 ###############" >> $VERBATIM_FILE
	exit 1
}

LANG=en_US.utf-8
LC_ALL=en_US.utf-8

. ~/.bashrc
. cron-config.sh

cd $BETA || log "Cannot cd to $BETA"
git stash
git svn rebase || log "Cannot git-svn rebase"
cd maintainer || log "Cannot cd to maintainer"
#./crowdin-upload.sh || echo "Cannot upload external translations"
#./crowdin-download.sh || echo "Cannot download external translations"
#./commit.locale.sh || echo "Cannot commit locale"
./upload-nightly.sh -c upload.beta.conf.sh BRANCH=beta XAR=/usr/local/bin/xar || log "Cannot upload beta"
cd ..
#git stash apply
log "Success beta upload."
