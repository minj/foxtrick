#!/bin/bash

mkdir chrome-build
cp -r content defaults platform skin manifest.json chrome-build/
./crxmake.sh chrome-build/ chrome_dev.pem
rm -rf chrome-build/
