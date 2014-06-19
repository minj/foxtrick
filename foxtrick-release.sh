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

cd $RELEASE || log "Cannot cd to $RELEASE"
git stash
git svn rebase || log "Cannot git-svn rebase"
./version.sh 0.13.0.1
./version.sh
cd maintainer || log "Cannot cd to maintainer"
#./crowdin-upload.sh || echo "Cannot upload external translations"
#./crowdin-download.sh || echo "Cannot download external translations"
#./commit.locale.sh || echo "Cannot commit locale"
echo "--- foxtrick.org release---"
./upload-nightly.sh -c upload.release.conf.sh BRANCH=release XAR=/usr/local/bin/xar || log "Cannot upload foxtrick.org release"
echo "--- ixweb release ---"
./upload-nightly.sh -c upload.ixweb.release.conf.sh BRANCH=release XAR=/usr/local/bin/xar || log "Cannot upload ixweb release"
echo "--- ixweb hosting ---"
./upload-nightly.sh -c upload.ixweb.hosting.conf.sh BRANCH=hosted WEBSTORE=true XAR=/usr/local/bin/xar || log "Cannot upload ixweb hosted"
cd ..
git stash
log "Success."
