#!/bin/bash

CROWDIN_KEY=
CROWDIN_URL=https://api.crowdin.com/api/project/foxtrick
SVN_FILES=../content/locale/*
CROWDIN_FOLDER=crowdin/locale

# load configuration, probably overwriting defaults above
. ./upload.conf.sh

#export/pack latest translations
for i in {1..10}
do
	echo "order crowdin to repack.."
	re="$(curl -sfL \
	  "$CROWDIN_URL"/export?key="$CROWDIN_KEY" | grep -c success)"
	  if [ $re -ne 1 ]; then
		echo "try again in 2 min"
		sleep 120
	  else
		echo "ok"
		break
	  fi
done


if [ $re -eq 1 ]; then
#Download all translations as a single ZIP archive.
	echo "download zip.."
	curl -sfL "$CROWDIN_URL"/download/all.zip?key="$CROWDIN_KEY" -o langs.zip
	  if [ $? -ne 0 ]; then
		echo "failed"
		exit 1
	  else
		echo "ok"
		mkdir -p "$CROWDIN_FOLDER"
		unzip -q -o -a langs.zip -d "$CROWDIN_FOLDER"
		  if [ $? -ne 0 ]; then
			echo "Unzip failed"
			exit 1
		  else
			echo "Unzipped to $CROWDIN_FOLDER"
#get translation status
			curl -sfL "$CROWDIN_URL"/status?key="$CROWDIN_KEY" -o status.xml
			locale/XMLToJSON.py status.xml
			rm status.xml
			mv status.json "$CROWDIN_FOLDER"/status.json
		  fi
	  fi
#cleanup
	rm -rf langs.zip
else
	echo "export failed"
	exit 1
fi


#Download French translations.
#http://api.crowdin.net/api/project/{project-identifier}/download/fr.zip?key={project-key}
