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

(cd ${SOURCE_DIR} && make firefox DIST_TYPE=nightly)

MAJOR_VERSION=`cd ${SOURCE_DIR} && grep '<em:version>' install.rdf | \
	sed -r -e 's|^.+<em:version>(.+)</em:version>|\1|'`
REVISION=`cd ${SOURCE_DIR} && git svn find-rev master`
VERSION="${MAJOR_VERSION}.r${REVISION}"

cp update-template.rdf update.rdf
sed -i "s|{UPDATE_LINK}|http://foxtrick.foundationhorizont.org/nightly/downloads/foxtrick-r${REVISION}.xpi|g" update.rdf
sed -i "s|{VERSION}|${VERSION}|g" update.rdf

cp script-template script
sed -i -e "s|{USER}|${USER}|g" -e "s|{PASSWORD}|${PASSWORD}|g" \
	-e "s|{HOST}|${HOST}|g" -e "s|{PATH}|${SOURCE_DIR}|g" \
	-e "s|{FILENAME}|foxtrick-r${REVISION}.xpi|g" script

lftp -f script

rm update.rdf script
