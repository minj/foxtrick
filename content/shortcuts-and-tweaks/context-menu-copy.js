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
		if (Foxtrick.arch !== "Gecko") return;
		
		this.bindCopyFunctions();
		for (var type in this.contextEntries) {
			this.contextEntries[type].menuEntryId = document.getElementById( type );
			this.contextEntries[type].menuEntryId.addEventListener("command", FoxtrickContextMenuCopy.contextEntries[type].onClick, false )
		}
	},

	onTabChange : function(doc) {
		if (!Foxtrick.isHt(doc)) {
			for (var type in this.contextEntries)
				this.contextEntries[type].menuEntryId.setAttribute("hidden", true);
		}
	},

	// called from background script
	chromeInit : function () {
		FoxtrickContextMenuCopy.bindCopyFunctions();
		// update menu in background on mousedown 
		chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
			if ( request.req === 'updateContextMenu' ) {
				const documentUrlPatterns = [ 
					"*://*.hattrick.org/*",
					"*://*.hattrick.ws/*",
					"*://*.hattrick.name/*",
					"*://*.hat-trick.net/*",
					"*://*.hattrick.interia.pl/*",
					"*://*.hattrick.uol.com.br/*" ];
				// remove old entries
				for (var type in FoxtrickContextMenuCopy.contextEntries) {
					if (FoxtrickContextMenuCopy.contextEntries[type].menuEntryId !== null) {
						chrome.contextMenus.remove( FoxtrickContextMenuCopy.contextEntries[type].menuEntryId )
						FoxtrickContextMenuCopy.contextEntries[type].menuEntryId = null;
					}
				}
				// add new entries
				for (var type in request.entries) {
					FoxtrickContextMenuCopy.contextEntries[type].copyText = request.entries[type].copyText;
					FoxtrickContextMenuCopy.contextEntries[type].menuEntryId = 
						chrome.contextMenus.create({ 
							'title'		: request.entries[type].title, 
							'contexts'	: ["all"],
							'onclick'	: FoxtrickContextMenuCopy.contextEntries[type].onClick, 
							'documentUrlPatterns': documentUrlPatterns
						});
				}
			}
		});
	},

	// called from background script
	safariInit : function () {
		FoxtrickContextMenuCopy.bindCopyFunctions();
		safari.application.addEventListener("contextmenu", function(event) {
			var paste_note =  '. ' + Foxtrickl10n.getString("SpecialPaste.desc");
			
			for (var type in event.userInfo)  {
				FoxtrickContextMenuCopy.contextEntries[type].copyText = event.userInfo[type].copyText;
				event.contextMenu.appendContextMenuItem(type, event.userInfo[type].title + paste_note);
			}

			safari.application.addEventListener( "command", function( commandEvent ) {
				FoxtrickContextMenuCopy.contextEntries[commandEvent.command].onClick(); 
			}, false );
		}, true)
	},

	run : function(doc) {
		// context menu listeners. 
		if ( Foxtrick.arch === "Gecko" ) {
			doc.addEventListener("contextmenu", function(ev) {
				FoxtrickContextMenuCopy.collectCopyData(ev.target); 
				
				for (var type in FoxtrickContextMenuCopy.contextEntries) {
					if (FoxtrickContextMenuCopy.contextEntries[type].copyText !== null) {
						FoxtrickContextMenuCopy.contextEntries[type].menuEntryId.setAttribute("hidden", false);
						FoxtrickContextMenuCopy.contextEntries[type].menuEntryId.setAttribute("label", FoxtrickContextMenuCopy.contextEntries[type].title);
					}
					else
						FoxtrickContextMenuCopy.contextEntries[type].menuEntryId.setAttribute("hidden", true);
				}
			}, false);
		}
		
		else if (Foxtrick.arch == "Sandboxed") {
			// data to be transfered to background
			var getEntries = function () {
				var entries = {} ;
				for ( var type in FoxtrickContextMenuCopy.contextEntries ) {
					if (FoxtrickContextMenuCopy.contextEntries[type].copyText !== null) {
						entries[type] = {};
						entries[type].copyText = FoxtrickContextMenuCopy.contextEntries[type].copyText;
						entries[type].title = FoxtrickContextMenuCopy.contextEntries[type].title;
					}
				}
				return entries;
			};
			
			if ( Foxtrick.platform == "Safari" ) {
				doc.addEventListener("contextmenu", function(ev) {
					FoxtrickContextMenuCopy.collectCopyData(ev.target);
					safari.self.tab.setContextMenuEventUserInfo( ev, getEntries() );
				}, false);
			}
			
			if ( Foxtrick.platform == "Chrome" ) {
				doc.addEventListener('mousedown', function(ev) {
					if (ev.button == 2) { // right mouse down
						FoxtrickContextMenuCopy.collectCopyData(ev.target);
						chrome.extension.sendRequest({ req : "updateContextMenu", entries: getEntries() });
					}
				} ,false)
			}
		}
	},
		
	bindCopyFunctions : function() {
		// create onClick functions for all types and bind type to them
		for (var type in FoxtrickContextMenuCopy.contextEntries) {
			var entry = FoxtrickContextMenuCopy.contextEntries[type];
			entry.onClick = function() {
				Foxtrick.copyStringToClipboard(this.copyText);
			}.bind(entry);
		}
 	},

	collectCopyData : function(node) {
		try {
			for ( var type in FoxtrickContextMenuCopy.contextEntries ) {
				FoxtrickContextMenuCopy.contextEntries[type].copyText = null;
				if ( FoxtrickPrefs.isModuleOptionEnabled( "ContextMenuCopy", FoxtrickContextMenuCopy.contextEntries[type].option )) {
					var markupObj = FoxtrickContextMenuCopy.contextEntries[type].func(node);
					if (markupObj !== null) {
						FoxtrickContextMenuCopy.contextEntries[type].title = markupObj.copyTitle;
						FoxtrickContextMenuCopy.contextEntries[type].copyText = markupObj.markup;
					}
				}
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
};
if (Foxtrick.arch != "Gecko")
	Foxtrick.util.module.register(FoxtrickContextMenuCopy);
