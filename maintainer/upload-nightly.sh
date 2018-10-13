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
FF_ADDON_ID='{9d1f059c-cada-4111-9696-41a62d64e3ba}'

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

UPLOAD_BRANCH=$(basename "$URL_BASE")
UPLOAD_PARENT=$(dirname "$URL_BASE")

PREVIOUS_VERSION=$(curl "${UPLOAD_PARENT}/last.php?path=${UPLOAD_BRANCH}")
echo "Previous: ${PREVIOUS_VERSION}"
echo "Current: ${VERSION}"

if [ "${PREVIOUS_VERSION}" == "${VERSION}" ]; then
	echo "Current version matches last upload. Stopping." >&2
	exit 3
fi

if [ "$DO_MAKE" == "true" ]; then
	(\
	 cd "$SRC_DIR" && \
	 make DIST_TYPE="$DIST" MODULES="$MODULES" UPDATE_URL="$URL_BASE" FF_ADDON_ID="$FF_ADDON_ID" "$@"\
	 ) || exit 2
fi

if [ -f "${SRC_DIR}/foxtrick.zip" ]; then
	xvfb-run python dist/cws_upload.py ${CHROME_ID} "${SRC_DIR}/foxtrick.zip" || \
		echo "WARNING: failed to upload to CWS" >&2
fi

if [ -f "${SRC_DIR}/foxtrick.xpi" ]; then
	GECKO_CHKSUM=$(dist/amo-upload.sh "${FF_ADDON_ID}" "${VERSION}" "${SRC_DIR}/foxtrick.xpi")
	[[ -z "${GECKO_CHKSUM}" ]] && exit 3
fi

echo "uploading to $DEST @ server"

if [ -f "${SRC_DIR}/foxtrick.xpi" ]; then
	scp "${SRC_DIR}/foxtrick.xpi" server:"${DEST}/foxtrick-${VERSION}.xpi"
fi
if [ -f "${SRC_DIR}/foxtrick.crx" ]; then
	scp "${SRC_DIR}/foxtrick.crx" server:"${DEST}/chrome/foxtrick-${VERSION}.crx"
fi
if [ -f "${SRC_DIR}/foxtrick.safariextz" ]; then
	scp "${SRC_DIR}/foxtrick.safariextz" server:"${DEST}/safari/foxtrick-${VERSION}.safariextz"
fi

if [ "$UPLOAD_UPDATE_FILES" == "true" ]; then
	if [ -f "${SRC_DIR}/foxtrick.xpi" ]; then
		# modify update-firefox.rdf for Gecko
		cp update-tmpl-firefox.rdf update-firefox.rdf
		sed -i "s|{UPDATE_LINK}|${URL_BASE}/foxtrick-${VERSION}.xpi|g" update-firefox.rdf
		sed -i "s|{FF_ADDON_ID}|${FF_ADDON_ID}|g" update-firefox.rdf
		sed -i "s|{UPDATE_HASH}|${GECKO_CHKSUM}|g" update-firefox.rdf
		sed -i "s|{VERSION}|${VERSION}|g" update-firefox.rdf

		scp update-firefox.rdf server:"${DEST}/update.rdf"
	fi

	if [ -f "${SRC_DIR}/foxtrick.crx" ]; then
		# modify update-chrome.xml for Google Chrome
		cp update-tmpl-chrome.xml update-chrome.xml
		sed -i "s|{UPDATE_LINK}|${URL_BASE}/chrome/foxtrick-${VERSION}.crx|g" update-chrome.xml
		sed -i "s|{VERSION}|${VERSION}|g" update-chrome.xml

		scp update-chrome.xml server:"${DEST}/chrome/update.xml"
	fi

	if [ -f "${SRC_DIR}/foxtrick.safariextz" ]; then
		# modify update-safari.plist for Safari
		cp update-tmpl-safari.plist update-safari.plist
		sed -i "s|{UPDATE_LINK}|${URL_BASE}/safari/foxtrick-${VERSION}.safariextz|g" update-safari.plist
		sed -i "s|{VERSION}|${VERSION}|g" update-safari.plist

		scp update-safari.plist server:"${DEST}/safari/update.plist"
	fi

	rm -f update-firefox.rdf update-chrome.xml update-safari.plist

fi

# README: old FTP implementation
# echo "uploading to $HOST $DEST"
# cp ftp-tmpl ftp
# sed -i \
#     -e "s|{USER}|${USER}|g" \
#     -e "s|{PASSWORD}|${PASSWORD}|g" \
#     -e "s|{HOST}|${HOST}|g" \
#     -e "s|{DEST}|${DEST}|g" \
#     -e "s|{PATH}|${SRC_DIR}|g" \
#     -e "s|{VERSION}|${VERSION}|g" ftp
# lftp -f ftp || exit 3
# rm ftp

# rm -f update-firefox.rdf update-chrome.xml update-safari.plist
