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

	MENU_ID : null,
	MENU_LINK : null,
	MENU_HT_ML : null,
	MENU_TABLE : null,

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

	run : function(doc) {
		if (Foxtrick.BuildFor === "Gecko") {
			doc.addEventListener("contextmenu", this.onContext, false);
			this.MENU_LINK.setAttribute("label", Foxtrickl10n.getString("copy.link"));
			this.MENU_HT_ML.setAttribute("label", Foxtrickl10n.getString("copy.ht-ml"));
			this.MENU_TABLE.setAttribute("label", Foxtrickl10n.getString("copy.table"));
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
			var href = null;
			var currentObj = event.target;
			while (currentObj) {
				if (currentObj.href !== undefined) {
					href = currentObj.href;
					break;
				}
				currentObj = currentObj.parentNode;
			}

			if (FoxtrickPrefs.isModuleOptionEnabled(FoxtrickContextMenuCopy, "Id")) {
				var id = Foxtrick.util.htMl.getIdFromLink(href);
				if (id !== null) {
					FoxtrickContextMenuCopy.MENU_ID.setAttribute("copy", id.id);
					var idText = Foxtrickl10n.getString("copy.id").replace("%s", id.type + " ID").replace("%i", id.id);
					FoxtrickContextMenuCopy.MENU_ID.setAttribute("label", idText);
					FoxtrickContextMenuCopy.MENU_ID.setAttribute("hidden", false);
				}
				else {
					FoxtrickContextMenuCopy.MENU_ID.setAttribute("hidden", true);
				}
			}
			else {
				FoxtrickContextMenuCopy.MENU_ID.setAttribute("hidden", true);
			}

			if (FoxtrickPrefs.isModuleOptionEnabled(FoxtrickContextMenuCopy, "Link")) {
				var markup = Foxtrick.util.htMl.getMarkupFromLink(href);
				if (markup !== null) {
					FoxtrickContextMenuCopy.MENU_LINK.setAttribute("copy", markup);
					FoxtrickContextMenuCopy.MENU_LINK.setAttribute("hidden", false);
				}
				else {
					FoxtrickContextMenuCopy.MENU_LINK.setAttribute("hidden", true);
				}
			}
			else {
				FoxtrickContextMenuCopy.MENU_LINK.setAttribute("hidden", true);
			}

			if (FoxtrickPrefs.isModuleOptionEnabled(FoxtrickContextMenuCopy, "HtMl")) {
				var doc = event.target.ownerDocument;
				var window = doc.defaultView;
				var selection = window.getSelection();
				if (!selection.isCollapsed && selection.rangeCount > 0) {
					FoxtrickContextMenuCopy.SELECTION = selection;
					FoxtrickContextMenuCopy.MENU_HT_ML.setAttribute("hidden", false);
				}
				else {
					FoxtrickContextMenuCopy.MENU_HT_ML.setAttribute("hidden", true);
				}
			}
			else {
				FoxtrickContextMenuCopy.MENU_HT_ML.setAttribute("hidden", true);
			}

			if (FoxtrickPrefs.isModuleOptionEnabled(FoxtrickContextMenuCopy, "Table")) {
				var table = null;
				var currentObj = event.target;
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
