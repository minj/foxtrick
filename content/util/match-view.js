/* match-view.js
 * utilities for match view
 *
 * @author ryanli
 */

if (!Foxtrick) var Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};
Foxtrick.util.matchView = {};

Foxtrick.util.matchView.startLoad = function(container) {
	var doc = container.ownerDocument;
	var loading = Foxtrick.util.note.createLoading(doc);
	container.appendChild(loading);
};

Foxtrick.util.matchView.fillMatches = function(container, xml) {
	if (xml === null) {
		container.textContent = Foxtrickl10n.getString("api.failure");
		return;
	}

	var doc = container.ownerDocument;

	container.textContent = ""; // clear container first
	var table = doc.createElement("table");
	container.appendChild(table);

	var teamId = xml.getElementsByTagName("TeamID")[0].textContent;
	var teamName = xml.getElementsByTagName("TeamName")[0].textContent;
	var isYouth = (xml.getElementsByTagName("IsYouth")[0].textContent == "True");
	var matches = xml.getElementsByTagName("Match");
	// add one played and one not played
	var played = Foxtrick.filter(matches, function(n) {
		return n.getElementsByTagName("Status")[0].textContent == "FINISHED";
	});
	var notPlayed = Foxtrick.filter(matches, function(n) {
		return n.getElementsByTagName("Status")[0].textContent != "FINISHED";
	});
	var toAdd = [];
	if (played.length > 0)
		toAdd.push(played[played.length - 1]);
	if (notPlayed.length > 0)
		toAdd.push(notPlayed[0]);
	for (var i = 0; i < toAdd.length; ++i) {
		var match = toAdd[i];
		var dateText = match.getElementsByTagName("MatchDate")[0].textContent;
		var date = Foxtrick.util.time.getDateFromText(dateText, "yyyymmdd");
		var matchId = match.getElementsByTagName("MatchID")[0].textContent;
		var homeTeam = match.getElementsByTagName("HomeTeamName")[0].textContent;
		var awayTeam = match.getElementsByTagName("AwayTeamName")[0].textContent;
		var homeId = match.getElementsByTagName("HomeTeamID")[0].textContent;
		var awayId = match.getElementsByTagName("AwayTeamID")[0].textContent;
		var side = (teamId == homeId) ? "home" : "away";
		var status = match.getElementsByTagName("Status")[0].textContent;
		if (status == "FINISHED") {
			var homeGoals = match.getElementsByTagName("HomeGoals")[0].textContent;
			var awayGoals = match.getElementsByTagName("AwayGoals")[0].textContent;
		}
		else {
			var homeGoals = null;
			var awayGoals = null;
		}

		var getMatchRow = function() {
			const rtl = Foxtrick.isRTLLayout(doc);

			var row = doc.createElement("tr");

			var matchCell = doc.createElement("td");
			var matchLink = doc.createElement("a");
			matchLink.href = "/Club/Matches/Match.aspx?matchID=" + matchId
				+ (isYouth ? "&isYouth=True" : "");
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
			if (homeGoals !== null && awayGoals !== null) {
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
				liveLink.href = "/Club/Matches/Live.aspx?actionType=addMatch&matchID=" + matchId;
				var liveImg = doc.createElement("img");
				liveImg.className = "matchHTLive";
				liveImg.src = "/Img/Icons/transparent.gif";
				liveImg.alt = liveImg.title = Foxtrickl10n.getString("htLive");
				liveLink.appendChild(liveImg);
				resultCell.appendChild(liveLink);
			}
			Foxtrick.addClass(resultCell, "nowrap");
			row.appendChild(resultCell);
			return row;
		};

		table.appendChild(getMatchRow());
	}
};
