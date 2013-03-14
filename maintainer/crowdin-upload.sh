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
    echo "master foxtrick.properties failed"
  else
    echo "master foxtrick.properties ok"
  fi
re="$(curl -s \
  -F "files[release-notes.yml]=@../content/release-notes.yml" \
  "$CROWDIN_URL"/update-file?key="$CROWDIN_KEY"  | grep -c success)"
  if [ $re -ne 1 ]; then
    echo "master release-notes.yml failed"
  else
    echo "master release-notes.yml ok"
  fi
re="$(curl -s \
  -F "files[faq.yml]=@../content/faq.yml" \
  "$CROWDIN_URL"/update-file?key="$CROWDIN_KEY"  | grep -c success)"
  if [ $re -ne 1 ]; then
    echo "master faq.yml failed"
  else
    echo "master faq.yml ok"
  fi

# will upload outdated files as it is. so don't  
if [ 0 -eq 1 ]; then
	for LOC in $SVN_FILES
	do
	  # take action on each file. $f store current file name
	  # foxtrick.properties
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
	  # release_notes.yaml
	  re="$(curl -s \
		-F "files[release-notes.yml]=@$LOC/release-notes.yml" \
		-F "language=${LOC##*/}" \
		-F "import_eq_suggestions=1" \
		"$CROWDIN_URL"/upload-translation?key="$CROWDIN_KEY" | grep -c success)"
	  if [ $re -ne 1 ]; then
		echo "${LOC##*/} failed"
	  else
		echo "${LOC##*/} ok"
	  fi
	  # faq.yaml
	  re="$(curl -s \
		-F "files[faq.yml]=@$LOC/faq.yml" \
		-F "language=${LOC##*/}" \
		-F "import_eq_suggestions=1" \
		"$CROWDIN_URL"/upload-translation?key="$CROWDIN_KEY" | grep -c success)"
	  if [ $re -ne 1 ]; then
		echo "${LOC##*/} failed"
	  else
		echo "${LOC##*/} ok"
	  fi
	done
fi
	
./crowdin-glossary-upload.sh
