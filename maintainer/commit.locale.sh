#!/bin/bash

GIT_FILES=../content
EXTERNAL_LOCALE_FOLDER=crowdin/locale

# load configuration, probably overwriting defaults above
. ./upload.conf.sh

#copy crowdin locale to svn folder
cp -rf "$EXTERNAL_LOCALE_FOLDER" "$GIT_FILES"

#commit crowdin
git commit -a -m "*automated* crowdin locale update"
git push

rm -rf "$EXTERNAL_LOCALE_FOLDER"
