#!/bin/bash
#
# Author:
# Ryan Li <ryan@ryanium.com>
# Licensed under GNU General Public License v3 or later
#
# Exit codes:
# 0) Success
# 1) Variables USER and PASSWORD unset (set in upload.conf.sh)
# 2) Failed to make
# 3) Failed to upload

USER=
PASSWORD=
HOST='web306.ixwebhosting.com'

SOURCE_DIR='..'

. ./upload.conf.sh

if [[ -z "${USER}" || -z "${PASSWORD}" ]]; then
	echo 'Please specify USER and PASSWORD in upload.conf.sh' >&2
	exit 1
fi

(cd ${SOURCE_DIR} && make DIST_TYPE=nightly) || exit 2

REVISION=`cd ${SOURCE_DIR} && git svn find-rev HEAD`

# modify update-firefox.rdf for Gecko
cp update-tmpl-firefox.rdf update-firefox.rdf
GECKO_MAJOR_VERSION=`cd ${SOURCE_DIR} && grep '<em:version>' install.rdf | \
	sed -r -e 's|^.+<em:version>(.+)</em:version>|\1|'`
GECKO_VERSION="${GECKO_MAJOR_VERSION}.${REVISION}"
GECKO_SHA1SUM=`sha1sum "${SOURCE_DIR}/foxtrick.xpi" | sed -r 's/\s+.+$//g'`
sed -i "s|{UPDATE_LINK}|http://foxtrick.foundationhorizont.org/nightly/foxtrick-r${REVISION}.xpi|g" update-firefox.rdf
sed -i "s|{UPDATE_HASH}|sha1:${GECKO_SHA1SUM}|g" update-firefox.rdf
sed -i "s|{VERSION}|${GECKO_VERSION}|g" update-firefox.rdf

# modify update-chrome.xml for Google Chrome
cp update-tmpl-chrome.xml update-chrome.xml
CHROME_MAJOR_VERSION=`cd ${SOURCE_DIR} && grep '"version"' manifest.json | \
	sed -r -e 's|^.*"version" : "(.+)".*$|\1|'`
CHROME_VERSION="${CHROME_MAJOR_VERSION}.${REVISION}"
sed -i "s|{UPDATE_LINK}|http://foxtrick.foundationhorizont.org/nightly/chrome/foxtrick-r${REVISION}.crx|g" update-chrome.xml
sed -i "s|{VERSION}|${CHROME_VERSION}|g" update-chrome.xml

# modify update-opera.xml for Opera
cp update-tmpl-opera.xml update-opera.xml
OPERA_MAJOR_VERSION=`cd ${SOURCE_DIR} && grep -E 'version=.+network=.+' config.xml | \
	sed -r -e 's|^.*version="([^"]+)".*$|\1|'`
OPERA_VERSION="${OPERA_MAJOR_VERSION}.${REVISION}"
sed -i "s|{UPDATE_LINK}|http://foxtrick.foundationhorizont.org/nightly/opera/foxtrick-r${REVISION}.oex|g" update-opera.xml
sed -i "s|{VERSION}|${OPERA_VERSION}|g" update-opera.xml

# modify update-safari.plist for Safari
cp update-tmpl-safari.plist update-safari.plist
SAFARI_MAJOR_VERSION=`cd ${SOURCE_DIR} && grep -m 1 -E '<string>.+</string><!--version-->' Info.plist | \
	sed -r -e 's|<string>(.+)</string><!--version-->|\1|'`
SAFARI_VERSION="${SAFARI_MAJOR_VERSION}.${REVISION}"
sed -i "s|{UPDATE_LINK}|http://foxtrick.foundationhorizont.org/nightly/safari/foxtrick-r${REVISION}.safariextz|g" update-safari.plist
sed -i "s|{VERSION}|${SAFARI_VERSION}|g" update-safari.plist

cp ftp-tmpl ftp
sed -i -e "s|{USER}|${USER}|g" \
	-e "s|{PASSWORD}|${PASSWORD}|g" \
	-e "s|{HOST}|${HOST}|g" \
	-e "s|{PATH}|${SOURCE_DIR}|g" \
	-e "s|{REVISION}|${REVISION}|g" ftp

lftp -f ftp || exit 3

rm update-firefox.rdf update-chrome.xml update-opera.xml update-safari.plist ftp
