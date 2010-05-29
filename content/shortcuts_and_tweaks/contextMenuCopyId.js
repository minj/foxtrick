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
		{ type : "arena", re : /\/Default\.aspx\?ArenaID=(\d+)/i, tag : "" },
		{ type : "post", re : /\/Forum\/Read.aspx\?t=(\d+).*&n=(\d+)/i, tag : "post" }
	], 

    init : function() {
    },

    run : function(page, doc) {
	},

	change : function(page, doc) {
	},

	onContext: function(event) {
		try {
			if (!Foxtrick.isModuleEnabled(FoxtrickContextMenuCopyId))
			{  //hide old
				Foxtrick.popupMenu.setAttribute("hidden", true);
				Foxtrick.popupMenuHT_ML.setAttribute("hidden", true);
				return;
			}

			var href = event.target.href;
			// if eg link has strong tag
			if (!href) href = event.target.parentNode.href;
			if (!href)
			{  //hide old
				Foxtrick.popupMenu.setAttribute("hidden", true);
				Foxtrick.popupMenuHT_ML.setAttribute("hidden", true);
				return;
			}

			for (var index in FoxtrickContextMenuCopyId.ID) {
				var current = FoxtrickContextMenuCopyId.ID[index];
				if (href.search(current.re) !== -1) {
					var match = href.match(current.re);
					var id = "";
					for (var matchIndex = 1; matchIndex < match.length; ++matchIndex) {
						id += match[matchIndex];
						if (matchIndex !== match.length - 1) {
							id += ".";
						}
					}
					var ml = "[" + current.tag + "=" + id + "]";
					var idText = Foxtrickl10n.getString("foxtrick.CopyContext") + " " + current.type + "Id: " + id;
					var mlText = Foxtrickl10n.getString("foxtrick.CopyContext") + ": " + ml;

					Foxtrick.CopyID = id;
					Foxtrick.CopyIDHT_ML = ml;
					Foxtrick.popupMenu.setAttribute("hidden", false);
					Foxtrick.popupMenu.setAttribute("label", idText);
					if (current.tag!=="") {
						Foxtrick.popupMenuHT_ML.setAttribute("hidden", false);
						Foxtrick.popupMenuHT_ML.setAttribute("label", mlText);
					}
					return;
				}
			}
			Foxtrick.popupMenu.setAttribute("hidden", true);
			Foxtrick.popupMenuHT_ML.setAttribute("hidden", true);
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
};	
