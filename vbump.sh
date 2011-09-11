#!/bin/sh
#
# Version bump utility
# version must be in this format: [0-9.]+

if [ -z $1 ]; then
	echo "Usage: $0 VERSION" >&2
	exit 1
fi

VER="$1"

sed -i -r "/extensions\\.foxtrick\\.prefs\\.version/s|\"[0-9.]+\"|\"$VER\"|" defaults/preferences/foxtrick.js

# Mozilla
sed -i -r "/<em:version>/s|>[0-9.]+<|>$VER<|" install.rdf
# Chrome
sed -i -r "/\"version\"/s|\"[0-9.]+\"|\"$VER\"|" manifest.json
# Opera
sed -i -r "/version=.+network=/s|\"[0-9.]+\"|\"$VER\"|" config.xml
# Safari
sed -i -r "/<!--version-->/s|>[0-9.]+<|>$VER<|" Info.plist
