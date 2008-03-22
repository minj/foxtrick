#!/bin/sh

rm -r temp
rm foxtrick.xpi
mkdir temp

echo Copying files
cp -r ../src/* temp
cp -t temp ../chrome.manifest 

cd temp/chrome
zip -0 -r -m foxtrick.jar *

echo Entering build dir
cd ..

zip -r ../foxtrick.xpi *
cd ..
rm -r temp
