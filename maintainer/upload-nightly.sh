#!/bin/bash

USER=
PASSWORD=
HOST='web306.ixwebhosting.com'

SOURCE_DIR='..'

. ./upload.conf.sh

if [[ -z "${USER}" || -z "${PASSWORD}" ]]; then
	echo 'Please specify USER and PASSWORD in upload.conf.sh' >&2
	exit 1
fi

(cd ${SOURCE_DIR} && make DIST_TYPE=nightly)

REVISION=`cd ${SOURCE_DIR} && git svn find-rev master`

# modify update.rdf for Gecko
cp update-template.rdf update.rdf
GECKO_MAJOR_VERSION=`cd ${SOURCE_DIR} && grep '<em:version>' install.rdf | \
	sed -r -e 's|^.+<em:version>(.+)</em:version>|\1|'`
GECKO_VERSION="${GECKO_MAJOR_VERSION}.r${REVISION}"
GECKO_SHA1SUM=`sha1sum "${SOURCE_DIR}/foxtrick.xpi" | sed -r 's/\s+.+$//g'`
sed -i "s|{UPDATE_LINK}|http://foxtrick.foundationhorizont.org/nightly/foxtrick-r${REVISION}.xpi|g" update.rdf
sed -i "s|{UPDATE_HASH}|sha1:${GECKO_SHA1SUM}|g" update.rdf
sed -i "s|{VERSION}|${GECKO_VERSION}|g" update.rdf

# modify update.xml for Google Chrome
cp update-template.xml update.xml
CHROME_MAJOR_VERSION=`cd ${SOURCE_DIR} && grep '"version"' manifest.json | \
	sed -r -e 's|^.*"version" : "(([0-9]+\.)*)[0-9]+".*$|\1|'`
CHROME_VERSION="${CHROME_MAJOR_VERSION}${REVISION}"
sed -i "s|{CODEBASE}|http://foxtrick.foundationhorizont.org/nightly/chrome/foxtrick-r${REVISION}.xpi|g" update.xml
sed -i "s|{VERSION}|${CHROME_VERSION}|g" update.xml

cp script-template script
sed -i -e "s|{USER}|${USER}|g" -e "s|{PASSWORD}|${PASSWORD}|g" \
	-e "s|{HOST}|${HOST}|g" -e "s|{PATH}|${SOURCE_DIR}|g" \
	-e "s|{GECKO_FILENAME}|foxtrick-r${REVISION}.xpi|g" \
	-e "s|{CHROME_FILENAME}|foxtrick-r${REVISION}.crx|g" script

lftp -f script

rm update.rdf update.xml script
