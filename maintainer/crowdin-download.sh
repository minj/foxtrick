#!/bin/bash

CROWDIN_KEY=
CROWDIN_URL=http://api.crowdin.net/api/project/foxtrick
SVN_FILES=../content/locale/*
CROWDIN_FOLDER=crowdin/locale

# load configuration, probably overwriting defaults above
. ./upload.conf.sh
  
#export/pack latest translations
for i in {1..10}
do
	echo "order crowdin to repack.."
	re="$(curl -s \
	  "$CROWDIN_URL"/export?key="$CROWDIN_KEY" | grep -c success)"
	  if [ $re -ne 1 ]; then
		echo "try again in 1 min"
		sleep 120
	  else
		echo "ok"
		break
	  fi
done

  
if [ $re -eq 1 ]; then
#Download all translations as a single ZIP archive.
	echo "download zip.."
	wget -O langs.zip "$CROWDIN_URL"/download/all.zip?key="$CROWDIN_KEY"
	  if [ $? -ne 0 ]; then
		echo "failed"
	  else
		echo "ok"
		mkdir -p "$CROWDIN_FOLDER"
		unzip -q -o -a langs.zip -d "$CROWDIN_FOLDER"
		  if [ $? -ne 0 ]; then
			echo "Unzip failed"
		  else
			echo "Unzipped to $CROWDIN_FOLDER"
#get translation status  
			curl -s \
			  "$CROWDIN_URL"/status?key="$CROWDIN_KEY" > status.xml
			locale/XMLToJSON.py status.xml
			rm status.xml
			mv status.json "$CROWDIN_FOLDER"/status.json
		  fi
	  fi
#cleanup
	rm -rf langs.zip
else
	echo "export failed"
fi
 

#Download French translations.
#wget http://api.crowdin.net/api/project/{project-identifier}/download/fr.zip?key={project-key}
