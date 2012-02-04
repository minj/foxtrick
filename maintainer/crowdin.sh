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
  
#export/pack latest translations
echo "order crowdin to repack.."
re="$(curl -s \
  "$CROWDIN_URL"/export?key="$CROWDIN_KEY" | grep -c success)"
  if [ $re -ne 1 ]; then
   echo "failed. try again.."
	re="$(curl -s \
	  "$CROWDIN_URL"/export?key="$CROWDIN_KEY" | grep -c success)"
	  if [ $re -ne 1 ]; then
		echo "export failed"
	  else
		echo "ok"
		
	  fi
  else
    echo "ok"
  fi
  
if [ $re -ne 1 ]; then
#Download all translations as a single ZIP archive.
	echo "download zip.."
	wget -q -O langs.zip "$CROWDIN_URL"/download/all.zip?key="$CROWDIN_KEY"
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
			  "$CROWDIN_URL"/status?key="$CROWDIN_KEY" > "$CROWDIN_FOLDER"/status.xml
		  fi
	  fi
#cleanup
	rm -rf langs.zip
fi
 

#Download French translations.
#wget http://api.crowdin.net/api/project/{project-identifier}/download/fr.zip?key={project-key}


