/**
 * context-menu-copy.js
 * Options at the context menu for copying ID and/or link and content in HT-ML
 * @author convinced, ryanli
 */

var FoxtrickContextMenuCopy = {
	MODULE_NAME : "ContextMenuCopy",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["all"],
	OPTIONS : ["Id", "Link", "HtMl", "Table"],

	// keys: same as contextentry ids in overlay.xul
	// options: same as OPTIONS
	// menuEntryId: ids for menu entries in firefox and chrome
	// copyText: text to be copied
	contextEntries : {
		"foxtrick-popup-copy-id" : { option: 'Id', func: Foxtrick.util.htMl.getId, menuEntryId: null, copyText: null },
		"foxtrick-popup-copy-link" : { option: 'Link', func: Foxtrick.util.htMl.getLink, menuEntryId: null, copyText: null },
		"foxtrick-popup-copy-ht-ml" : { option: 'HtMl', func: Foxtrick.util.htMl.getHtMl, menuEntryId: null, copyText: null },
		"foxtrick-popup-copy-table" : { option: 'Table', func: Foxtrick.util.htMl.getTable, menuEntryId: null, copyText: null }
	},

	onLoad : function(document) {
		var entries = this.contextEntries;
		// returns copy function on click
		var copy = function(entry) {
			return function() {
				Foxtrick.copyStringToClipboard(entry.copyText);
			};
		};
		var firefoxInit = function() {
			var type;
			for (type in entries) {
				var entry = entries[type];
				entry.menuEntryId = document.getElementById(type);
				entry.menuEntryId.addEventListener("command", copy(entry), false);
			}
		};
		// called from background script
		var chromeInit = function() {
			// update menu in background on mousedown
			chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
				var documentUrlPatterns = [
					"*://*.hattrick.org/*",
					"*://*.hattrick.ws/*",
					"*://*.hattrick.name/*",
					"*://*.hat-trick.net/*",
					"*://*.hattrick.interia.pl/*",
					"*://*.hattrick.uol.com.br/*"
				];
				if (request.req === 'updateContextMenu') {
					// remove old entries
					var type;
					for (type in entries) {
						if (entries[type].menuEntryId !== null) {
							chrome.contextMenus.remove(entries[type].menuEntryId);
							entries[type].menuEntryId = null;
						}
					}
					// add new entries
					for (type in request.entries) {
						entries[type].copyText = request.entries[type].copyText;
						entries[type].menuEntryId = chrome.contextMenus.create({
							title : request.entries[type].title,
							contexts : ["all"],
							onclick : copy(entries[type]),
							documentUrlPatterns : documentUrlPatterns
						});
					}
				}
			});
		};
		// called from background script
		var safariInit = function() {
			safari.application.addEventListener("contextmenu", function(event) {
				var paste_note =  '. ' + Foxtrickl10n.getString("SpecialPaste.desc");
				var type;
				for (type in event.userInfo) {
					entries[type].copyText = event.userInfo[type].copyText;
					event.contextMenu.appendContextMenuItem(type, event.userInfo[type].title + paste_note);
				}

				safari.application.addEventListener("command", function(commandEvent) {
					copy(entries.contextEntries[commandEvent.command])();
				}, false);
			}, true);
		};

		if (Foxtrick.platform == "Firefox") 
			firefoxInit();
		else if (Foxtrick.platform == "Chrome") 
			chromeInit();
		else if (Foxtrick.platform == "Safari") 
			safariInit();
	},

	onTabChange : function(doc) {
		if (!Foxtrick.isHt(doc)) {
			var entries = this.contextEntries;
			var type;
			for (type in entries) {
				entries[type].menuEntryId.setAttribute("hidden", true);
			}
		}
	},

	run : function(doc) {
		var entries = this.contextEntries;
		var collectData = function(node) {
			try {
				var type;
				for (type in entries) {
					entries[type].copyText = null;
					if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy",
						entries[type].option)) {
						var markupObj = entries[type].func(node);
						if (markupObj !== null) {
							entries[type].title = markupObj.copyTitle;
							entries[type].copyText = markupObj.markup;
						}
					}
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};
		// context menu listeners
		if (Foxtrick.platform == "Firefox") {
			doc.addEventListener("contextmenu", function(ev) {
				collectData(ev.target);
				var type;
				for (type in entries) {
					if (entries[type].copyText !== null) {
						entries[type].menuEntryId.setAttribute("hidden", false);
						entries[type].menuEntryId.setAttribute("label", entries[type].title);
					}
					else
						entries[type].menuEntryId.setAttribute("hidden", true);
				}
			}, false);
		}
		else if (Foxtrick.arch == "Sandboxed") {
			// data to be transfered to background
			var getEntries = function() {
				var entries = {};
				var type;
				for (type in entries) {
					if (entries[type].copyText !== null) {
						entries[type] = {};
						entries[type].copyText = entries[type].copyText;
						entries[type].title = entries[type].title;
					}
				}
				return entries;
			};
			
			if (Foxtrick.platform == "Safari") {
				doc.addEventListener("contextmenu", function(ev) {
					collectData(ev.target);
					safari.self.tab.setContextMenuEventUserInfo(ev, getEntries());
				}, false);
			}
			else if (Foxtrick.platform == "Chrome") {
				doc.addEventListener('mousedown', function(ev) {
					if (ev.button == 2) { // right mouse down
						collectData(ev.target);
						chrome.extension.sendRequest({ req : "updateContextMenu", entries: getEntries() });
					}
				}, false);
			}
		}
	}
};
Foxtrick.util.module.register(FoxtrickContextMenuCopy);
