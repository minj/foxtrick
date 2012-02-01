#!/bin/bash

CROWDIN_KEY=
CROWDIN_URL=http://api.crowdin.net/api/project/foxtrick
SVN_FILES=../content/locale/*

# load configuration, probably overwriting defaults above
. ./upload.conf.sh


#export master
echo "upload new master to crowdin"
curl \
  -F "files[foxtrick.properties]=@../content/foxtrick.properties" "$CROWDIN_URL"/update-file?key="$CROWDIN_KEY"

for LOC in $SVN_FILES
do
  # take action on each file. $f store current file name
  re="$(curl -s \
    -F "files[foxtrick.properties]=@$LOC/foxtrick.properties" \
    -F "language=${LOC##*/}" \
    -F "import_eq_suggestions=1" \
    "$CROWDIN_URL"/upload-translation?key="$CROWDIN_KEY" | grep -c success)"
  if [ $re -ne 1 ]; then
    echo "upload ${LOC##*/} to crowdin failed"
  else
    echo "uploaded ${LOC##*/} to crowdin"
  fi
done
  
#export/pack latest translations
echo "order crowdin to repack.."
re="$(curl -s "$CROWDIN_URL"/export?key="$CROWDIN_KEY" | grep -c success)"
  if [ $re -ne 1 ]; then
    echo "crowdin repack failed. don't get outdated zip"
    exit -1
  else
    echo "crowdin repacked. get new zip"
  fi
  
#Download all translations as a single ZIP archive.
wget -nv -O langs.zip "$CROWDIN_URL"/download/all.zip?key="$CROWDIN_KEY"
  if [ $? -ne 0 ]; then
	echo "Translations download failed"
	exit -1
  else
	echo "Translations downloaded"
  fi

mkdir crowdin/
mkdir crowdin/locale/
unzip -q -o -a langs.zip -d crowdin/locale/
  if [ $? -ne 0 ]; then
	echo "Unzipped failed"
	exit -1
  else
	echo "Unzipped"
  fi

#get translation status  
curl -s "$CROWDIN_URL"/status?key="$CROWDIN_KEY" > crowdin/locale/status.xml
 
#cleanup
rm -rf langs.zip


#Download French translations.
#wget http://api.crowdin.net/api/project/{project-identifier}/download/fr.zip?key={project-key}


