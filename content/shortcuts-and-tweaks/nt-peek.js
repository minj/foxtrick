/**
 * nt-peek.js
 * peeks NT/U20 matches at MyHT
 * @author ryanli
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickNtPeek = {
	MODULE_NAME : "NtPeek",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["myhattrick"],
	CSS : Foxtrick.ResourcePath + "resources/css/nt-peek.css",

	run : function(page, doc) {
		var buildContainer = function(team, id) {
			var buildTeamHeader = function() {
				var header = doc.createElement("h2");
				var link = doc.createElement("a");
				link.textContent = team;
				link.href = "/Club/NationalTeam/NationalTeam.aspx?teamId=" + id;
				header.appendChild(link);
				return header;
			}
			var container = doc.createElement("div");
			var header = buildTeamHeader();
			container.appendChild(header);
			var table = doc.createElement("table");
			var loadingRow = table.insertRow(0);
			var loadingCell = loadingRow.insertCell(0);
			loadingCell.appendChild(Foxtrick.util.note.createLoading(doc));
			container.appendChild(table);
			return container;
		}
		FoxtrickHelper.getOwnTeamInfo(doc, page);
		const countryId = FoxtrickHelper.getOwnCountryId();
		const ntIdXml = Foxtrick.XMLData.htNTidsXml;
		const ntNode = ntIdXml.evaluate("/leagues/league[@id='" + countryId + "'][1]",
			ntIdXml, null, XPathResult.ANY_TYPE, null).iterateNext();
		const ntId = ntNode.getElementsByTagName("NTid")[0].textContent;
		const ntName = ntNode.getElementsByTagName("NTName")[0].textContent;
		const u20Id = ntNode.getElementsByTagName("U20id")[0].textContent;
		const u20Name = ntNode.getElementsByTagName("U20Name")[0].textContent;

		var insertBefore = doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlMain");
		var container = doc.createElement("div");
		container.className = "ft-nt-peek";
		insertBefore.parentNode.insertBefore(container, insertBefore);
		// title
		var title = doc.createElement("h1");
		title.textContent = Foxtrickl10n.getString("ntpeek.title");
		container.appendChild(title);
		
		// NT container
		var ntContainer = buildContainer(ntName, ntId);
		container.appendChild(ntContainer);
		// U20 container
		var u20Container = buildContainer(u20Name, u20Id);doc.createElement("div");
		container.appendChild(u20Container);
		// separator
		var separator = doc.createElement("div");
		separator.className = "separator";
		container.appendChild(separator);

		const ntArgs = [
			["file", "matches"],
			["teamID", ntId]
		];
		Foxtrick.ApiProxy.retrieve(doc, ntArgs, function(xml) {
			FoxtrickNtPeek.addMatches(doc, ntContainer, xml);
		});
		const u20Args = [
			["file", "matches"],
			["teamID", u20Id]
		];
		Foxtrick.ApiProxy.retrieve(doc, u20Args, function(xml) {
			FoxtrickNtPeek.addMatches(doc, u20Container, xml);
		});
	},

	addMatches : function(doc, container, xml) {
		try {
			if (xml === null) {
				// no XML available
				container.textContent = Foxtrickl10n.getString("api.failure");
				return;
			}
			var table = container.getElementsByTagName("table")[0];
			table.textContent = ""; // clear loading notice
			var dateNow = Foxtrick.util.time.getHtDate(doc);
			var id = xml.getElementsByTagName("TeamID")[0].textContent;
			var matches = xml.getElementsByTagName("Match");
			for (var i = 0; i < matches.length; ++i) {
				var match = matches[i];
				var dateText = match.getElementsByTagName("MatchDate")[0].textContent;
				var date = Foxtrick.util.time.getDateFromText(dateText, "yyyymmdd");
				var dateDiff = Math.abs(date.getTime() - dateNow.getTime());
				if (dateDiff < 7 * 24 * 60 * 60 * 1000) {
					var matchId = match.getElementsByTagName("MatchID")[0].textContent;
					var homeTeam = match.getElementsByTagName("HomeTeamName")[0].textContent;
					var awayTeam = match.getElementsByTagName("AwayTeamName")[0].textContent;
					var homeId = match.getElementsByTagName("HomeTeamID")[0].textContent;
					var awayId = match.getElementsByTagName("AwayTeamID")[0].textContent;
					var side = (id == homeId) ? "home" : "away";
					var status = match.getElementsByTagName("Status")[0].textContent;
					if (status == "FINISHED") {
						var homeGoals = match.getElementsByTagName("HomeGoals")[0].textContent;
						var awayGoals = match.getElementsByTagName("AwayGoals")[0].textContent;
						var matchRow = FoxtrickNtPeek.getMatchRow(doc,
							matchId, side, homeTeam, awayTeam, homeGoals,
							awayGoals);
					}
					else if (status == "UPCOMING" || status == "ONGOING") {
						var matchRow = FoxtrickNtPeek.getMatchRow(doc,
							matchId, side, homeTeam, awayTeam);
					}
					table.appendChild(matchRow);
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	getMatchRow : function(doc, id, side, homeTeam, awayTeam, homeGoals, awayGoals) {
		const rtl = Foxtrick.isRTLLayout(doc);

		var row = doc.createElement("tr");

		var matchCell = doc.createElement("td");
		var matchLink = doc.createElement("a");
		matchLink.href = "/Club/Matches/Match.aspx?matchID=" + id;
		if (!rtl) {
			matchLink.title = homeTeam + " - " + awayTeam;
			matchLink.textContent = homeTeam.substr(0, 15) + " - "
				+ awayTeam.substr(0, 15);
		}
		else {
			matchLink.title = awayTeam + " - " + homeTeam;
			matchLink.textContent = awayTeam.substr(0, 15) + " - "
				+ homeTeam.substr(0, 15);
		}
		matchCell.appendChild(matchLink);
		row.appendChild(matchCell);

		var resultCell = doc.createElement("td");
		if (homeGoals != undefined && awayGoals != undefined) {
			resultCell.textContent = homeGoals + " - " + awayGoals;
			homeGoals = Number(homeGoals);
			awayGoals = Number(awayGoals);
			if (homeGoals == awayGoals) {
				resultCell.className = "draw";
			}
			else if ((homeGoals > awayGoals && side == "home")
				|| (homeGoals < awayGoals && side == "away")) {
				resultCell.className = "won";
			}
			else {
				resultCell.className = "lost";
			}
		}
		else {
			// add HT-Live
			var liveLink = doc.createElement("a");
			liveLink.href = "/Club/Matches/Live.aspx?actionType=addMatch&matchID="
				+ id;
			var liveImg = doc.createElement("img");
			liveImg.className = "matchHTLive";
			liveImg.src = "/Img/Icons/transparent.gif";
			liveImg.alt = liveImg.title = Foxtrickl10n.getString("htLive");
			liveLink.appendChild(liveImg);
			resultCell.appendChild(liveLink);
		}
		row.appendChild(resultCell);
		return row;
	}
};
