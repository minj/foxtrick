"use strict";
/*
 * show-friendly-booked.js
 * Show whether a team has booked friendly on series page
 * @author ryanli
 */

Foxtrick.modules["FriendlyPool"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["challengesPool"],
	CSS : Foxtrick.InternalPath + "resources/css/friendly-pool.css",

	run : function(doc) {
		var ownteamid = Foxtrick.util.id.getOwnTeamId();
		var owncountryid = Foxtrick.util.id.getOwnLeagueId();
		var parameters = [
			["file", "teamdetails"],
			["version", "2.6"],
			["teamID", ownteamid],
			["includeFlags", "true"]
		];
		Foxtrick.util.api.retrieve(doc, parameters, {
				cache_lifetime : "default"
			},
			function(xml, errorText) {
				if (xml == null) {
					//destCell.textContent = Foxtrickl10n.getString("status.error.abbr");
					//destCell.title = errorText;
					return;
				}
				var home = {};
				var LeagueIds = xml.getElementsByTagName("HomeFlags")[0].getElementsByTagName("LeagueId");
				for (var i=0; i<LeagueIds.length; ++i)
					home[LeagueIds[i].textContent]=true;
				var away = {};
				var LeagueIds = xml.getElementsByTagName("AwayFlags")[0].getElementsByTagName("LeagueId");
				for (var i=0; i<LeagueIds.length; ++i)
					away[LeagueIds[i].textContent]=true;
				var leagueSelect = doc.getElementById("ctl00_ctl00_CPContent_CPMain_ddlPoolLeagues");
				var options = leagueSelect.getElementsByTagName("option");
				for (var i=0;i<leagueSelect.length;++i) {
					if (home[leagueSelect[i].getAttribute('value')])
						Foxtrick.addClass(leagueSelect[i],'ft-home');
					if (away[leagueSelect[i].getAttribute('value')])
						Foxtrick.addClass(leagueSelect[i],'ft-away');
					if (leagueSelect[i].getAttribute('value') == owncountryid)
					Foxtrick.addClass(leagueSelect[i],'ft-own');
				}
		});
	}
};
