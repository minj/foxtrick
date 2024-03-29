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
# 1) Version already uploaded
# 2) Failed to make
# 3) Failed to upload

DEST_DIR='.'
DO_MAKE='true'
UPLOAD_UPDATE_FILES='true'
MODULES=modules
CHROME_ID='gpfggkkkmpaalfemiafhfobkfnadeegj'
FF_ADDON_ID='{9d1f059c-cada-4111-9696-41a62d64e3ba}'

# update manifest settings
URL_BASE='https://www.foxtrick.org/nightly'
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

# version settings
MAJOR_VERSION=$(cd ${SRC_DIR} && ./version.sh)
if [ "$DIST" == "nightly" ]; then
	VERSION=$(git describe --long | sed -E 's/([^-]+)-g.*/\1/;s/-/./g')
else
	VERSION="$MAJOR_VERSION"
fi

PREVIOUS_VERSION=$(ls -1tr "${DEST_DIR}"/foxtrick-*.xpi | tail -1 | grep -Po '[\d.]+(?=.xpi)')
echo "Previous: ${PREVIOUS_VERSION}"
echo "Current: ${VERSION}"

if [ "${PREVIOUS_VERSION}" == "${VERSION}" ]; then
	echo "Current version matches last upload. Stopping." >&2
	exit 1
fi

if [ "$DO_MAKE" == "true" ]; then
	if ! make -C "$SRC_DIR" DIST_TYPE="$DIST" MODULES="$MODULES" UPDATE_URL="$URL_BASE" \
			FF_ADDON_ID="$FF_ADDON_ID" "$@"; then

		echo "ERROR: failed to build" >&2
		exit 2
	fi
fi

if [ -f "${SRC_DIR}/foxtrick.zip" ]; then
	if ! chrome-webstore-upload upload --source "${SRC_DIR}/foxtrick.zip" --extension-id "$CHROME_ID" \
			--client-id "$CWS_CLIENT_ID" --client-secret "$CWS_CLIENT_SECRET" \
			--refresh-token "$CWS_REFRESH_TOKEN" --auto-publish; then

		echo "WARNING: failed to upload to CWS" >&2
		exit 3
	fi
fi

if [ -f "${SRC_DIR}/foxtrick.xpi" ]; then
	GECKO_CHKSUM=$(dist/amo-upload.sh "${FF_ADDON_ID}" "${VERSION}" "${SRC_DIR}/foxtrick.xpi")
	[ -z "${GECKO_CHKSUM}" ] && echo "ERROR: failed to upload to AMO" >&2 && exit 3
fi

echo "copying to $DEST_DIR @ server"

set -e

if [ -f "${SRC_DIR}/foxtrick.xpi" ]; then
	cp "${SRC_DIR}/foxtrick.xpi" "${DEST_DIR}/foxtrick-${VERSION}.xpi"
fi
if [ -f "${SRC_DIR}/foxtrick.crx" ]; then
	cp "${SRC_DIR}/foxtrick.crx" "${DEST_DIR}/chrome/foxtrick-${VERSION}.crx"
fi
if [ -f "${SRC_DIR}/foxtrick.safariextz" ]; then
	cp "${SRC_DIR}/foxtrick.safariextz" "${DEST_DIR}/safari/foxtrick-${VERSION}.safariextz"
fi

if [ "$UPLOAD_UPDATE_FILES" == "true" ]; then
	if [ -f "${SRC_DIR}/foxtrick.xpi" ]; then
		# modify update-firefox.json for Gecko
		cp update-tmpl-firefox.json update-firefox.json
		sed -i "s|{UPDATE_LINK}|${URL_BASE}/foxtrick-${VERSION}.xpi|g" update-firefox.json
		sed -i "s|{FF_ADDON_ID}|${FF_ADDON_ID}|g" update-firefox.json
		sed -i "s|{UPDATE_HASH}|${GECKO_CHKSUM}|g" update-firefox.json
		sed -i "s|{VERSION}|${VERSION}|g" update-firefox.json

		cp update-firefox.json "${DEST_DIR}/update.json"

		# # modify update-firefox.rdf for Gecko
		# cp update-tmpl-firefox.rdf update-firefox.rdf
		# sed -i "s|{UPDATE_LINK}|${URL_BASE}/foxtrick-${VERSION}.xpi|g" update-firefox.rdf
		# sed -i "s|{FF_ADDON_ID}|${FF_ADDON_ID}|g" update-firefox.rdf
		# sed -i "s|{UPDATE_HASH}|${GECKO_CHKSUM}|g" update-firefox.rdf
		# sed -i "s|{VERSION}|${VERSION}|g" update-firefox.rdf

		# cp update-firefox.rdf "${DEST_DIR}/update.rdf"
	fi

	if [ -f "${SRC_DIR}/foxtrick.crx" ]; then
		# modify update-chrome.xml for Google Chrome
		cp update-tmpl-chrome.xml update-chrome.xml
		sed -i "s|{UPDATE_LINK}|${URL_BASE}/chrome/foxtrick-${VERSION}.crx|g" update-chrome.xml
		sed -i "s|{VERSION}|${VERSION}|g" update-chrome.xml

		cp update-chrome.xml "${DEST_DIR}/chrome/update.xml"
	fi

	if [ -f "${SRC_DIR}/foxtrick.safariextz" ]; then
		# modify update-safari.plist for Safari
		cp update-tmpl-safari.plist update-safari.plist
		sed -i "s|{UPDATE_LINK}|${URL_BASE}/safari/foxtrick-${VERSION}.safariextz|g" update-safari.plist
		sed -i "s|{VERSION}|${VERSION}|g" update-safari.plist

		cp update-safari.plist "${DEST_DIR}/safari/update.plist"
	fi

	rm -f update-firefox.json update-firefox.rdf update-chrome.xml update-safari.plist

fi

# README: old FTP implementation
# echo "uploading to $HOST $DEST_DIR"
# cp ftp-tmpl ftp
# sed -i \
#     -e "s|{USER}|${USER}|g" \
#     -e "s|{PASSWORD}|${PASSWORD}|g" \
#     -e "s|{HOST}|${HOST}|g" \
#     -e "s|{DEST_DIR}|${DEST_DIR}|g" \
#     -e "s|{PATH}|${SRC_DIR}|g" \
#     -e "s|{VERSION}|${VERSION}|g" ftp
# lftp -f ftp || exit 3
# rm ftp

# rm -f update-firefox.rdf update-chrome.xml update-safari.plist
