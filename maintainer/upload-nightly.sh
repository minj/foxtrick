#!/bin/bash
#
# Author:
# Ryan Li <ryan@ryanium.com>
# Licensed under GNU General Public License v3 or later
#
# upload-nightly.sh will pass all of its arguments to Make
#
# Options:
# -c : name of the config file sh
# any other arguments resp anything after is passed to Make
#
# Exit codes:
# 0) Success
# 1) Variables USER and PASSWORD unset (set in upload.conf.sh)
# 2) Failed to make
# 3) Failed to upload

# FTP settings arrays
USER=''
PASSWORD=''
HOST='www.foxtrick.org'
DEST='.'
DO_MAKE='true'
UPLOAD_UPDATE_FILES='true'
MODULES=modules
CHROME_ID='gpfggkkkmpaalfemiafhfobkfnadeegj'

# update manifest settings
URL_BASE='http://foxtrick.foundationhorizont.org/nightly'
DIST=nightly

# source setting
SRC_DIR=..

# load configuration, probably overwriting defaults above
CONFIG_FILE='./upload.conf.sh'
if [ $1 ]; then
  if [ $1 == "-c" ]; then
	shift
	if [ -f $1 ]; then
		CONFIG_FILE=$1
		shift
	fi
  fi
fi
echo "using config file: $CONFIG_FILE"
. $CONFIG_FILE

# see if values are set
if [[ -z "$USER" || -z "$PASSWORD" ]]; then
	echo 'Please specify USER and PASSWORD in upload.conf.sh' >&2
	exit 1
fi

# version settings
MAJOR_VERSION=$(cd ${SRC_DIR} && ./version.sh)
if [ "$DIST" == "nightly" ]; then
	VERSION=$(git describe --long | sed -E 's/([^-]+)-g.*/\1/;s/-/./g')
else
	VERSION="$MAJOR_VERSION"
fi

if [ "$DO_MAKE" == "true" ]; then
	(cd "$SRC_DIR" && make DIST_TYPE="$DIST" MODULES="$MODULES" UPDATE_URL="$URL_BASE" "$@")|| exit 2
fi

if [ -f "${SRC_DIR}/foxtrick.zip" ]; then
	DISPLAY=:89 python dist/cws_upload.py ${CHROME_ID} "${SRC_DIR}/foxtrick.zip" || exit 2
fi
DISPLAY=:89 python dist/amo_upload.py "${SRC_DIR}/foxtrick.xpi" || exit 2

if [ "$UPLOAD_UPDATE_FILES" == "true" ]; then
	# modify update-firefox.rdf for Gecko
	cp update-tmpl-firefox.rdf update-firefox.rdf
	GECKO_SHA1SUM=`sha1sum "${SRC_DIR}/foxtrick.xpi" | sed -r 's/\s+.+$//g'`
	sed -i "s|{UPDATE_LINK}|${URL_BASE}/foxtrick-${VERSION}.xpi|g" update-firefox.rdf
	sed -i "s|{UPDATE_HASH}|sha1:${GECKO_SHA1SUM}|g" update-firefox.rdf
	sed -i "s|{VERSION}|${VERSION}|g" update-firefox.rdf

	# modify update-chrome.xml for Google Chrome
	cp update-tmpl-chrome.xml update-chrome.xml
	sed -i "s|{UPDATE_LINK}|${URL_BASE}/chrome/foxtrick-${VERSION}.crx|g" update-chrome.xml
	sed -i "s|{VERSION}|${VERSION}|g" update-chrome.xml

	# modify update-safari.plist for Safari
	cp update-tmpl-safari.plist update-safari.plist
	sed -i "s|{UPDATE_LINK}|${URL_BASE}/safari/foxtrick-${VERSION}.safariextz|g" update-safari.plist
	sed -i "s|{VERSION}|${VERSION}|g" update-safari.plist
fi

echo "uploading to $HOST $DEST"
cp ftp-tmpl ftp
sed -i \
    -e "s|{USER}|${USER}|g" \
    -e "s|{PASSWORD}|${PASSWORD}|g" \
    -e "s|{HOST}|${HOST}|g" \
    -e "s|{DEST}|${DEST}|g" \
    -e "s|{PATH}|${SRC_DIR}|g" \
    -e "s|{VERSION}|${VERSION}|g" ftp
lftp -f ftp || exit 3
rm ftp

rm -f update-firefox.rdf update-chrome.xml update-safari.plist
