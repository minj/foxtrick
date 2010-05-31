/**
 * contextMenuCopyId.js
 * Add a button for copying ID to context menu
 * @author convinced, ryanli
 */

var FoxtrickContextMenuCopyId = {

    MODULE_NAME : "ContextMenuCopyId",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    PAGES : new Array('all'),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.1.3",
	LATEST_CHANGE : "Added HT-ML tags if appropriate",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	ID : [
		{ type : "player", re : /\?playerId=(\d+)/i, tag : "playerid" },
		{ type : "youthplayer", re : /\?YouthPlayerID=(\d+)/i, tag : "youthplayerid" },
		{ type : "team", re : /\?TeamID=(\d+)/i, tag : "teamid" },
		{ type : "youthteam", re : /\?YouthTeamID=(\d+)/i, tag : "youthteamid" },
		{ type : "youthmatch", re : /\?matchID=(\d+)&isYouth=True/i, tag : "youthmatchid" },
		{ type : "match", re : /\?matchID=(\d+)&/i, tag : "matchid" },
		{ type : "federation", re : /\?AllianceID=(\d+)/i, tag : "federationid" },
		{ type : "league", re : /\?LeagueLevelUnitID=(\d+)/i, tag : "leagueid" },
		{ type : "youthleague", re : /\?YouthLeagueId=(\d+)/i, tag : "youthleagueid" },
		{ type : "user", re : /\?userId=(\d+)/i, tag : "userid" },
		{ type : "kit", re : /\?KitID=(\d+)/i, tag : "kitid" },
		{ type : "article", re : /\?ArticleID=(\d+)/i, tag : "articleid" },
		{ type : "post", re : /\/Forum\/Read.aspx\?t=(\d+).*&n=(\d+)/i, tag : "post" }
	], 

    init : function() {
    },

    run : function(page, doc) {
	},

	change : function(page, doc) {
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
				ret.tag = current.tag;
				return ret;
			}
		}
		// no tagged ID is found, go on to find if there is non-tagged ID
		var generalRe = /([a-z]+)+ID=(\d+)/i;
		if (link.search(generalRe) !== -1) {
			var match = link.match(generalRe);
			var ret = {};
			ret.type = match[1];
			ret.id = match[2];
			return ret;
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
			const relRe = new RegExp("http://[^/]+(/.+)", "i");
			if (link.match(relRe) !== null) {
				var relLink = link.match(relRe)[1];
				ret = "[link=" + relLink + "]";
			}
		}
		return ret;
	},

	onContext: function(event) {
		try {
			if (!Foxtrick.isModuleEnabled(FoxtrickContextMenuCopyId))
			{  //hide old
				Foxtrick.popupMenu.setAttribute("hidden", true);
				Foxtrick.popupMenuHT_ML.setAttribute("hidden", true);
				return;
			}

			var href = null;
			var currentObj = event.target;
			while (currentObj) {
				if (currentObj.href !== undefined) {
					href = currentObj.href;
					break;
				}
				currentObj = currentObj.parentNode;
			}

			var id = FoxtrickContextMenuCopyId.getIdFromLink(href);
			if (id !== null) {
				var idText = Foxtrickl10n.getString("foxtrick.CopyContext") + " " + id.type + "Id: " + id.id;
				Foxtrick.CopyID = id.id;
				Foxtrick.popupMenu.setAttribute("label", idText);
				Foxtrick.popupMenu.setAttribute("hidden", false);
			}
			else {
				Foxtrick.popupMenu.setAttribute("hidden", true);
			}

			var markup = FoxtrickContextMenuCopyId.getMarkupFromLink(href);
			if (markup !== null) {
				var markupText = Foxtrickl10n.getString("foxtrick.CopyContext") + ": " + markup;
				Foxtrick.CopyIDHT_ML = markup;
				Foxtrick.popupMenuHT_ML.setAttribute("label", markupText);
				Foxtrick.popupMenuHT_ML.setAttribute("hidden", false);
			}
			else {
				Foxtrick.popupMenuHT_ML.setAttribute("hidden", true);
			}
		}
		catch (e) {
			Foxtrick.popupMenu.setAttribute("hidden", true);
			Foxtrick.popupMenuHT_ML.setAttribute("hidden", true);
			Foxtrick.dumpError(e);
		}
	}
};	
