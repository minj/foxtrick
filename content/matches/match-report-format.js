"use strict";
/**
 * Formats the match report.
 * @author spambot, ryanli
 */

Foxtrick.util.module.register((function() {
	var eventTypes = {
		"40" : "possession",
		"47" : "possession"
	};
	var orderTypes = {
		"1" : "substitution",
		"2" : "swap"
	};
	var roles = {
		"17" : "setPieces",
		"18" : "captain"
	};
	return {
		MODULE_NAME : "MatchReportFormat",
		MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
		PAGES : ["match"],

		CSS : Foxtrick.InternalPath + "resources/css/match-report.css",

		run : function(doc) {
			if (Foxtrick.Pages.Match.isPrematch(doc)
				|| Foxtrick.Pages.Match.inProgress(doc))
				return;

			var isYouth = Foxtrick.Pages.Match.isYouth(doc);
			var matchId = Foxtrick.Pages.Match.getId(doc);
			// add locale as argument to prevent using old cache after
			// language changed
			var locale = FoxtrickPrefs.getString("htLanguage");
			var detailsArgs = [
				["file", "matchdetails"],
				["matchEvents", "true"],
				["matchID", matchId],
				["isYouth", isYouth],
				["lang", locale]
			];

			var playerTag = function(id, name) {
				var link = doc.createElement("a");
				link.textContent = name;
				link.href = "/Club/Players/Player.aspx?playerId=" + id;
				link.setAttribute("data-do-not-color", "true");
				return link;
			};

			Foxtrick.util.api.retrieve(doc, detailsArgs, {cache_lifetime: "session"}, function(xml) {
				var homeId = xml.getElementsByTagName("HomeTeamID")[0].textContent;
				var awayId = xml.getElementsByTagName("AwayTeamID")[0].textContent;
				var homeName = xml.getElementsByTagName("HomeTeamName")[0].textContent;
				var awayName = xml.getElementsByTagName("AwayTeamName")[0].textContent;

				var homeLineupArgs = [
					["file", "matchlineup"],
					["matchID", matchId],
					["teamID", homeId],
					["isYouth", isYouth],
					["version", "1.6"]
				];
				var awayLineupArgs = [
					["file", "matchlineup"],
					["matchID", matchId],
					["teamID", awayId],
					["isYouth", isYouth],
					["version", "1.6"]
				];
				Foxtrick.util.api.retrieve(doc, homeLineupArgs, {cache_lifetime: "session"}, function(homeXml) {
					Foxtrick.util.api.retrieve(doc, awayLineupArgs, {cache_lifetime: "session"}, function(awayXml) {
						// add everything after .byline[0] and remove existing ones
						var byline = doc.getElementsByClassName("byline")[0];
						var parent = byline.parentNode;
						while (!Foxtrick.hasClass(byline.nextSibling, "mainBox"))
							parent.removeChild(byline.nextSibling);
						var before = byline.nextSibling;

						// lineup header
						var header = doc.createElement("h2");
						parent.insertBefore(header, before);
						header.className = "ft-expander-unexpanded";
						header.textContent = Foxtrickl10n.getString("MatchReportFormat.lineup");
						// container of lineup
						var lineup = doc.createElement("table");
						lineup.className = "ft-match-lineup hidden";
						parent.insertBefore(lineup, before);
						var row = doc.createElement("tr");
						lineup.appendChild(row);
						Foxtrick.map(function(pair) {
							var teamName = pair[0];
							var xml = pair[1];

							var cell = doc.createElement("td");
							row.appendChild(cell);

							var team = doc.createElement("h3");
							cell.appendChild(team);
							team.textContent = teamName;

							var list = doc.createElement("ul");
							cell.appendChild(list);

							// collection indexed by player ID, containing
							// name, list item, comment (in brackets), etc.
							var collection = {};

							Foxtrick.map(function(player) {
								var id = player.getElementsByTagName("PlayerID")[0].textContent;
								var name = player.getElementsByTagName("PlayerName")[0].textContent;
								if (!collection[id]) {
									collection[id] = { "name": name };
								}
							}, xml.getElementsByTagName("Player"));

							// add comment for player inside brackets
							var addComment = function(id, node) {
								if (!collection[id] || !collection[id].item)
									return;
								if (!collection[id].comment) {
									var comment = doc.createElement("span");
									comment.className = "ft-match-lineup-comment";
									collection[id].item.appendChild(comment);
									collection[id].comment = comment;
								}
								else {
									collection[id].comment.appendChild(doc.createTextNode(", "));
								}
								collection[id].comment.appendChild(node);
							};

							// add starting players first
							var starting = xml.getElementsByTagName("StartingLineup")[0].getElementsByTagName("Player");
							Foxtrick.map(function(player) {
								var id = player.getElementsByTagName("PlayerID")[0].textContent;
								var name = player.getElementsByTagName("PlayerName")[0].textContent;
								var role = player.getElementsByTagName("RoleID")[0].textContent;
								if (roles[role] != "setPieces"
									&& roles[role] != "captain") {
									var item = doc.createElement("li");
									list.appendChild(item);
									item.appendChild(playerTag(id, name));
									// store item to collection
									collection[id].item = item;
								}
								else {
									addComment(id, doc.createTextNode(Foxtrickl10n.getString("match.role.#.abbr".replace(/#/, roles[role]))));
								}
							}, starting);

							// and then add substitutions
							var substitutions = xml.getElementsByTagName("Substitution");
							Foxtrick.map(function(sub) {
								var type = sub.getElementsByTagName("OrderType")[0].textContent;
								// player to be substituted
								var subId = sub.getElementsByTagName("SubjectPlayerID")[0].textContent;
								// substitute player
								var objId = sub.getElementsByTagName("ObjectPlayerID")[0].textContent;
								var minute = sub.getElementsByTagName("MatchMinute")[0].textContent;
								if (orderTypes[type] == "substitution"
									&& subId != objId && objId > 0) {
									var subNode = doc.createElement("span");
									subNode.appendChild(doc.createTextNode(minute + "' "));
									try {
										subNode.appendChild(playerTag(objId, collection[objId].name));
										addComment(subId, subNode);
										// since object player now occupy the
										// same list item as subject player,
										// set up item and comment
										collection[objId].item = collection[subId].item;
										collection[objId].comment = collection[subId].item;
									} catch(e){
										Foxtrick.log('Unknown player involved in substitution', e)
									}
								}
							}, substitutions);
						}, [[homeName, homeXml], [awayName, awayXml]]);

						Foxtrick.listen(header, "click", function() {
							Foxtrick.toggleClass(header, "ft-expander-unexpanded");
							Foxtrick.toggleClass(header, "ft-expander-expanded");
							Foxtrick.toggleClass(lineup, "hidden");
						}, false)

						// container of formatted report
						var report = doc.createElement("div");
						report.className = "ft-match-report";
						parent.insertBefore(report, before);
						
						// wait for kickoff (walkovers don't allow to count event 21 (lineups))
						var kickoff_pending = true;
						// generate report from events
						var events = xml.getElementsByTagName("Event");
						Foxtrick.map(function(evt) {
							var evtMin = evt.getElementsByTagName("Minute")[0].textContent;
							var evtMarkup = evt.getElementsByTagName("EventText")[0].textContent.replace(RegExp("<br\\s*/?>", "g"), "");
							var evtTeamId = evt.getElementsByTagName("SubjectTeamID")[0].textContent;
							var evtType = evt.getElementsByTagName("EventKey")[0].textContent.replace(/_.+/, "");

							if (evtMarkup != "") {
								//kickoff indicator 
								if (kickoff_pending && evtMin != "0") {
									var ind = doc.createElement("div");
									report.appendChild(ind);
									ind.className = "ft-match-report-kick-off";
									ind.textContent = Foxtrickl10n.getString("MatchReportFormat.kickOff");
									kickoff_pending = false
								}
								// item to be added
								var item = doc.createElement("div");
								report.appendChild(item);
								item.className = "ft-match-report-event";
								if (evtTeamId == homeId)
									item.className += " ft-match-report-event-home";
								else if (evtTeamId == awayId)
									item.className += " ft-match-report-event-away";

								var minute = doc.createElement("div");
								item.appendChild(minute);
								minute.className = "ft-match-report-event-minute";
								minute.textContent = evtMin + "'";

								var content = doc.createElement("div");
								item.appendChild(content);
								content.className = "ft-match-report-event-content";
								content.innerHTML = evtMarkup;

								var clear = doc.createElement("div");
								item.appendChild(clear);
								clear.className = "clear";
								
								// half time or full time, add indicator
								if (eventTypes[evtType] == "possession") {
									var ind = doc.createElement("div");
									report.appendChild(ind);
									if (evtMin == "45") {
										ind.className = "ft-match-report-half-time";
										ind.textContent = Foxtrickl10n.getString("MatchReportFormat.halfTime");
									}
									else if (evtMin == "90") {
										ind.className = "ft-match-report-full-time";
										ind.textContent = Foxtrickl10n.getString("MatchReportFormat.fullTime");
									}
								}
							}
						}, events);
						if (FoxtrickPrefs.isModuleEnabled("MatchPlayerColouring")) {
							var mod = Foxtrick.util.module.get("MatchPlayerColouring");
							mod.color(doc);
						}
					});
				});
			});
		}
	};
}()));
