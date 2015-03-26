#!/bin/bash

SVN_FILES=../content
EXTERNAL_LOCALE_FOLDER=crowdin/locale

# load configuration, probably overwriting defaults above
. ./upload.conf.sh

#copy crowdin locale to svn folder
cp -rf "$EXTERNAL_LOCALE_FOLDER" "$SVN_FILES"

#commit crowdin to svn
git commit -a -m "*automated* crowdin locale update"
git svn dcommit 

rm -rf "$EXTERNAL_LOCALE_FOLDER"
