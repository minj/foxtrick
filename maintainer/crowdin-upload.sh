#!/bin/bash

CROWDIN_KEY=
CROWDIN_URL=http://api.crowdin.net/api/project/foxtrick
SVN_FILES=../content/locale/*
CROWDIN_FOLDER=crowdin/locale

# load configuration, probably overwriting defaults above
. ./upload.conf.sh


#export master
echo "upload to crowdin.."
re="$(curl -s \
  -F "files[foxtrick.properties]=@../content/foxtrick.properties" \
  "$CROWDIN_URL"/update-file?key="$CROWDIN_KEY"  | grep -c success)"
  if [ $re -ne 1 ]; then
    echo "master failed"
  else
    echo "master ok"
  fi

for LOC in $SVN_FILES
do
  # take action on each file. $f store current file name
  re="$(curl -s \
    -F "files[foxtrick.properties]=@$LOC/foxtrick.properties" \
    -F "language=${LOC##*/}" \
    -F "import_eq_suggestions=1" \
    "$CROWDIN_URL"/upload-translation?key="$CROWDIN_KEY" | grep -c success)"
  if [ $re -ne 1 ]; then
    echo "${LOC##*/} failed"
  else
    echo "${LOC##*/} ok"
  fi
done
  


