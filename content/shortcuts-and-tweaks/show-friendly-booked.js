/*
 * show-friendly-booked.js
 * Show whether a team has booked friendly on series page
 * @author ryanli
 */

var FoxtrickShowFriendlyBooked = {
	MODULE_NAME : "ShowFriendlyBooked",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["league"],

	run : function(page, doc) {
		var leagueTableSpan = doc.getElementById("ctl00_ctl00_CPContent_CPMain_repLeagueTable");
		var leagueTable = leagueTableSpan.getElementsByTagName("table")[0];
		var rows = leagueTable.getElementsByTagName("tr");
		// remove header row and ownerless teams
		rows = Foxtrick.filter(rows, function(n) {
			var isHeader = function() { return n.getElementsByTagName("th").length > 0; };
			var inCup = function() { return n.getElementsByTagName("td")[3].getElementsByTagName("img").length > 0; };
			var isOwnerless = function() { return n.getElementsByClassName("shy").length > 0; };
			return !isHeader() && !inCup() && !isOwnerless();
		});
		// see whether friendly booked
		Foxtrick.map(rows, function(n) {
			var teamCell = n.getElementsByTagName("td")[2];
			var teamLink = teamCell.getElementsByTagName("a")[0].href;
			var teamId = FoxtrickHelper.getTeamIdFromUrl(teamLink);

			var destCell = n.getElementsByTagName("td")[3];
			destCell.textContent = Foxtrickl10n.getString("status.loading.abbr");
			destCell.title = Foxtrickl10n.getString("status.loading");

			var parameters = [
				["file", "teamdetails"],
				["teamID", teamId]
			];
			Foxtrick.ApiProxy.retrieve(doc, parameters, function(xml) {
				if (xml == null) {
					// failed to retrieve XML
					destCell.textContent = Foxtrickl10n.getString("status.error.abbr");
					destCell.title = Foxtrickl10n.getString("api.failure");
					return;
				}
				var friendly = xml.getElementsByTagName("FriendlyTeamID")[0];
				if (friendly.textContent != "0") {
					// friendly booked
					destCell.textContent = Foxtrickl10n.getString("team.status.booked.abbr");
					destCell.title = Foxtrickl10n.getString("team.status.booked");
				}
				else {
					// available for challenge, reset textContent and title
					destCell.textContent = destCell.title = "";
				}
			});
		});
	}
};
