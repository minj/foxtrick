/**
 * contextMenuCopy.js
 * Options at the context menu for copying ID and/or link and content in HT-ML
 * @author convinced, ryanli
 */

var FoxtrickContextMenuCopy = {

	MODULE_NAME : "ContextMenuCopy",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["all"],
	OPTIONS : ["Id", "Link", "HtMl", "Table"],
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Complete overhaul. Copying any selected content in HT-ML.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,

	MENU_ID : null,
	MENU_LINK : null,
	MENU_HT_ML : null,
	MENU_TABLE : null,

	SELECTION : null,
	TABLE : null,

	ID : [
		{ type : "Player", re : /\/Player\.aspx\?playerId=(\d+)/i, tag : "playerid" },
		{ type : "Youth Player", re : /\?YouthPlayerID=(\d+)/i, tag : "youthplayerid" },
		{ type : "Team", re : /\/Club\/\?TeamID=(\d+)/i, tag : "teamid" },
		{ type : "Youth Team", re : /\?YouthTeamID=(\d+)/i, tag : "youthteamid" },
		{ type : "Youth Match", re : /\/Match\.aspx\?matchID=(\d+)&isYouth=True/i, tag : "youthmatchid" },
		{ type : "Match", re : /\/Match\.aspx\?matchID=(\d+)&/i, tag : "matchid" },
		{ type : "Federation", re : /\?AllianceID=(\d+)/i, tag : "federationid" },
		{ type : "Series", re : /\?LeagueLevelUnitID=(\d+)/i, tag : "leagueid" },
		{ type : "Youth Series", re : /\?YouthLeagueId=(\d+)/i, tag : "youthleagueid" },
		{ type : "User", re : /\?userId=(\d+)/i, tag : "userid" },
		{ type : "Kit", re : /\?KitID=(\d+)/i, tag : "kitid" },
		{ type : "Article", re : /\?ArticleID=(\d+)/i, tag : "articleid" },
		{ type : "Post", re : /\/Forum\/Read.aspx\?t=(\d+).*&n=(\d+)/i, tag : "post" },
		{ type : "Arena", re : /\/Club\/Arena\/Default\.aspx\?ArenaID=(\d+)/i },
		{ type : "League", re : /\/World\/Leagues\/League\.aspx\?LeagueID=(\d+)/i },
		{ type : "Cup", re : /\/World\/Cup\/\?CupID=(\d+)/i },
		{ type : "Region", re : /\/World\/Regions\/Region\.aspx\?RegionID=(\d+)/i },
		{ type : "National Team", re : /\/Club\/NationalTeam\/NationalTeam\.aspx\?teamId=(\d+)/i }
	],

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

	run : function(page, doc) {
		if (Foxtrick.BuildFor === "Gecko") {
			doc.addEventListener("contextmenu", this.onContext, false);
			this.MENU_LINK.setAttribute("label", Foxtrickl10n.getString("copy.link"));
			this.MENU_HT_ML.setAttribute("label", Foxtrickl10n.getString("copy.ht-ml"));
			this.MENU_TABLE.setAttribute("label", Foxtrickl10n.getString("copy.table"));
		}
	},


	// if ID is found, will return an object like this:
	// { type : "match", id : "123456789", tag : "matchid" },
	// or like this:
	// { type : "arena", id : "123456" }
	// otherwise, return null
	getIdFromLink : function(link) {
		if (typeof(link) !== "string" || link.search(/^javascript/i) === 0) {
			return null;
		}
		for (var index in this.ID) {
			var current = this.ID[index];
			if (link.search(current.re) !== -1) {
				var match = link.match(current.re);
				var id = "";
				for (var matchIndex = 1; matchIndex < match.length; ++matchIndex) {
					id += match[matchIndex];
					if (matchIndex !== match.length - 1) {
						id += ".";
					}
				}
				var ret = {};
				ret.type = current.type;
				ret.id = id;
				if (current.tag) {
					// some ID types may not have corresponding tags
					ret.tag = current.tag;
				}
				return ret;
			}
		}
		// return null if nothing is found
		return null;
	},

	// returns a string link like "[matchid=123456789]"
	// or "[link=/Club/…]" or "[link=ftp://example.org/…]"
	getMarkupFromLink : function(link) {
		var idObj = this.getIdFromLink(link);
		var ret = null;
		if (idObj !== null && idObj.tag !== undefined) {
			ret = "[" + idObj.tag + "=" + idObj.id + "]";
		}
		else if (typeof(link) === "string") {
			// ignoring boring links
			const ignore = ["/Help/Rules/AppDenominations.aspx"];
			for (var i = 0; i < ignore.length; ++i)
				if (link.indexOf(ignore[i]) > -1)
					return null;

			const relRe = new RegExp("http://[^/]+(/.+)", "i");
			if (link.match(relRe) !== null) {
				const matched = link.match(relRe);
				const relLink = matched[1];
				// if it's relative link of Hattrick, remove the host
				if (Foxtrick.isHtUrl(link))
					ret = "[link=" + relLink + "]";
				else
					ret = "[link=" + link + "]";
			}
		}
		return ret;
	},

	getMarkupFromNode : function(node) {
		if (node.nodeName === undefined) {
			return "";
		}

		var doc = node.ownerDocument;
		var window = doc.defaultView;

		var computedStyle = null;
		if (node.nodeType === Node.ELEMENT_NODE) {
			computedStyle = window.getComputedStyle(node, null);
		}

		if (computedStyle && computedStyle.getPropertyValue("display") === "none") {
			return "";
		}

		var nodeName = node.nodeName.toLowerCase();

		// we consider these nodes as stand-alone elements
		if (nodeName === "img") {
			if (node.hasAttribute("alt") && node.getAttribute("alt") !== "") {
				return node.getAttribute("alt");
			}
			else if (node.hasAttribute("title") && node.getAttribute("title") !== "") {
				return node.getAttribute("title");
			}
			else {
				return "";
			}
		}
		else if (nodeName === "hr") {
			return "[hr]";
		}
		else if (nodeName === "br") {
			return "\n";
		}

		var ret = "";

		if (!node.hasChildNodes()) {
			ret = this.trim(node.textContent);
		}
		else {
			var children = node.childNodes;
			for (var i = 0; i < children.length; ++i) {
				// recursively get the content of child nodes
				var childMarkup = this.getMarkupFromNode(children[i]);
				if (childMarkup != null)
					ret += childMarkup;
				if (i !== children.length - 1) {
					ret += " ";
				}
			}
		}

		if (nodeName === "a") {
			if (node.href !== undefined) {
				var linkMarkup = this.getMarkupFromLink(node.href);
				if (linkMarkup !== null && linkMarkup.id !== undefined) {
					if (ret === "(" + linkMarkup.id + ")") {
						// if the link is simply a representation of ID
						ret = "";
					}
					ret += linkMarkup;
				}
			}
		}
		else if (nodeName === "table" || nodeName === "tr") {
			ret = "[" + nodeName + "]" + ret + "[/" + nodeName + "]\n";
		}
		else if (nodeName === "th" || nodeName === "td") {
			var colspan = "";
			var rowspan = "";
			if (node.hasAttribute("colspan") && node.getAttribute("colspan") !== "") {
				colspan = " colspan=" + node.getAttribute("colspan");
			}
			if (node.hasAttribute("rowspan") && node.getAttribute("rowspan") !== "") {
				rowspan = " rowspan=" + node.getAttribute("rowspan");
			}
			ret = "[" + nodeName + colspan + rowspan + "]" + ret + "[/" + nodeName + "]";
		}
		else if (nodeName === "blockquote") {
			ret = "[q]" + ret + "[/q]";
		}
		else if (nodeName === "strong" || nodeName === "b") {
			ret = "[b]" + ret + "[/b]";
		}
		else if (nodeName === "emph" || nodeName === "i") {
			ret = "[i]" + ret + "[/i]";
		}
		else if (nodeName === "u") {
			ret = "[u]" + ret + "[/u]";
		}

		if (computedStyle && computedStyle.getPropertyValue("display") === "block") {
			ret += "\n";
		}

		return ret;
	},

	trim : function(string) {
		return string.replace(RegExp("^\\s+"), "")
			.replace(RegExp("\\s+$"), "")
			.replace(RegExp("\\s*\n\\s*", "g"), "\n")
			.replace(RegExp("(\\s)\\s+", "g"), "$1");
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
			Foxtrick.dumpError(e);
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
			Foxtrick.dumpError(e);
		}
	},

	copyHtMl : function() {
		try {
			if (!FoxtrickContextMenuCopy.SELECTION) {
				return;
			}
			var markup = "";
			for (var i = 0; i < FoxtrickContextMenuCopy.SELECTION.rangeCount; ++i) {
				markup += FoxtrickContextMenuCopy.getMarkupFromNode(FoxtrickContextMenuCopy.SELECTION.getRangeAt(i).cloneContents());
				if (i !== FoxtrickContextMenuCopy.SELECTION.rangeCount - 1) {
					markup += "\n";
				}
			}
			markup = FoxtrickContextMenuCopy.trim(markup);
			Foxtrick.copyStringToClipboard(markup);
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	copyTable : function() {
		try {
			if (!FoxtrickContextMenuCopy.TABLE) {
				return;
			}
			var markup = FoxtrickContextMenuCopy.getMarkupFromNode(FoxtrickContextMenuCopy.TABLE);
			markup = FoxtrickContextMenuCopy.trim(markup);
			Foxtrick.copyStringToClipboard(markup);
		}
		catch (e) {
			Foxtrick.dumpError(e);
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

			if (Foxtrick.isModuleFeatureEnabled(FoxtrickContextMenuCopy, "Id")) {
				var id = FoxtrickContextMenuCopy.getIdFromLink(href);
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

			if (Foxtrick.isModuleFeatureEnabled(FoxtrickContextMenuCopy, "Link")) {
				var markup = FoxtrickContextMenuCopy.getMarkupFromLink(href);
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

			if (Foxtrick.isModuleFeatureEnabled(FoxtrickContextMenuCopy, "HtMl")) {
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

			if (Foxtrick.isModuleFeatureEnabled(FoxtrickContextMenuCopy, "Table")) {
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
			Foxtrick.dumpError(e);
			FoxtrickContextMenuCopy.MENU_ID.setAttribute("hidden", true);
			FoxtrickContextMenuCopy.MENU_LINK.setAttribute("hidden", true);
			FoxtrickContextMenuCopy.MENU_HT_ML.setAttribute("hidden", true);
			FoxtrickContextMenuCopy.MENU_TABLE.setAttribute("hidden", true);
		}
	}
};
