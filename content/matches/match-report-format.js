"use strict";
/**
 * Formats the match report.
 * @author spambot, ryanli, CatzHoek
 */

/*
 * Match examples:
 * Match with penalty shoot-out:
 * http://www.hattrick.org/Club/Matches/Match.aspx?matchID=347558980
 */

Foxtrick.util.module.register((function() {

	/* Community/CHPP/ChppMatchEventTypes.aspx
	 * Event Types and Icon mapping
	 * 
	 * 20,21,40,47,70,71,599 are used for match indicators, don't convert them to objects
	 * 
	 * for events that require several icons specify a dictionary with  
	 * keys "team" and "other" and an array of icons as values. 
	 * If only one team needs icons the other key can be omnitted.
	 * 
	 * Example: 
	 * { "team": ["miss", "se_technical"], "other": ["se_head_specialist"] },
	 */
	var eventTypes = {
		"20" : "formation",
		"21" : "formation",
		"40" : "possession",
		"41" : "best player",
		"42" : "worst player",
		"47" : "possession",
		"55" : { "team": ["goal", "se_technical"] },
		"56" : "goal",
		"57" : "goal",
		"58" : "miss",
		"59" : "miss",
		"70" : "extraTime",
		"71" : "penaltyShootOut",
		"90" : "bruised",
		"91" : { "team": ["injured", "substitution"] },
		"92" : { "team": ["injured", "substitution"] },
		"93" : { "team": ["injured", "sub_out"] },
		"94" : "bruised",
		"95" : { "team": ["injured", "substitution"] },
		"96" : { "team": ["injured", "sub_out"] },
		"97" : { "team": ["injured", "formation"] },
		"100" : "goal",
		"101" : "goal",
		"102" : "goal",
		"103" : "goal",
		"104" : "goal",
		"105" : { "team": ["goal", "se_unpredictable"] },
		"106" : { "team": ["goal", "se_unpredictable"] },
		"107" : "goal",
		"108" : { "team": ["goal", "se_unpredictable"] },
		"109" : { "team": ["goal", "se_unpredictable"] },
		"110" : "goal",
		"111" : "goal",
		"112" : "goal",
		"113" : "goal",
		"114" : "goal",
		"115" : { "team": ["goal", "se_quick"] },
		"116" : { "team": ["goal", "se_quick"] },
		"117" : { "team": ["goal"], "other": ["tired"] },
		"118" : "goal",
		"119" : { "team": ["goal", "se_head_specialist"] },
		"120" : "goal",
		"121" : "goal",
		"122" : "goal",
		"123" : "goal",
		"124" : "goal",
		"125" : { "team": ["goal", "se_unpredictable"] },
		"130" : "goal",
		"131" : "goal",
		"132" : "goal",
		"133" : "goal",
		"134" : "goal",
		"137" : { "team": ["goal", "se_head_specialist"] },
		"138" : "goal",
		"139" : { "team": ["se_technical"], "other": ["se_head_specialist"] },
		"140" : "goal",
		"141" : "goal",
		"142" : "goal",
		"143" : "goal",
		"150" : "goal",
		"151" : "goal",
		"152" : "goal",
		"153" : "goal",
		"154" : "goal",
		"160" : "goal",
		"161" : "goal",
		"162" : "goal",
		"163" : "goal",
		"164" : "goal",
		"170" : "goal",
		"171" : "goal",
		"172" : "goal",
		"173" : "goal",
		"174" : "goal",
		"180" : "goal",
		"181" : "goal",
		"182" : "goal",
		"183" : "goal",
		"184" : "goal",
		"185" : "goal",
		"186" : "goal",
		"187" : "goal",
		"200" : "miss",
		"201" : "miss",
		"202" : "miss",
		"203" : "miss",
		"204" : "miss",
		"205" : { "team": ["miss", "se_unpredictable"] },
		"206" : { "team": ["miss", "se_unpredictable"] },
		"208" : { "team": ["miss", "se_unpredictable"] },
		"209" : { "team": ["miss", "se_unpredictable"] },
		"210" : "miss",
		"211" : "miss",
		"212" : "miss",
		"213" : "miss",
		"214" : "miss",
		"215" : { "team": ["miss", "se_quick"] },
		"216" : { "team": ["miss", "se_quick"] },
		"217" : { "team": ["miss"], "other": ["tired"] },
		"218" : "miss",
		"219" : { "team": ["miss", "se_head_specialist"] },
		"220" : "miss",
		"221" : "miss",
		"222" : "miss",
		"223" : "miss",
		"224" : "miss",
		"225" : { "team": ["miss", "se_unpredictable"] },
		"230" : "miss",
		"231" : "miss",
		"232" : "miss",
		"233" : "miss",
		"234" : "miss",
		"235" : "miss",
		"236" : "miss",
		"237" : "miss",
		"239" : { "team": ["miss", "se_technical"], "other": ["se_head_specialist"] },
		"240" : "miss",
		"241" : "miss",
		"242" : "miss",
		"243" : "miss",
		"250" : "miss",
		"251" : "miss",
		"252" : "miss",
		"253" : "miss",
		"254" : "miss",
		"260" : "miss",
		"261" : "miss",
		"262" : "miss",
		"263" : "miss",
		"264" : "miss",
		"270" : "miss",
		"271" : "miss",
		"272" : "miss",
		"273" : "miss",
		"274" : "miss",
		"280" : "miss",
		"281" : "miss",
		"282" : "miss",
		"283" : "miss",
		"284" : "miss",
		"285" : "miss",
		"286" : "miss",
		"287" : "miss",
		"288" : "miss",
		"289" : { "team": ["se_quick"], "other": ["se_quick"] },
		"301" : "se_technical",
		"302" : "se_powerful",
		"303" : "se_technical",
		"304" : "se_powerful",
		"305" : "se_quick",
		"306" : "se_quick",
		"350" : "substitution",
		"351" : "substitution",
		"352" : "substitution",
		"360" : "change of tactics",
		"361" : "change of tactics",
		"362" : "formation",
		"370" : "swap",
		"371" : "swap",
		"372" : "swap",
		"510" : "yellow card",
		"511" : "yellow card",
		"512" : { "team": ["yellow card", "red card"] },
		"513" : { "team": ["yellow card", "red card"] },
		"514" : "red card",
		"599": "result"
	};
	var icons = {
		"bruised":"/Img/Icons/bruised.gif",
		"best player":"/Img/Matches/star_yellow.png",
		"change of tactics":"/Img/Matches/behaviorchange.gif",
		"formation":"/Img/Matches/formation.gif",
		"goal": Foxtrick.InternalPath + 'resources/img/ball.png',
		"injured":"/Img/Icons/injured.gif",
		"injured_leaves": ["/Img/Icons/injured.gif","/Img/Matches/substitution.gif"],
		"miss" : Foxtrick.InternalPath + 'resources/img/redball.png',
		"red card":"/Img/Icons/red_card.gif",
		"se_head_specialist": Foxtrick.InternalPath + 'resources/img/spec5.png',
		"se_technical": Foxtrick.InternalPath + 'resources/img/spec1.png',	
		"se_powerful": Foxtrick.InternalPath + 'resources/img/spec3.png',
		"se_quick": Foxtrick.InternalPath + 'resources/img/spec2.png',		
		"se_unpredictable": Foxtrick.InternalPath + 'resources/img/spec4.png',		
		"substitution":"/Img/Matches/substitution.gif",
		"sub_out":"/Img/Matches/sub_out.gif",
		"swap" : "/Img/Matches/player_swap.gif",
		"tired" : Foxtrick.InternalPath + 'resources/img/tired.png',
		"worst player" : "/Img/Matches/star_brown.png",
		"yellow card":"/Img/Icons/yellow_card.gif"
		
	}
	
	var orderTypes = {
		"1" : "substitution",
		"2" : "swap"
	};
	//Community/CHPP/NewDocs/DataTypes.aspx#matchRoleID
	var roles = {
		"17" : "setPieces",
		"18" : "captain"
	};
	return {
		MODULE_NAME : "MatchReportFormat",
		MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
		PAGES : ["match"],
		OPTIONS : ['ShowEventIcons'],
		CSS : Foxtrick.InternalPath + "resources/css/match-report.css",

		run : function(doc) {
			var txtUnknownPlayer = Foxtrickl10n.getString("match.player.unknown");

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
							}, xml.getElementsByTagName("Lineup")[0].getElementsByTagName("Player"));

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
								if (!collection[id]) {
									// add red carded players
									collection[id] = { "name": name };
								}
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
									// FIXME - due to a bug in HT's matchlineup XML,
									// substitutions carried off may not be shown
									if (collection[objId] == undefined) {
										collection[objId] = { "name": txtUnknownPlayer };
									}
									// add in line up
									subNode.appendChild(playerTag(objId, collection[objId].name));
									addComment(subId, subNode);
									// since object player now occupy the
									// same list item as subject player,
									// set up item and comment
									collection[objId].item = collection[subId].item;
									collection[objId].comment = collection[subId].item;
								}
							}, substitutions);
						}, [[homeName, homeXml], [awayName, awayXml]]);

						Foxtrick.listen(header, "click", function() {
							Foxtrick.toggleClass(header, "ft-expander-unexpanded");
							Foxtrick.toggleClass(header, "ft-expander-expanded");
							Foxtrick.toggleClass(lineup, "hidden");
						}, false)

						// report header
						var reportHeader = doc.createElement("h2");
						parent.insertBefore(reportHeader, before);
						reportHeader.className = "ft-expander-expanded";
						reportHeader.textContent = Foxtrickl10n.getString("MatchReportFormat.MatchReport");
						
						// container of formatted report
						var report = doc.createElement("div");
						report.className = "ft-match-report";
						parent.insertBefore(report, before);
						
						Foxtrick.listen(reportHeader, "click", function() {
							Foxtrick.toggleClass(reportHeader, "ft-expander-unexpanded");
							Foxtrick.toggleClass(reportHeader, "ft-expander-expanded");
							Foxtrick.toggleClass(report, "hidden");
						}, false)

						// wait for kick-off (walkovers don't allow to count event 21 (lineups))
						var koPending = true;
						// generate report from events
						var events = xml.getElementsByTagName("Event");
						Foxtrick.map(function(evt) {
							var evtMin = evt.getElementsByTagName("Minute")[0].textContent;
							var evtMarkup = evt.getElementsByTagName("EventText")[0].textContent.replace(RegExp("<br\\s*/?>", "g"), "");
							var evtTeamId = evt.getElementsByTagName("SubjectTeamID")[0].textContent;
							var evtType = evt.getElementsByTagName("EventKey")[0].textContent.replace(/_.+/, "");

							if (evtMarkup != "") {
								//kickoff indicator 

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

								//event type icon
								var addEventIcons = function(id){
									if(FoxtrickPrefs.isModuleOptionEnabled("MatchReportFormat", "ShowEventIcons")){
										var addEventIcon = function(src, title, alt) {
											var img = doc.createElement("img");
											icon.appendChild(img);
											img.className = "ft-match-report-event-icon-image";
											img.src = src;
											img.title = title;
										}
										
										var icon = doc.createElement("div");
										item.appendChild(icon);
										icon.className = "ft-match-report-event-icon";
										
										//icons for both columns (e.g.: Header vs. quick etc.)
										if(typeof(eventTypes[evtType]) == "object"){
											//event team
											if(evtTeamId == id) {
												if (eventTypes[evtType]["team"])
													for(var i = 0; i < eventTypes[evtType]["team"].length; ++i)
														addEventIcon(icons[eventTypes[evtType]["team"][i]], "Event Id: " + evtType);											
											} 
											else {
												if (eventTypes[evtType]["other"])
													for(var i = 0; i < eventTypes[evtType]["other"].length; ++i)
														addEventIcon(icons[eventTypes[evtType]["other"][i]], "Event Id: " + evtType);
											} 
										} 
										//simple case, display icon for team
										else if(eventTypes[evtType] && icons[eventTypes[evtType]]){
											if(id != evtTeamId)
												return;
											if(icons[eventTypes[evtType]] instanceof Array){
												for(var i = 0; i < icons[eventTypes[evtType]].length; ++i)
													addEventIcon(icons[eventTypes[evtType]][i], "Event Id: " + evtType);
											}
											else {
												addEventIcon(icons[eventTypes[evtType]],"Event Id: " + evtType);
											}
										}
									}
								}
								
								addEventIcons(homeId);
								addEventIcons(awayId);
								
								//event text
								var content = doc.createElement("div");
								item.appendChild(content);
								content.className = "ft-match-report-event-content";
								content.innerHTML = evtMarkup;
								
								var clear = doc.createElement("div");
								item.appendChild(clear);
								clear.className = "clear";

								// indicators to be added
								var indicatorList = [
									{
										"class": "kick-off",
										"text": "kickOff",
										"before": true,
										"func": (function() {
											return function() {
												if (koPending && evtMin != "0") {
													koPending = false;
													return true;
												}
												else {
													return false;
												}
											};
										})()
									},
									{
										"class": "half-time",
										"text": "halfTime",
										"func": function() { return (eventTypes[evtType] == "possession") && (evtMin == "45"); }
									},
									{
										"class": "full-time",
										"text": "fullTime",
										"func": function() { return (eventTypes[evtType] == "possession") && (evtMin == "90"); }
									},
									{
										"class": "extra-time",
										"text": "extraTime",
										"func": function() { return eventTypes[evtType] == "extraTime"; }
									},
									{
										"class": "penalty-shoot-out",
										"text": "penaltyShootOut",
										"func": function() { return eventTypes[evtType] == "penaltyShootOut"; }
									},
									{
										"class": "result",
										"text": "result",
										"before": true,
										"func": function() { return eventTypes[evtType] == "result"; }
									}
								];
								var indType = Foxtrick.nth(0, function(n) {
									return n.func();
								}, indicatorList);
								if (indType) {
									// found a matching indicator
									var indicator = doc.createElement("div");
									indicator.textContent = Foxtrickl10n.getString("MatchReportFormat." + indType.text);
									indicator.className = "ft-match-report-" + indType["class"];
									if (indType.before) {
										report.insertBefore(indicator, item);
									}
									else {
										report.appendChild(indicator);
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
