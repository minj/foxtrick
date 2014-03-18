#!/bin/sh
#
# Version utility
# version must be in this format: [0-9.]+
#
# Usage:
# - To get version:
#   ./version.sh
# - To bump version:
#   ./version.sh VERSION

if [ -z $1 ]; then
	sed -n -r "/extensions\\.foxtrick\\.prefs\\.version/s/^.+\"([0-9.]+)\".+$/\\1/p" defaults/preferences/foxtrick.js
else
	VER="$1"

	sed -i -r "/extensions\\.foxtrick\\.prefs\\.version/s|\"[0-9.]+\"|\"$VER\"|" defaults/preferences/foxtrick.js
	# Mozilla
	if [ -f install.rdf ]; then
		sed -i -r "/<em:version>/s|>[0-9.]+<|>$VER<|" install.rdf
	fi
	# Chrome
	if [ -f manifest.json ]; then
		sed -i -r "/\"version\"/s|\"[0-9.]+\"|\"$VER\"|" manifest.json
	fi
	# Safari
	if [ -f Info.plist ]; then
		sed -i -r "/<!--version-->/s|>[0-9.]+<|>$VER<|" Info.plist
	fi
fi
