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

LANG=en_US.utf-8
LC_ALL=en_US.utf-8

. ~/.bashrc
cd "$DIR"
. cron-config.sh

cd $RELEASE || log "Cannot cd to $RELEASE"
git stash
git svn rebase || log "Cannot git-svn rebase"
./version.sh 0.11.0
./version.sh
cd maintainer || log "Cannot cd to maintainer"
#./crowdin-upload.sh || echo "Cannot upload external translations"
#./crowdin-download.sh || echo "Cannot download external translations"
#./commit.locale.sh || echo "Cannot commit locale"
echo "--- foxtrick.org release---"
./upload-nightly.sh -c upload.light.conf.sh BRANCH=light XAR=/usr/local/bin/xar || log "Cannot upload light"
#echo "--- google release---"
#./upload-nightly-google.sh -c upload.ixweb.release.conf.sh || log "Cannot upload to googlecode" 
echo "--- ixweb release ---"
./upload-nightly.sh -c upload.ixweb.light.conf.sh BRANCH=light XAR=/usr/local/bin/xar || log "Cannot upload nightly"
#echo "--- ixweb hosting ---"
#./upload-nightly.sh -c upload.ixweb.hosting.conf.sh XAR=/usr/local/bin/xar || log "Cannot upload nightly"
cd ..
git stash
log "Success light upload."
