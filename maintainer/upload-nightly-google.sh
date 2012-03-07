#!/bin/bash
#
# Author:
# convincedd <convincedd@gmail.com>
# Licensed under GNU General Public License v3 or later
#

# Exit codes:
# 0) Success
# 1) Variables USER and PASSWORD unset (set in upload.conf.sh)

#googlecode settings
GOOGLE_USER=
GOOGLE_PASSWORD=

# update manifest settings
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
if [[ -z "$GOOGLE_USER" || -z "$GOOGLE_PASSWORD" ]]; then
	echo 'Please specify GOOGLE_USER and GOOGLE_PASSWORD in upload.conf.sh' >&2
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

