#!/bin/bash

RES_FOLDER="../res/*.json ../res/staff/*.json"

# load configuration, probably overwriting defaults above
. ./upload.conf.sh

#zip resources
#for File in $RES_FOLDER; do
#	zip -fv $File.zip $File
#done

#commit res zips to svn
#git commit -a -m "*automated* resource zip update"
#git svn dcommit 
