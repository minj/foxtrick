APP_NAME = foxtrick

BUILD_DIR = build
ZIP = zip -q

ROOT_FILES_FIREFOX = chrome.manifest install.rdf icon.png COPYING HACKING
ROOT_FILES_CHROME = manifest.json
ROOT_FOLDERS_FIREFOX = defaults/ platform/
CONTENT_FOLDERS = alert/ data/ forum/ links/ locale/ matches/ pages/ \
	presentation/ resources/ shortcuts_and_tweaks/ util/
CONTENT_FILES = const.js forum_stage.js foxtrick.js foxtrick.properties \
	foxtrick.screenshots helper.js jquery.js l10n.js modules.js \
	pages.js preferences.js preferences.xhtml preferences-dialog-html.js \
	preferences-on-page.js prefs.js read-ht-prefs.js redirections.js \
	releaseNotes.xml stats.js xml_load.js
CONTENT_FILES_FIREFOX = $(CONTENT_FILES) foxtrick.xul
CONTENT_FILES_CHROME = background.html background.js loader-chrome.js


firefox: clean
	mkdir $(BUILD_DIR)
	cp $(ROOT_FILES_FIREFOX) build
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
	fi; \
	$(ZIP) -r ../$(APP_NAME).xpi *
	make clean

clean:
	rm -rf $(BUILD_DIR)
