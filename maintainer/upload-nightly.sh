#!/bin/bash
#
# Author:
# Ryan Li <ryan@ryanium.com>
# Licensed under GNU General Public License v3 or later
#
# upload-nightly.sh will pass all of its arguments to Make
#
# Exit codes:
# 0) Success
# 1) Variables USER and PASSWORD unset (set in upload.conf.sh)
# 2) Failed to make
# 3) Failed to upload

# FTP settings
USER=
PASSWORD=
HOST='www.foxtrick.org'
DEST=.

#googlecode settings
GOOGLE_USER=
GOOGLE_PASSWORD=

# update manifest settings
URL_BASE='http://foxtrick.foundationhorizont.org/nightly'
DIST=nightly

# source setting
SRC_DIR=..

# load configuration, probably overwriting defaults above
. ./upload.conf.sh

# see if values are set
if [[ -z "$USER" || -z "$PASSWORD" ]]; then
	echo 'Please specify USER and PASSWORD in upload.conf.sh' >&2
	exit 1
fi

# version settings
MAJOR_VERSION=$(cd ${SRC_DIR} && ./version.sh)
if [ "$DIST" == "nightly" ]; then
	REVISION=$(cd "$SRC_DIR" && git svn find-rev HEAD)
	VERSION="$MAJOR_VERSION.$REVISION"
else
	VERSION="$MAJOR_VERSION"
fi

(cd "$SRC_DIR" && make DIST_TYPE="$DIST" "$@") || exit 2

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

# modify update-opera.xml for Opera
cp update-tmpl-opera.xml update-opera.xml
sed -i "s|{UPDATE_LINK}|${URL_BASE}/opera/foxtrick-${VERSION}.oex|g" update-opera.xml
sed -i "s|{VERSION}|${VERSION}|g" update-opera.xml

# modify update-safari.plist for Safari
cp update-tmpl-safari.plist update-safari.plist
sed -i "s|{UPDATE_LINK}|${URL_BASE}/safari/foxtrick-${VERSION}.safariextz|g" update-safari.plist
sed -i "s|{VERSION}|${VERSION}|g" update-safari.plist

# upload to googlecode downloads
echo "upload to googlecode"
cp ../foxtrick.xpi ../foxtrick-"$VERSION".xpi
python googlecode_upload.py \
  -s "$DIST" -p foxtrick -u "$GOOGLE_USER" -w "$GOOGLE_PASSWORD" \
  -l Version-"$VERSION",Type-"$DIST",Browser-Firefox ../foxtrick-"$VERSION".xpi
rm ../foxtrick-"$VERSION".xpi

cp ../foxtrick.crx ../foxtrick-"$VERSION".crx
python googlecode_upload.py \
  -s "$DIST" -p foxtrick -u "$GOOGLE_USER" -w "$GOOGLE_PASSWORD" \
  -l Version-"$VERSION",Type-"$DIST",Browser-Chrome ../foxtrick-"$VERSION".crx
rm ../foxtrick-"$VERSION".crx

cp ../foxtrick.oex ../foxtrick-"$VERSION".oex
python googlecode_upload.py \
  -s "$DIST" -p foxtrick -u "$GOOGLE_USER" -w "$GOOGLE_PASSWORD" \
  -l Version-"$VERSION",Type-"$DIST",Browser-Opera ../foxtrick-"$VERSION".oex
rm ../foxtrick-"$VERSION".oex

cp ../foxtrick.safariextz ../foxtrick-"$VERSION".safariextz
python googlecode_upload.py \
  -s "$DIST" -p foxtrick -u "$GOOGLE_USER" -w "$GOOGLE_PASSWORD" \
  -l Version-"$VERSION",Type-"$DIST",Browser-Safari ../foxtrick-"$VERSION".safariextz
rm ../foxtrick-"$VERSION".safariextz

cp ftp-tmpl ftp
sed -i \
	-e "s|{USER}|${USER}|g" \
	-e "s|{PASSWORD}|${PASSWORD}|g" \
	-e "s|{HOST}|${HOST}|g" \
	-e "s|{DEST}|${DEST}|g" \
	-e "s|{PATH}|${SRC_DIR}|g" \
	-e "s|{VERSION}|${VERSION}|g" ftp

lftp -f ftp || exit 3

rm update-firefox.rdf update-chrome.xml update-opera.xml update-safari.plist ftp
