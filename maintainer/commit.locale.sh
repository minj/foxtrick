#!/bin/bash

SVN_FILES=../content
EXTERNAL_LOCALE_FOLDER=crowdin/locale
#space seperated blacklist of locales which only use svn 
IGNORELIST=""

# load configuration, probably overwriting defaults above
. ./upload.conf.sh

#remove blacklisted from crowdin folder
for LOC in $IGNORELIST
do
   #echo "rm -rf $EXTERNAL_LOCALE_FOLDER/$LOC"
   #rm -rfv "$EXTERNAL_LOCALE_FOLDER/$LOC"
done

#copy crowdin locale to svn folder
cp -rf "$EXTERNAL_LOCALE_FOLDER" "$SVN_FILES"

#commit crowdin to svn
git commit -a -m "*automated* crowdin locale update"
git svn dcommit 

rm -rf "$EXTERNAL_LOCALE_FOLDER"
