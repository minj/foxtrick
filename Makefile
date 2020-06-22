APP_NAME = foxtrick

# branch type (used for build logic):
# nightly, release, light, hosting
DIST_TYPE = nightly

# branch name (used in prefs etc):
# nightly, beta, release, light, hosted
# nightly is unused ATM
# hosted is used by CWS only ATM
BRANCH = nightly

MAJOR_VERSION := $(shell ./version.sh)
REV_VERSION := $(shell git describe --long | sed -E 's/([^-]+)-g.*/\1/;s/-/./g')
HASH := $(shell git rev-parse --short HEAD)

# URL prefix of update manifest
UPDATE_URL = https://www.foxtrick.org/nightly

BUILD_DIR = build
SAFARI_TARGET = foxtrick.safariextension
SAFARI_BUILD_DIR = build/$(SAFARI_TARGET)

FF_ADDON_ID = '{9d1f059c-cada-4111-9696-41a62d64e3ba}'

UNSIGNED_CHROME = false
ifeq ($(DIST_TYPE),$(filter $(DIST_TYPE),nightly hosting)) #OR
	UNSIGNED_CHROME = true
endif

MODULES = modules
IGNORED_MODULES = ignored-modules-$(DIST_TYPE)

ifeq ($(VERSION),)
	ifeq ($(DIST_TYPE),nightly)
		VERSION = $(REV_VERSION)
		BRANCH_FULL = $(BRANCH)-$(HASH)
	else
		VERSION = $(MAJOR_VERSION)
		BRANCH_FULL = $(BRANCH)
	endif
endif

ZIP = zip -q

# cf safari: xar needs to have sign capabilities ie xar --help shows --sign as option.
# sudo apt-get install gcc libssl-dev libxml2-dev make openssl lftp autoconf build-essential
# git clone git://github.com/mackyle/xar
# cd xar/xar
# ./autogen.sh --noconfigure
# ./configure
# make
# sudo make install
# see http://code.google.com/p/xar/issues/detail?id=76 for an howto
XAR = xar

ROOT_FOLDERS_CHROME = defaults/ skin/
ROOT_FOLDERS_SAFARI = defaults/ skin/

ROOT_FILES_CHROME = \
	COPYING \
	HACKING.md \
	manifest.json \

ROOT_FILES_SAFARI = \
	COPYING \
	HACKING.md \
	Info.plist \
	Settings.plist \
	skin/icon.png \

SCRIPT_FOLDERS = \
	api/ \
	lib/ \
	pages/ \
	util/ \

RESOURCES = \
	data/ \
	locale/ \
	resources/ \
	faq-links.yml \
	faq.yml \
	foxtrick.properties \
	foxtrick.screenshots \
	release-notes-links.yml \
	release-notes.yml \

CONTENT_FILES = \
	add-class.js \
	core.js \
	entry.js \
	env.js \
	fix-links.js \
	forum-stage.js \
	l10n.js \
	pages.js \
	prefs-util.js \
	read-ht-prefs.js \
	redirections.js \
	ui.js \
	xml-load.js \

CONTENT_FILES_CHROME = $(CONTENT_FILES) \
	background.html \
	background.js \
	loader-chrome.js \
	popup.html \
	popup.js \
	preferences.html \
	preferences.js \

CONTENT_FILES_SAFARI = $(CONTENT_FILES) \
	background.html \
	background.js \
	loader-chrome.js \
	preferences.html \
	preferences.js \


all: webext-gecko chrome

webext-gecko:
	#
	############ make firefox-webext ############
	#
	make clean-firefox clean-build
	mkdir $(BUILD_DIR)
	# copy root files
	cp -r $(ROOT_FILES_CHROME) $(ROOT_FOLDERS_CHROME) $(BUILD_DIR)
	# content/
	mkdir $(BUILD_DIR)/content
	cd content/; \
	cp -r $(SCRIPT_FOLDERS) $(RESOURCES) $(CONTENT_FILES_CHROME) \
		../$(BUILD_DIR)/content
	# modules
	cd content/; \
	cat ../$(MODULES) | while read m; do cp --parents "$$m" ../$(BUILD_DIR)/content; done;
	# remove ignore modules from files
	python module-update.py build -s $(MODULES) -e $(IGNORED_MODULES) -d $(BUILD_DIR)/
	# set branch, name and id
	cd $(BUILD_DIR); \
	sed -i -r "/extensions\\.foxtrick\\.prefs\\.branch/s|\"dev\"|\"$(BRANCH_FULL) webext\"|" defaults/preferences/foxtrick.js; \
	sed -i -r 's|("id": ").+(")|\1$(FF_ADDON_ID)\2|' manifest.json; \
	sed -i -r 's|("name": ").+(")|\1Foxtrick WebExt ($(BRANCH))\2|' manifest.json

# modify according to dist type
ifeq ($(DIST_TYPE),nightly)
	# add minor version
	cd $(BUILD_DIR); \
	../version.sh $(VERSION)
endif

ifeq ($(DIST_TYPE),hosting)
	# remove update_url
	cd $(BUILD_DIR); \
	sed -i -r '/update_url/d' manifest.json
else
	# set update_url
	cd $(BUILD_DIR); \
	sed -i -r 's|("update_url": ").+(")|\1'$(UPDATE_URL)'/update.json\2|' manifest.json
endif

	# strip comments
	cd $(BUILD_DIR); \
	sed -i -r '/\/\/ <!--/d' manifest.json
	# make android-prefs after all modifications are done
	cd $(BUILD_DIR)/defaults/preferences; \
	cat foxtrick.js foxtrick.android > foxtrick.android.js; \
	rm foxtrick.android
	# make xpi
	cd $(BUILD_DIR); \
	$(ZIP) -r ../$(APP_NAME).xpi *
	# clean up
	make clean-build

chrome:
	#
	############ make chrome ############
	#
	make clean-chrome clean-build
	mkdir $(BUILD_DIR)
	# copy root files
	cp -r $(ROOT_FILES_CHROME) $(ROOT_FOLDERS_CHROME) $(BUILD_DIR)
	# content/
	mkdir $(BUILD_DIR)/content
	cd content/; \
	cp -r $(SCRIPT_FOLDERS) $(RESOURCES) $(CONTENT_FILES_CHROME) \
		../$(BUILD_DIR)/content
	# modules
	cd content/; \
	cat ../$(MODULES) | while read m; do cp --parents "$$m" ../$(BUILD_DIR)/content; done;
	# remove ignore modules from files
	python module-update.py build -s $(MODULES) -e $(IGNORED_MODULES) -d $(BUILD_DIR)/
	# set branch
	cd $(BUILD_DIR); \
	sed -i -r "/extensions\\.foxtrick\\.prefs\\.branch/s|\"dev\"|\"$(BRANCH_FULL) chrome\"|" defaults/preferences/foxtrick.js
	# remove gecko info
	cd $(BUILD_DIR); \
	sed -i '/<!-- gecko-specific -->/,/<!-- end gecko-specific -->/d' manifest.json

# modify according to dist type
ifeq ($(DIST_TYPE),nightly)
	# add minor version and change name
	cd $(BUILD_DIR); \
	../version.sh $(VERSION); \
	sed -i -r 's|("name": ").+(")|\1Foxtrick (Beta)\2|' manifest.json
else ifeq ($(DIST_TYPE),light)
	# change name
	cd $(BUILD_DIR); \
	sed -i -r 's|("name": ").+(")|\1Foxtrick (light)\2|' manifest.json
endif

ifneq ($(DIST_TYPE),hosting)
	# make crx
	cd $(BUILD_DIR); \
	sed -i -r 's|("update_url": ").+(")|\1'$(UPDATE_URL)'/chrome/update.xml\2|' manifest.json; \
	sed -i -r '/\/\/ <!--/d' manifest.json
	./maintainer/crxmake.sh $(BUILD_DIR) maintainer/chrome.pem
	mv $(BUILD_DIR).crx $(APP_NAME).crx
endif

ifeq ($(UNSIGNED_CHROME),true)
	# make zip
	cd $(BUILD_DIR); \
	sed -i -r '/update_url/d' manifest.json; \
	sed -i -r '/\/\/ <!--/d' manifest.json; \
	$(ZIP) -r ../$(APP_NAME).zip *
endif
	# clean up
	make clean-build

safari:
	#
	############ make safari ############
	#
	make clean-safari clean-build
	mkdir -p $(SAFARI_BUILD_DIR)
	# copy root files
	cp -r $(ROOT_FILES_SAFARI) $(ROOT_FOLDERS_SAFARI) $(SAFARI_BUILD_DIR)
	# content/
	mkdir $(SAFARI_BUILD_DIR)/content
	cd content/; \
	cp -r $(SCRIPT_FOLDERS) $(RESOURCES) $(CONTENT_FILES_SAFARI) \
		../$(SAFARI_BUILD_DIR)/content
	# modules
	cd content/; \
	cat ../$(MODULES) | while read m; do cp --parents "$$m" ../$(SAFARI_BUILD_DIR)/content; done;
	# remove ignore modules from files
	python module-update.py build -s $(MODULES) -e $(IGNORED_MODULES) -d $(SAFARI_BUILD_DIR)/
	# set branch
	cd $(SAFARI_BUILD_DIR); \
	sed -i -r "/extensions\\.foxtrick\\.prefs\\.branch/s|\"dev\"|\"$(BRANCH_FULL) safari\"|" defaults/preferences/foxtrick.js

# modify according to dist type
ifeq ($(DIST_TYPE),nightly)
	# add minor version and change name
	cd $(SAFARI_BUILD_DIR); \
	../../version.sh $(VERSION); \
	sed -i -r 's/>Foxtrick</>Foxtrick (Beta)</' Info.plist
else ifeq ($(DIST_TYPE),light)
	# change name
	cd $(SAFARI_BUILD_DIR); \
	sed -i -r 's/>Foxtrick</>Foxtrick (light)</' Info.plist
endif

	cd $(SAFARI_BUILD_DIR); \
	sed -i -r 's|(<string>).+(</string><!--updateurl-->)|\1'$(UPDATE_URL)'/safari/update.plist\2|' Info.plist
	#remove comments
	cd $(SAFARI_BUILD_DIR); \
	sed -i -r 's|(.+)(<!.+-->)|\1|' Info.plist
	# make safariextz
	cd $(BUILD_DIR); \
	$(XAR) -cf ../foxtrick.safariextz $(SAFARI_TARGET)
	# inject signature
	$(XAR) --sign -f foxtrick.safariextz --data-to-sign sha1-hash.dat \
		--sig-size `: | openssl dgst -sign maintainer/safari.pem -binary | wc -c` \
		--cert-loc maintainer/safari.der \
		--cert-loc maintainer/safari-cert/cert01 \
		--cert-loc maintainer/safari-cert/cert02 > xar.log
	(echo "3021300906052B0E03021A05000414" | xxd -r -p; cat sha1-hash.dat) \
		| openssl rsautl -sign -inkey maintainer/safari.pem > signature.dat
	$(XAR) --inject-sig signature.dat -f foxtrick.safariextz
	# clean up
	make clean-build

clean-firefox:
	rm -rf *.xpi

clean-chrome:
	rm -rf *.crx
	rm -rf *.zip

clean-safari:
	rm -rf *.safariextz
	rm -rf xar.log

clean-build:
	rm -rf $(BUILD_DIR)
	rm -f sha1-hash.dat
	rm -f signature.dat

clean: clean-firefox clean-chrome clean-safari clean-build
