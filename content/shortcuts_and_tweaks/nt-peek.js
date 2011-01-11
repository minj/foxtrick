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
		var buildTeamHeader = function(name, id) {
			var header = doc.createElement("h2");
			var link = doc.createElement("a");
			link.textContent = name;
			link.href = "/Club/NationalTeam/NationalTeam.aspx?teamId=" + id;
			header.appendChild(link);
			return header;
		};
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
		var ntContainer = doc.createElement("div");
		ntContainer.className = "ft-nt-peek-left";
		container.appendChild(ntContainer);
		var ntHeader = buildTeamHeader(ntName, ntId);
		ntContainer.appendChild(ntHeader);
		var ntTable = doc.createElement("table");
		ntContainer.appendChild(ntTable);
		// U20 container
		var u20Container = doc.createElement("div");
		u20Container.className = "ft-nt-peek-right";
		container.appendChild(u20Container);
		var u20Header = buildTeamHeader(u20Name, u20Id);
		u20Container.appendChild(u20Header);
		var u20Table = doc.createElement("table");
		u20Container.appendChild(u20Table);
		// separator
		var separator = doc.createElement("div");
		separator.className = "separator";
		container.appendChild(separator);

		const ntXml = "http://" + doc.location.hostname
			+ "/Community/CHPP/Matches/chppxml.axd?file=matches&teamID="
			+ ntId;
		var ntReq = Foxtrick.LoadXML(ntXml, function(xml) {
			FoxtrickNtPeek.addMatches(doc, ntTable, xml);
		});
		const u20Xml = "http://" + doc.location.hostname
			+ "/Community/CHPP/Matches/chppxml.axd?file=matches&teamID="
			+ u20Id;
		var u20Req = Foxtrick.LoadXML(u20Xml, function(xml) {
			FoxtrickNtPeek.addMatches(doc, u20Table, xml);
		});
	},

	addMatches : function(doc, container, xml) {
		try {
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
					container.appendChild(matchRow);
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
