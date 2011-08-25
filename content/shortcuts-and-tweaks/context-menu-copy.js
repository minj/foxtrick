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

	contextEntries : 
			{ "foxtrick-popup-copy-id": null,
			"foxtrick-popup-copy-link": null,
			"foxtrick-popup-copy-ht-ml": null,
			"foxtrick-popup-copy-table": null },

	ID : null,
	TYPE : null,
	LINK : null,
	SELECTION : null,
	TABLE : null,

	onLoad : function(document) {
		for (var contextEntry in this.contextEntries)
			this[contextEntry] = document.getElementById( contextEntry );
	},

	onTabChange : function(doc) {
		if (!Foxtrick.isHt(doc)) {
			for (var contextEntry in this.contextEntries)
				this.updateMenu( contextEntry, { "hidden" : true });
		}
	},

	updateMenu : function (type, data) {
		if (Foxtrick.arch !== "Gecko") return;
		for (var attr in data)
			FoxtrickContextMenuCopy[type].setAttribute(attr, data[attr]);
	},

	// called from background script
	chromeInit : function () {
		const documentUrlPatterns = [ "*://*.hattrick.org/*",
									"*://*.hattrick.ws/*",
									"*://*.hattrick.name/*",
									"*://*.hat-trick.net/*",
									"*://*.hattrick.interia.pl/*",
									"*://*.hattrick.uol.com.br/*" ]

		// menu click listeners
		function idLinkOnClick(info, tab) {
		  var id_container = Foxtrick.util.htMl.getIdFromLink(info.linkUrl);
		  if (id_container) Foxtrick.loader.chrome.copyToClipBoard(id_container.id);
		}
		function linkOnClick(info, tab) {
			var markup = Foxtrick.util.htMl.getMarkupFromLink(info.linkUrl);
			if (markup) Foxtrick.loader.chrome.copyToClipBoard(markup);
		}
		function selectionOnClick(info, tab) {
			chrome.tabs.sendRequest(tab.id, { req : "copySelection" });
		}
		function tableOnClick(info, tab) {
			chrome.tabs.sendRequest(tab.id, { req : "copyTable" });
		}

		// menue entries
		if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Id")) {
			var local_string = Foxtrickl10n.getString('Copy');
			var id_contexts = [
				{'title':local_string+ ': Team ID', 		"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns': documentUrlPatterns,	'targetUrlPatterns':['*://*.hattrick.org/*TeamID=*','*://*.hattrick.org/*teamId=*'] },
				{'title':local_string+ ': User ID', 		"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns': documentUrlPatterns,	'targetUrlPatterns':['*://*.hattrick.org/*UserID=*','*://*.hattrick.org/*userId=*'] },
				{'title':local_string+ ': Series ID',		"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns': documentUrlPatterns,	'targetUrlPatterns':['*://*.hattrick.org/*LeagueLevelUnitID=*','*://*.hattrick.org/*LeagueLevelUnitId=*'] },
				{'title':local_string+ ': YouthSeries ID',	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns': documentUrlPatterns,	'targetUrlPatterns':['*://*.hattrick.org/*YouthLeagueID=*','*://*.hattrick.org/*YouthLeagueId=*'] },
				{'title':local_string+ ': Match ID', 		"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns': documentUrlPatterns,	'targetUrlPatterns':['*://*.hattrick.org/*matchID=*','*://*.hattrick.org/*matchId=*'] },
				{'title':local_string+ ': Player ID',		"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns': documentUrlPatterns,	'targetUrlPatterns':['*://*.hattrick.org/*PlayerID=*','*://*.hattrick.org/*playerId=*'] },
				{'title':local_string+ ': Arena ID',		"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns': documentUrlPatterns,	'targetUrlPatterns':['*://*.hattrick.org/*ArenaID=*','*://*.hattrick.org/*arenaId=*'] },
				{'title':local_string+ ': Post ID', 		"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns': documentUrlPatterns,	'targetUrlPatterns':['*://*.hattrick.org/Forum/Read.aspx?t=*&n=*'] },
			];
		}
		else var id_contexts = [];

		if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Link")) {
			id_contexts.push( {'title':Foxtrickl10n.getString("copy.link"), 	"contexts":["link"], 		"onclick": linkOnClick,			'documentUrlPatterns': documentUrlPatterns });
		}
		if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "HtMl")) {
			id_contexts.push( {'title':Foxtrickl10n.getString("copy.ht-ml"), 	"contexts":["selection"],	"onclick": selectionOnClick,	'documentUrlPatterns': documentUrlPatterns });
		}

		for (var i = 0; i < id_contexts.length; i++) {
				chrome.contextMenus.create(id_contexts[i]);
		}

		// update menu in background on mousedown 
		chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
			if ( request.req === 'updateContextMenu' ) {
				if ( request.table == 'show' ) {
					if ( FoxtrickContextMenuCopy["foxtrick-popup-copy-table"] === null ) {
						var entry = { 'title':Foxtrickl10n.getString("copy.table"), "contexts":["all"],		"onclick": tableOnClick, 		'documentUrlPatterns': documentUrlPatterns };
						FoxtrickContextMenuCopy["foxtrick-popup-copy-table"] = chrome.contextMenus.create(entry);
					}
				}
				else {
					if ( FoxtrickContextMenuCopy["foxtrick-popup-copy-table"] !== null ) {
						chrome.contextMenus.remove( FoxtrickContextMenuCopy["foxtrick-popup-copy-table"] )
						FoxtrickContextMenuCopy["foxtrick-popup-copy-table"] = null;
					}
				}
			}
		});
	},

	// called from background script
	safariInit : function () {
		safari.application.addEventListener("contextmenu", function(event) {
			// transfer copytext from content
			FoxtrickContextMenuCopy.ID = event.userInfo.ID;
			FoxtrickContextMenuCopy.TYPE = event.userInfo.TYPE;
			FoxtrickContextMenuCopy.LINK = event.userInfo.LINK;
			FoxtrickContextMenuCopy.SELECTION = event.userInfo.SELECTION;
			FoxtrickContextMenuCopy.TABLE = event.userInfo.TABLE;

			var paste_note =  '. ' + Foxtrickl10n.getString("SpecialPaste.desc");
			if (FoxtrickContextMenuCopy.ID) {
				var idText = Foxtrickl10n.getString("copy.id").replace("%s", FoxtrickContextMenuCopy.TYPE + " ID").replace("%i", FoxtrickContextMenuCopy.ID);
				event.contextMenu.appendContextMenuItem("copyid", idText + paste_note);
			}
			if (FoxtrickContextMenuCopy.LINK)
				event.contextMenu.appendContextMenuItem("copylink", Foxtrickl10n.getString("copy.link") + paste_note);
			if (FoxtrickContextMenuCopy.SELECTION)
				event.contextMenu.appendContextMenuItem("copyselection", Foxtrickl10n.getString("copy.ht-ml") + paste_note);
			if (FoxtrickContextMenuCopy.TABLE)
				event.contextMenu.appendContextMenuItem("copytable", Foxtrickl10n.getString("copy.table") + paste_note);

			safari.application.addEventListener( "command", function( commandEvent ) {
				if (commandEvent.command == "copyid")
					FoxtrickContextMenuCopy.copyId();
				else if (commandEvent.command == "copylink")
					FoxtrickContextMenuCopy.copyLink();
				else if (commandEvent.command == "copyselection")
					FoxtrickContextMenuCopy.copyHtMl();
				else if (commandEvent.command == "copytable")
					FoxtrickContextMenuCopy.copyTable();
			}, false );
		}, true)
	},

	run : function(doc) {
		// context menu listeners. chrome context menu is set up in background.js
		if (Foxtrick.arch === "Gecko") {
			doc.addEventListener("contextmenu", this.onContext, false);
			this.updateMenu("foxtrick-popup-copy-link", {"label": Foxtrickl10n.getString("copy.link")});
			this.updateMenu("foxtrick-popup-copy-ht-ml", {"label": Foxtrickl10n.getString("copy.ht-ml")});
			this.updateMenu("foxtrick-popup-copy-table", {"label": Foxtrickl10n.getString("copy.table")});
		}
		
		if ( Foxtrick.platform == "Safari" ) {
			// need to store target for reference in contextmenu-clicklistener
			doc.addEventListener("contextmenu", function(event) {
				FoxtrickContextMenuCopy.onContext(event);
				// transfer copytext to background
				safari.self.tab.setContextMenuEventUserInfo(event, 
					{ ID :  	FoxtrickContextMenuCopy.ID,
					TYPE :		FoxtrickContextMenuCopy.TYPE,
					LINK :		FoxtrickContextMenuCopy.LINK,
					SELECTION :	FoxtrickContextMenuCopy.SELECTION,
					TABLE :	 	FoxtrickContextMenuCopy.TABLE }
				);
			}, false);
		}
		
		// copy selection request from chrome context menu
		if (Foxtrick.platform == "Chrome") {
			chrome.extension.onRequest.addListener(
			  function(request, sender, sendResponse) {
				if (request.req == "copySelection") {
					var markup = FoxtrickContextMenuCopy.getSelection(window);
					if (markup)
						Foxtrick.copyStringToClipboard(markup);
				}
				if (request.req == "copyTable") {
					if (FoxtrickContextMenuCopy.TABLE)
						Foxtrick.copyStringToClipboard(FoxtrickContextMenuCopy.TABLE);
				}
			});
			
			// request update menu from background on mousedown
			doc.addEventListener('mousedown', function(ev) {
				FoxtrickContextMenuCopy.TABLE = FoxtrickContextMenuCopy.getTable(ev.target);
				chrome.extension.sendRequest({ req : "updateContextMenu", table : (FoxtrickContextMenuCopy.TABLE==null ? 'hide' : 'show') });
			},false)
		}
	},

	copyId : function() {
		if (FoxtrickContextMenuCopy.ID)
			Foxtrick.copyStringToClipboard(FoxtrickContextMenuCopy.ID);
	},

	copyLink : function() {
		if (FoxtrickContextMenuCopy.LINK) 
			Foxtrick.copyStringToClipboard(FoxtrickContextMenuCopy.LINK);
	},

	copyHtMl : function() {
		if (FoxtrickContextMenuCopy.SELECTION) 
			Foxtrick.copyStringToClipboard(FoxtrickContextMenuCopy.SELECTION);
	},

	copyTable : function() {
		if (FoxtrickContextMenuCopy.TABLE) 
			Foxtrick.copyStringToClipboard(FoxtrickContextMenuCopy.TABLE);
	},

	getSelection : function(window) {
		var selection = window.getSelection();
		if (!selection.isCollapsed && selection.rangeCount > 0) {
			var markup = "";
			for (var i = 0; i < selection.rangeCount; ++i) {
				markup += Foxtrick.util.htMl.getMarkupFromNode(selection.getRangeAt(i).cloneContents());
				if (i !== selection.rangeCount - 1) {
					markup += "\n";
				}
			}
			markup = Foxtrick.trim(markup);
			return markup;
		}
		return null;
	},
	
	getTable : function(target) {
		var table = null;
		var currentObj = target;
		while (currentObj) {
			if (currentObj.nodeName.toLowerCase() === "table") {
				table = currentObj;
				break;
			}
			currentObj = currentObj.parentNode;
		}
		if (table !== null) {
			var markup = Foxtrick.util.htMl.getMarkupFromNode(table);
			markup = Foxtrick.trim(markup);
			return markup;
		}
		return null;
	},
	
	onContext : function(event) {
		try {
			FoxtrickContextMenuCopy.ID = null;
			FoxtrickContextMenuCopy.LINK = null;
			FoxtrickContextMenuCopy.SELECTION = null;
			FoxtrickContextMenuCopy.TABLE = null;

			var target = event.target;
			var menuEntry;
			var href = null;
			var currentObj = target;
			while (currentObj) {
				if (currentObj.href !== undefined) {
					href = currentObj.href;
					break;
				}
				currentObj = currentObj.parentNode;
			}

			menuEntry = {"hidden": true};
			if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Id")) {
				var id = Foxtrick.util.htMl.getIdFromLink(href);
				if (id !== null) {
					var idText = Foxtrickl10n.getString("copy.id").replace("%s", id.type + " ID").replace("%i", id.id);
					FoxtrickContextMenuCopy.ID = id.id;
					FoxtrickContextMenuCopy.TYPE = id.type;
					menuEntry = {"hidden": false, "label": idText};
				}
			}
			FoxtrickContextMenuCopy.updateMenu('foxtrick-popup-copy-id', menuEntry);

			menuEntry = {"hidden": true};
			if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Link")) {
				var markup = Foxtrick.util.htMl.getMarkupFromLink(href);
				if (markup !== null) {
					FoxtrickContextMenuCopy.LINK = markup;
					menuEntry = {"hidden": false};
				}
			}
			FoxtrickContextMenuCopy.updateMenu('foxtrick-popup-copy-link', menuEntry);

			menuEntry = {"hidden": true};
			if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "HtMl")) {
				var markup = FoxtrickContextMenuCopy.getSelection(target.ownerDocument.defaultView);
				if ( markup !== null ) {
					FoxtrickContextMenuCopy.SELECTION = markup;
					menuEntry = {"hidden": false};
				}
			}
			FoxtrickContextMenuCopy.updateMenu('foxtrick-popup-copy-ht-ml', menuEntry);

			menuEntry = {"hidden": true};
			if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Table")) {
				var markup = FoxtrickContextMenuCopy.getTable(target);
				if ( markup !== null ) {
					FoxtrickContextMenuCopy.TABLE = markup;
					menuEntry = {"hidden": false};
				}
			}
			FoxtrickContextMenuCopy.updateMenu('foxtrick-popup-copy-table', menuEntry);
		}
		catch (e) {
			Foxtrick.log(e);
			for (var contextEntry in FoxtrickContextMenuCopy.contextEntries)
				FoxtrickContextMenuCopy.updateMenu(contextEntry, { hidden : true });
		}
	}
};
Foxtrick.util.module.register(FoxtrickContextMenuCopy);
