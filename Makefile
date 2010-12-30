APP_NAME = foxtrick

BUILD_DIR = build
ZIP = zip -q

ROOT_FILES_FIREFOX = chrome.manifest install.rdf icon.png COPYING HACKING
ROOT_FILES_CHROME = manifest.json
ROOT_FOLDERS_FIREFOX = defaults/ platform/
ROOT_FOLDERS_CHROME = defaults/ skin/
CONTENT_FOLDERS = alert/ \
	data/ \
	forum/ \
	links/ \
	locale/ \
	matches/ \
	pages/ \
	presentation/ \
	resources/ \
	shortcuts_and_tweaks/ \
	util/
CONTENT_FILES = const.js \
	forum_stage.js \
	foxtrick.js \
	foxtrick.properties \
	foxtrick.screenshots \
	header-copy-icons.js \
	helper.js \
	jquery.js \
	l10n.js \
	modules.js \
	pages.js \
	preferences.js \
	preferences.xhtml \
	preferences-dialog-html.js \
	preferences-on-page.js \
	prefs.js \
	read-ht-prefs.js \
	redirections.js \
	releaseNotes.xml \
	stats.js \
	xml_load.js
CONTENT_FILES_FIREFOX = $(CONTENT_FILES) foxtrick.xul
CONTENT_FILES_CHROME = $(CONTENT_FILES) background.html background.js \
	loader-chrome.js

REVISION = `git svn find-rev master`

DIST_TYPE = nightly
NIGHTLY_UPDATE_URL = https://foxtrick.c6.ixwebhosting.com/nightly/update.rdf

all: firefox chrome

firefox:
	make clean-firefox clean-build
	mkdir $(BUILD_DIR)
	# copy root files
	cp -r $(ROOT_FILES_FIREFOX) $(ROOT_FOLDERS_FIREFOX) $(BUILD_DIR)
	# content/
	mkdir -p $(BUILD_DIR)/chrome/content
	cd content/; \
	cp -r $(CONTENT_FOLDERS) $(CONTENT_FILES_FIREFOX) \
		../$(BUILD_DIR)/chrome/content
	# skin/
	cp -r skin $(BUILD_DIR)/chrome
	# build jar
	cd $(BUILD_DIR)/chrome; \
	$(ZIP) -0 -r $(APP_NAME).jar `find . \( -path '*CVS*' -o -path \
		'*.svn*' \) -prune -o -type f -print | grep -v \~ `; \
	rm -rf content skin
	# process manifest
	cd $(BUILD_DIR); \
	if test -f chrome.manifest; \
		then \
		sed -i -r 's|^(content\s+\S*\s+)(\S*/)(.*)$$|\1jar:chrome/'$(APP_NAME)'.jar!/\2\3|' chrome.manifest; \
		sed -i -r 's|^(skin\|locale)(\s+\S*\s+\S*\s+)(.*/)$$|\1\2jar:chrome/'$(APP_NAME)'.jar!/\3|' chrome.manifest; \
	fi
	# modify according to distribution type
ifeq ($(DIST_TYPE),nightly)
	cd $(BUILD_DIR); \
	sed -i -r 's|<em:updateURL>.+</em:updateURL>|<em:updateURL>'$(NIGHTLY_UPDATE_URL)'</em:updateURL>|' install.rdf; \
	sed -i -r '/<em:updateKey>.+<\/em:updateKey>/d' install.rdf; \
	sed -i -r 's|(<em:version>.+)(</em:version>)|\1.r'$(REVISION)'\2|' install.rdf; \
	sed -i -r 's|(\"extensions\.foxtrick\.prefs\.version\", \".+)(\")|\1.r'$(REVISION)'\2|' defaults/preferences/foxtrick.js
else ifeq ($(DIST_TYPE),beta)
else ifeq ($(DIST_TYPE),stable)
	# to be added
endif
	# make xpi
	cd $(BUILD_DIR); \
	$(ZIP) -r ../$(APP_NAME).xpi *
	# clean up
	make clean-build

chrome:
	make clean-chrome clean-build
	mkdir $(BUILD_DIR)
	# copy root files
	cp -r $(ROOT_FILES_CHROME) $(ROOT_FOLDERS_CHROME) $(BUILD_DIR)
	# content/
	mkdir $(BUILD_DIR)/content
	cd content/; \
	cp -r $(CONTENT_FOLDERS) $(CONTENT_FILES_CHROME) \
		../$(BUILD_DIR)/content
	# modify according to distribution type
ifeq ($(DIST_TYPE),nightly)
	cd $(BUILD_DIR); \
	sed -i -r 's|("version" : "([0-9]+\.)*)([0-9]+)"|\1'$(REVISION)'"|' manifest.json;
	sed -i -r 's|(\"extensions\.foxtrick\.prefs\.version\", \".+)(\")|\1.r'$(REVISION)'\2|' defaults/preferences/foxtrick.js
else ifeq ($(DIST_TYPE),release)
	cd $(BUILD_DIR); \
	sed -i -r '/update_url/d' manifest.json;
endif
	# make crx
	./maintainer/crxmake.sh $(BUILD_DIR) maintainer/chrome_dev.pem
	mv $(BUILD_DIR).crx $(APP_NAME).crx
	# clean up
	make clean-build

clean-firefox:
	rm -rf *.xpi

clean-chrome:
	rm -rf *.crx

clean-build:
	rm -rf $(BUILD_DIR)

clean:
	make clean-firefox clean-chrome clean-build
