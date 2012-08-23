#!/bin/bash

CROWDIN_KEY=
CROWDIN_URL=http://api.crowdin.net/api/project/foxtrick
SVN_FILES=../content/locale/*
CROWDIN_FOLDER=crowdin/locale

# load configuration, probably overwriting defaults above
. ./upload.conf.sh

# get module names from foxtrick.properties file
cat ../content/foxtrick.properties | egrep -o "^module\.[^\.]+\.desc" > module-names
sed -i -r 's|module.||' module-names
sed -i -r 's|.desc||' module-names

# make tbx glossary from module names
perl crowdin-module-glossary-update.pl

#upload glossary
re="$(curl \
	-F "file=@crowdin-glossary.tbx" \
	"$CROWDIN_URL"/upload-glossary?key="$CROWDIN_KEY" | grep -c success)"
if [ $re -ne 1 ]; then
  echo "crowdin-glossary failed"
else
  echo "crowdin-glossary ok"
fi