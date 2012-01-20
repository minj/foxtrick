#!/bin/bash

CROWDIN_KEY=
CROWDIN_URL=http://api.crowdin.net/api/project/foxtrick

# load configuration, probably overwriting defaults above
. ./upload.conf.sh


#export master
echo "upload new master to crowdin"
curl \
  -F "files[foxtrick.properties]=@../content/foxtrick.properties" "$CROWDIN_URL"/update-file?key="$CROWDIN_KEY"

#export, pack latest translations
echo "order crowdin to repack"
curl \
  "$CROWDIN_URL"/export?key="$CROWDIN_KEY"


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

#Download French translations.
#wget http://api.crowdin.net/api/project/{project-identifier}/download/fr.zip?key={project-key}

#cleanup
rm -rf langs.zip

