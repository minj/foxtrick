#!/bin/bash

CROWDIN_KEY=
CROWDIN_URL=http://api.crowdin.net/api/project/foxtrick

# load configuration, probably overwriting defaults above
. ./upload.conf.sh


#export master
curl \
-F "files[foxtrick.properties]=@../content/foxtrick.properties" "$CROWDIN_URL"/update-file?key="$CROWDIN_KEY"

#export, pack latest translations
#curl \
# "$CROWDIN_URL"/export?key="$CROWDIN_KEY"


#Download all translations as a single ZIP archive.
wget -nv -O langs.zip "$CROWDIN_URL"/download/all.zip?key="$CROWDIN_KEY"
  if [ $? -ne 0 ]; then
    echo "Link not up"
    exit -1
  else
    echo "OK"
  fi

mkdir crowdin/locale/
unzip -q -o -a langs.zip -d crowdin/locale/
  if [ $? -ne 0 ]; then
    echo "not unzipped"
    exit -1
  else
    echo "OK unzip"
  fi

#Download French translations.
#wget http://api.crowdin.net/api/project/{project-identifier}/download/fr.zip?key={project-key}

#cleanup
rm -rf langs.zip

