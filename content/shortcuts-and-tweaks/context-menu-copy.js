/**
 * context-menu-copy.js
 * Options at the context menu for copying ID and/or link and content in HT-ML
 * @author LA-MJ, convinced, ryanli
 */

'use strict';

(function() {
	if (Foxtrick.platform == 'Android')
		return;

	// option: corresponding to OPTIONS
	// func: function to be called for getting text
	// item: menu item for Firefox and Chrome
	// copyText: text to be copied
	var contextEntries = {
		'foxtrick-popup-copy-id': {
			option: 'Id',
			func: Foxtrick.util.htMl.getId,
			item: null,
			copyText: null,
		},
		'foxtrick-popup-copy-link': {
			option: 'Link',
			func: Foxtrick.util.htMl.getLink,
			item: null,
			copyText: null,
		},
		'foxtrick-popup-copy-external-link': {
			option: 'external',
			func: function(node) {
				return Foxtrick.util.htMl.getLink(node, { external: true });
			},
			item: null,
			copyText: null,
		},
		'foxtrick-popup-copy-ht-ml': {
			option: 'HtMl',
			func: Foxtrick.util.htMl.getHtMl,
			item: null,
			copyText: null,
		},
		'foxtrick-popup-copy-table': {
			option: 'Table',
			func: Foxtrick.util.htMl.getTable,
			item: null,
			copyText: null,
		},
	};

	Foxtrick.modules.ContextMenuCopy = {
		MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
		OUTSIDE_MAINBODY: true,
		PAGES: ['all'],
		OPTIONS: ['Id', 'Link', 'HtMl', 'Table'],

		onLoad: function(document) {
			var entries = contextEntries;

			// returns copy function on click
			var copy = function(entry) {
				return function() {
					// FIXME copying from background
					// does not work in WebExt
					Foxtrick.copy(document, entry.copyText);
				};
			};

			// called from background script
			var chromeInit = function() {
				// MV3: Use chrome.contextMenus.onClicked event instead of onclick property
				chrome.contextMenus.onClicked.addListener((info, tab) => {
					// Find the entry that matches the menuItemId
					for (let type in entries) {
						let entry = entries[type];
						if (entry.item === info.menuItemId) {
							// FIXME copying from background
							// does not work in WebExt
							Foxtrick.copy(document, entry.copyText);
							break;
						}
					}
				});

				// update menu in background on mousedown
				Foxtrick.SB.ext.onRequest.addListener((request) => {
					if (request.req !== 'updateContextMenu')
						return;

					var documentUrlPatterns = [
						'*://*.hattrick.org/*',
						'*://*.hattrick.ws/*',
						'*://*.hattrick.bz/*',
						'*://*.hat-trick.net/*',
						'*://*.hattrick.uol.com.br/*',
						'*://*.hattrick.interia.pl/*',
						'*://*.hattrick.name/*',
						'*://*.hattrick.fm/*',
					];

					// remove old entries
					for (let type in entries) {
						let e = entries[type];
						if (e.item !== null) {
							chrome.contextMenus.remove(e.item);
							e.item = null;
						}
					}

					// add new entries
					for (let type in request.entries) {
						let target = entries[type];
						let source = request.entries[type];

						target.copyText = source.copyText;
						// MV3: Remove onclick, store menu ID for event handler
						target.item = chrome.contextMenus.create({
							id: type, // Add explicit ID for event matching
							title: source.title,
							contexts: ['all'],
							documentUrlPatterns,
						});
					}
				});
			};

			// called from background script
			var safariInit = function() {
				safari.application.addEventListener('contextmenu', (event) => {
					var pasteNote = '. ' + Foxtrick.L10n.getString('specialPaste.hint');
					for (let type in event.userInfo) {
						let source = event.userInfo[type];
						let target = entries[type];
						target.copyText = source.copyText;
						event.contextMenu.appendContextMenuItem(type, source.title + pasteNote);
					}

					safari.application.addEventListener('command', function(commandEvent) {
						copy(entries[commandEvent.command])();
					}, false);
				}, true);
			};

			if (Foxtrick.platform == 'Chrome')
				chromeInit();
			else if (Foxtrick.platform == 'Safari')
				safariInit();
		},

		onTabChange: function(doc) {
			if (!Foxtrick.isHt(doc)) {
				var entries = contextEntries;
				var type;
				for (type in entries) {
					if (entries[type])
						entries[type].item.setAttribute('hidden', true);
				}
			}
		},

		run: function(doc) {
			var entries = contextEntries;
			var collectData = function(node) {
				try {
					var type;
					for (type in entries) {
						entries[type].copyText = null;
						if (Foxtrick.Prefs.isModuleOptionEnabled('ContextMenuCopy',
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
			if (Foxtrick.arch == 'Sandboxed') {
				// data to be transfered to background
				var getEntries = function() {
					var activeEntries = {};
					var type;
					for (type in entries) {
						if (entries[type].copyText !== null) {
							activeEntries[type] = {};
							activeEntries[type].copyText = entries[type].copyText;
							activeEntries[type].title = entries[type].title;
						}
					}
					return activeEntries;
				};

				if (Foxtrick.platform == 'Safari') {
					doc.addEventListener('contextmenu', function(ev) {
						collectData(ev.target);
						safari.self.tab.setContextMenuEventUserInfo(ev, getEntries());
					}, false);
				}
				else if (Foxtrick.platform == 'Chrome') {
					doc.addEventListener('mousedown', function(ev) {
						if (ev.button == 2) { // right mouse down
							collectData(ev.target);
							var msg = { req: 'updateContextMenu', entries: getEntries() };
							Foxtrick.SB.ext.sendRequest(msg);
						}
					}, false);
				}
			}
		},
	};
})();
