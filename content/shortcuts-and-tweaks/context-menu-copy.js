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

	MENU_ID : {},
	MENU_LINK : {},
	MENU_HT_ML : {},
	MENU_TABLE : {},

	SELECTION : null,
	TABLE : null,

	onLoad : function(document) {
		this.MENU_ID = document.getElementById("foxtrick-popup-copy-id");
		this.MENU_LINK = document.getElementById("foxtrick-popup-copy-link");
		this.MENU_HT_ML = document.getElementById("foxtrick-popup-copy-ht-ml");
		this.MENU_TABLE = document.getElementById("foxtrick-popup-copy-table");
	},

	onTabChange : function(doc) {
		if (!Foxtrick.isHt(doc)) {
			this.MENU_ID.setAttribute("hidden", true);
			this.MENU_LINK.setAttribute("hidden", true);
			this.MENU_HT_ML.setAttribute("hidden", true);
			this.MENU_TABLE.setAttribute("hidden", true);
		}
	},

	// called from background script
	chromeInit : function () {
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

		var local_string = Foxtrickl10n.getString('Copy');
		if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Id")) {
			var id_contexts = [
				{'title':local_string+ ': Team ID', 	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*TeamID=*','*://*.hattrick.org/*teamId=*'] },
				{'title':local_string+ ': User ID', 	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*UserID=*','*://*.hattrick.org/*userId=*'] },
				{'title':local_string+ ': Series ID',	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*LeagueLevelUnitID=*','*://*.hattrick.org/*LeagueLevelUnitId=*'] },
				{'title':local_string+ ': YouthSeries ID',	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*YouthLeagueID=*','*://*.hattrick.org/*YouthLeagueId=*'] },
				{'title':local_string+ ': Match ID', 	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*matchID=*','*://*.hattrick.org/*matchId=*'] },
				{'title':local_string+ ': Player ID',	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*PlayerID=*','*://*.hattrick.org/*playerId=*'] },
				{'title':local_string+ ': Arena ID', 	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*ArenaID=*','*://*.hattrick.org/*arenaId=*'] },
				{'title':local_string+ ': Post ID', 	"contexts":["link"], "onclick": idLinkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/Forum/Read.aspx?t=*&n=*'] },
			];
		}
		else var id_contexts = [];

		if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Link")) {
			id_contexts.push( {'title':Foxtrickl10n.getString("copy.link"), "contexts":["link"], "onclick": linkOnClick,	'documentUrlPatterns':['*://*.hattrick.org/*'],	'targetUrlPatterns':['*://*.hattrick.org/*'] });
		}
		if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "HtMl")) {
			id_contexts.push( {'title':Foxtrickl10n.getString("copy.ht-ml"), "contexts":["selection"], "onclick": selectionOnClick, 'documentUrlPatterns': ['*://*.hattrick.org/*'] });
		}

		for (var i = 0; i < id_contexts.length; i++) {
			chrome.contextMenus.create(id_contexts[i]);
		}
	},

	// called from background script
	safariInit : function () {
		safari.application.addEventListener("contextmenu", FoxtrickContextMenuCopy.onContext, false);
		
		safari.application.addEventListener("command", function(commandEvent) {
			if (commandEvent.command == "copyid")
				FoxtrickContextMenuCopy.copyId();
			else if (commandEvent.command == "copylink")
				FoxtrickContextMenuCopy.copyLink();
			else if (commandEvent.command == "copyselection")
				FoxtrickContextMenuCopy.copyHtMl();
			else if (commandEvent.command == "copytable")
				FoxtrickContextMenuCopy.copyTable();
		}, false );
	},

	run : function(doc) {
		// context menu listeners. chrome context menu is set up in background.js
		if (Foxtrick.arch === "Gecko") {
			doc.addEventListener("contextmenu", this.onContext, false);
			this.MENU_LINK.setAttribute("label", Foxtrickl10n.getString("copy.link"));
			this.MENU_HT_ML.setAttribute("label", Foxtrickl10n.getString("copy.ht-ml"));
			this.MENU_TABLE.setAttribute("label", Foxtrickl10n.getString("copy.table"));
		}
		
		if ( Foxtrick.platform == "Safari" ) {
			// need to store target for reference in contextmenu-clicklistener
			document.addEventListener("contextmenu", function(event) {
				safari.self.tab.setContextMenuEventUserInfo(event, { target : event.target });
			}, false);
		}
		
		// copy selection request from chrome context menu
		if (Foxtrick.platform == "Chrome") {
			chrome.extension.onRequest.addListener(
			  function(request, sender, sendResponse) {
				if (request.req == "copySelection") {
					var selection = window.getSelection();
					if (!selection.isCollapsed && selection.rangeCount > 0) {
						FoxtrickContextMenuCopy.SELECTION = selection;
						FoxtrickContextMenuCopy.copyHtMl();
					}
				}
			});
		}
	},

	copyId : function() {
		try {
			if (FoxtrickContextMenuCopy.MENU_ID) {
				if (FoxtrickContextMenuCopy.MENU_ID.hasAttribute("copy")) {
					Foxtrick.copyStringToClipboard(FoxtrickContextMenuCopy.MENU_ID.getAttribute("copy"));
				}
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	copyLink : function() {
		try {
			if (FoxtrickContextMenuCopy.MENU_LINK) {
				if (FoxtrickContextMenuCopy.MENU_LINK.hasAttribute("copy")) {
					Foxtrick.copyStringToClipboard(FoxtrickContextMenuCopy.MENU_LINK.getAttribute("copy"));
				}
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	copyHtMl : function() {
		try {
			if (!FoxtrickContextMenuCopy.SELECTION) {
				return;
			}
			var markup = "";
			for (var i = 0; i < FoxtrickContextMenuCopy.SELECTION.rangeCount; ++i) {
				markup += Foxtrick.util.htMl.getMarkupFromNode(FoxtrickContextMenuCopy.SELECTION.getRangeAt(i).cloneContents());
				if (i !== FoxtrickContextMenuCopy.SELECTION.rangeCount - 1) {
					markup += "\n";
				}
			}
			markup = Foxtrick.trim(markup);
			Foxtrick.copyStringToClipboard(markup);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	copyTable : function() {
		try {
			if (!FoxtrickContextMenuCopy.TABLE) {
				return;
			}
			var markup = Foxtrick.util.htMl.getMarkupFromNode(FoxtrickContextMenuCopy.TABLE);
			markup = Foxtrick.trim(markup);
			Foxtrick.copyStringToClipboard(markup);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	onContext : function(event) {
		try {
			if (Foxtrick.arch === "Gecko") {
				var target = event.target;
			}
			else if ( Foxtrick.platform == "Safari" ) {
				var paste_note =  '. ' + Foxtrickl10n.getString("SpecialPaste.desc");
				var target = event.userInfo.target;
			}
			
			var href = null;
			var currentObj = target;
			while (currentObj) {
				if (currentObj.href !== undefined) {
					href = currentObj.href;
					break;
				}
				currentObj = currentObj.parentNode;
			}

			if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Id")) {
				var id = Foxtrick.util.htMl.getIdFromLink(href);
				if (id !== null) {
					var idText = Foxtrickl10n.getString("copy.id").replace("%s", id.type + " ID").replace("%i", id.id);
					FoxtrickContextMenuCopy.MENU_ID.setAttribute("copy", id.id);
					FoxtrickContextMenuCopy.MENU_ID.setAttribute("label", idText);
					FoxtrickContextMenuCopy.MENU_ID.setAttribute("hidden", false);
					if ( Foxtrick.platform == "Safari" ) 
							event.contextMenu.appendContextMenuItem("copyid", idText + paste_note);
					}
				else {
					FoxtrickContextMenuCopy.MENU_ID.setAttribute("hidden", true);
				}
			}
			else {
				FoxtrickContextMenuCopy.MENU_ID.setAttribute("hidden", true);
			}

			if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Link")) {
				var markup = Foxtrick.util.htMl.getMarkupFromLink(href);
				if (markup !== null) {
					FoxtrickContextMenuCopy.MENU_LINK.setAttribute("copy", markup);
					FoxtrickContextMenuCopy.MENU_LINK.setAttribute("hidden", false);
					if ( Foxtrick.platform == "Safari" ) 
						event.contextMenu.appendContextMenuItem("copylink", Foxtrickl10n.getString("copy.link") + paste_note);
				}
				else {
					FoxtrickContextMenuCopy.MENU_LINK.setAttribute("hidden", true);
				}
			}
			else {
				FoxtrickContextMenuCopy.MENU_LINK.setAttribute("hidden", true);
			}

			if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "HtMl")) {
				var doc = target.ownerDocument;
				var window = doc.defaultView;
				var selection = window.getSelection();
				if (!selection.isCollapsed && selection.rangeCount > 0) {
					FoxtrickContextMenuCopy.SELECTION = selection;
					FoxtrickContextMenuCopy.MENU_HT_ML.setAttribute("hidden", false);
					if ( Foxtrick.platform == "Safari" ) 
							event.contextMenu.appendContextMenuItem("copyselection", Foxtrickl10n.getString("copy.ht-ml") + paste_note);
				}
				else {
					FoxtrickContextMenuCopy.MENU_HT_ML.setAttribute("hidden", true);
				}
			}
			else {
				FoxtrickContextMenuCopy.MENU_HT_ML.setAttribute("hidden", true);
			}

			if (FoxtrickPrefs.isModuleOptionEnabled("ContextMenuCopy", "Table")) {
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
					FoxtrickContextMenuCopy.TABLE = table;
					FoxtrickContextMenuCopy.MENU_TABLE.setAttribute("hidden", false);
					if ( Foxtrick.platform == "Safari" ) 
							event.contextMenu.appendContextMenuItem("copytable", Foxtrickl10n.getString("copy.table") + paste_note);
				}
				else {
					FoxtrickContextMenuCopy.MENU_TABLE.setAttribute("hidden", true);
				}
			}
			else {
				FoxtrickContextMenuCopy.MENU_TABLE.setAttribute("hidden", true);
			}
		}
		catch (e) {
			Foxtrick.log(e);
			FoxtrickContextMenuCopy.MENU_ID.setAttribute("hidden", true);
			FoxtrickContextMenuCopy.MENU_LINK.setAttribute("hidden", true);
			FoxtrickContextMenuCopy.MENU_HT_ML.setAttribute("hidden", true);
			FoxtrickContextMenuCopy.MENU_TABLE.setAttribute("hidden", true);
		}
	}
};
Foxtrick.util.module.register(FoxtrickContextMenuCopy);
