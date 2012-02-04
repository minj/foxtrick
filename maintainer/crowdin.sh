#!/bin/bash

CROWDIN_KEY=
CROWDIN_URL=http://api.crowdin.net/api/project/foxtrick
SVN_FILES=../content/locale/*
CROWDIN_FOLDER=crowdin/locale

# load configuration, probably overwriting defaults above
. ./upload.conf.sh


#export master
#echo "upload to crowdin.."
#re="$(curl -s \
#  -F "files[foxtrick.properties]=@../content/foxtrick.properties" \
#  "$CROWDIN_URL"/update-file?key="$CROWDIN_KEY"  | grep -c success)"
#  if [ $re -ne 1 ]; then
#    echo "master failed"
#  else
#    echo "master ok"
#  fi

#for LOC in $SVN_FILES
#do
  # take action on each file. $f store current file name
#  re="$(curl -s \
#    -F "files[foxtrick.properties]=@$LOC/foxtrick.properties" \
#    -F "language=${LOC##*/}" \
#    -F "import_eq_suggestions=1" \
#    "$CROWDIN_URL"/upload-translation?key="$CROWDIN_KEY" | grep -c success)"
#  if [ $re -ne 1 ]; then
#    echo "${LOC##*/} failed"
#  else
#    echo "${LOC##*/} ok"
#  fi
#done
  
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
<<<<<<< HEAD:maintainer/crowdin.sh
	echo "download zip.."
	wget -q -O langs.zip "$CROWDIN_URL"/download/all.zip?key="$CROWDIN_KEY"
=======
echo "download zip.."
wget -q -O langs.zip "$CROWDIN_URL"/download/all.zip?key="$CROWDIN_KEY"
  if [ $? -ne 0 ]; then
	echo "failed"
<<<<<<< Updated upstream:maintainer/crowdin.sh
=======
#	exit -1
# try individual files	
	for LOC in $SVN_FILES
	do
	  # take action on each file. $f store current file name
wget -q -O lang"${LOC##*/}".zip \
"$CROWDIN_URL"/download/"${LOC##*/}".zip?key="$CROWDIN_KEY"
	    if [ $? -ne 0 ]; then
		  echo "${LOC##*/} ok"
		unzip -o -a lang"${LOC##*/}".zip -d "$CROWDIN_FOLDER"/${LOC##*/}
		    if [ $? -ne 0 ]; then
			  echo "Unzip failed"
		    else
			  echo "Unzipped ${LOC##*/} to $CROWDIN_FOLDER"
		    fi
#		rm lang.zip
	    else
		  echo "${LOC##*/} failed"
	    fi
	done
>>>>>>> Stashed changes:maintainer/crowdin.sh
  else
	echo "ok"
	mkdir -p "$CROWDIN_FOLDER"
	unzip -q -o -a langs.zip -d "$CROWDIN_FOLDER"
>>>>>>> crowdin something:maintainer/crowdin.sh
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
		  fi
	  fi
#cleanup
	rm -rf langs.zip
fi

#get translation status  
curl -s \
  "$CROWDIN_URL"/status?key="$CROWDIN_KEY" > "$CROWDIN_FOLDER"/status.xml
 

#Download French translations.
#wget http://api.crowdin.net/api/project/{project-identifier}/download/fr.zip?key={project-key}


