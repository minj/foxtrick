/*
 * ht-ml.js
 * Utilities for HT-ML (Hattrick Markup Language)
 * @author ryanli
 */

if (!Foxtrick) var Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};

Foxtrick.util.htMl = {};
Foxtrick.util.htMl.get = {};

// @param node: a DOM node which is an <a> element or an <a>'s child node
// @returns:
// if ID is found, will return an object like this:
// { type : "match", id : "123456789", tag : "matchid" },
// or like this:
// { type : "arena", id : "123456" }
// otherwise, return null
Foxtrick.util.htMl.getId = function(node) {
	const idTypes = [
		{ type : "Player", re : /\/Player\.aspx\?playerId=(\d+)/i, tag : "playerid" },
		{ type : "Youth Player", re : /\?YouthPlayerID=(\d+)/i, tag : "youthplayerid" },
		{ type : "Team", re : /\/Club\/\?TeamID=(\d+)/i, tag : "teamid" },
		{ type : "Youth Team", re : /\?YouthTeamID=(\d+)/i, tag : "youthteamid" },
		{ type : "Youth Match", re : /\/Match\.aspx\?matchID=(\d+)&isYouth=True/i, tag : "youthmatchid" },
		{ type : "Match", re : /\/Match\.aspx\?matchID=(\d+)/i, tag : "matchid" },
		{ type : "Federation", re : /\?AllianceID=(\d+)/i, tag : "federationid" },
		{ type : "Series", re : /\?LeagueLevelUnitID=(\d+)/i, tag : "leagueid" },
		{ type : "Youth Series", re : /\?YouthLeagueId=(\d+)/i, tag : "youthleagueid" },
		{ type : "User", re : /\?userId=(\d+)/i, tag : "userid" },
		{ type : "Kit", re : /\?KitID=(\d+)/i, tag : "kitid" },
		{ type : "Article", re : /\?ArticleID=(\d+)/i, tag : "articleid" },
		{ type : "Post", re : /\/Forum\/Read\.aspx\?t=(\d+).*&n=(\d+)/i, tag : "post" },
		{ type : "Arena", re : /\/Club\/Arena\/Default\.aspx\?ArenaID=(\d+)/i },
		{ type : "League", re : /\/World\/Leagues\/League\.aspx\?LeagueID=(\d+)/i },
		{ type : "Cup", re : /\/World\/Cup\/\?CupID=(\d+)/i },
		{ type : "Region", re : /\/World\/Regions\/Region\.aspx\?RegionID=(\d+)/i },
		{ type : "National Team", re : /\/Club\/NationalTeam\/NationalTeam\.aspx\?teamId=(\d+)/i }
	];

	var link = null;
	var currentObj = node;
	while (currentObj) {
		if (currentObj.href !== undefined) {
			link = currentObj.href;
			break;
		}
		currentObj = currentObj.parentNode;
	}
	if (typeof(link) !== "string" || link.search(/^javascript/i) === 0) {
		return null;
	}
	for (var index in idTypes) {
		var current = idTypes[index];
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
			ret.copyTitle = Foxtrickl10n.getString("copy.id").replace("%s", current.type + " ID").replace("%i", id);
			ret.type = current.type;
			ret.id = id;
			ret.markup = id;
			if (current.tag) {
				// some ID types may not have corresponding tags
				ret.tag = current.tag;
			}
			return ret;
		}
	}
	// return null if nothing is found
	return null;
};

// @param node: a DOM node which is an <a> element or an <a>'s child node
// @returns a string link like "[matchid=123456789]"
// or "[link=/Club/…]" or "[link=ftp://example.org/…]"
Foxtrick.util.htMl.getLink = function(node) {
	var idObj = Foxtrick.util.htMl.getId(node);
	var markup = null;
	if (idObj !== null && idObj.tag !== undefined) {
		markup = "[" + idObj.tag + "=" + idObj.id + "]";
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
				markup = "[link=" + relLink + "]";
			else
				markup = "[link=" + link + "]";
		}
	}
	return {copyTitle : Foxtrickl10n.getString("copy.link"), markup : markup };
};

Foxtrick.util.htMl.getMarkupFromNode = function(node) {
	if (node.nodeName === undefined) {
		return "";
	}

	var doc = node.ownerDocument;
	var window = doc.defaultView;

	var computedStyle = null;
	if (node.nodeType === window.Node.ELEMENT_NODE) {
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

	var trim = function(string) {
		return string.replace(RegExp("\\s*\n\\s*", "g"), "\n")
			.replace(RegExp("^\\s+"), " ")
			.replace(RegExp("\\s+$"), " ")
			.replace(RegExp("\\s+", "g"), " ");
	};
	if (!node.hasChildNodes()) {
		ret = trim(node.textContent);
	}
	else {
		var children = node.childNodes;
		for (var i = 0; i < children.length; ++i) {
			// recursively get the content of child nodes
			var childMarkup = Foxtrick.util.htMl.getMarkupFromNode(children[i]);
			if (childMarkup != null)
				ret += childMarkup;
		}
	}

	if (nodeName === "a") {
		if (node.href !== undefined) {
			var linkMarkup = Foxtrick.util.htMl.getLink(node);
			var linkId = Foxtrick.util.htMl.getId(node);
			if (linkMarkup !== null) {
				if (linkId !== null && linkId.id !== undefined
					&& ret === "(" + linkId.id + ")") {
					// if the link is simply a representation of ID,
					// then only use the markup without extra text
					ret = linkMarkup.markup;
				}
				else {
					ret += " " + linkMarkup.markup;
				}
			}
			return ret;
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
};

Foxtrick.util.htMl.getHtMl = function(node) {
	var window = node.ownerDocument.defaultView
	var selection = window.getSelection();
	if (!selection.isCollapsed && selection.rangeCount > 0) {
		var markup = '';
		for (var i = 0; i < selection.rangeCount; ++i) {
			markup += Foxtrick.util.htMl.getMarkupFromNode(selection.getRangeAt(i).cloneContents());
			if (i !== selection.rangeCount - 1) {
				markup += "\n";
			}
		}
		markup = Foxtrick.trim(markup);
		return { copyTitle : Foxtrickl10n.getString("copy.ht-ml"), markup : markup };
	}
	return null;
};
	
Foxtrick.util.htMl.getTable = function(node) {
	var table = null;
	var currentObj = node;
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
		return { copyTitle : Foxtrickl10n.getString("copy.table"), markup : markup };
	}
	return null;
};
