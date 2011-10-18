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
	return {
		MODULE_NAME : "MatchReportFormat",
		MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
		PAGES : ["match"],

		CSS : Foxtrick.InternalPath + "resources/css/match-report.css",

		run : function(doc) {
			if (Foxtrick.Pages.Match.isPrematch(doc))
				return;

			var isYouth = Foxtrick.Pages.Match.isYouth(doc);
			var matchId = Foxtrick.Pages.Match.getId(doc);
			var args = [
				["file", "matchdetails"],
				["matchEvents", "true"],
				["matchID", matchId],
				["isYouth", isYouth]
			];

			Foxtrick.util.api.retrieve(doc, args, {cache_lifetime: "session"},
				function(xml) {
					// add everything after .byline[0] and remove existing ones
					var byline = doc.getElementsByClassName("byline")[0];
					while (!Foxtrick.hasClass(byline.nextSibling, "mainBox"))
						byline.parentNode.removeChild(byline.nextSibling);

					// container of formatted report
					var report = doc.createElement("div");
					report.className = "ft-match-report";
					byline.parentNode.insertBefore(report, byline.nextSibling);

					var homeId = xml.getElementsByTagName("HomeTeamID")[0].textContent;
					var awayId = xml.getElementsByTagName("AwayTeamID")[0].textContent;

					var events = xml.getElementsByTagName("Event");
					Foxtrick.map(function(evt) {
						var evtMin = evt.getElementsByTagName("Minute")[0].textContent;
						var evtMarkup = evt.getElementsByTagName("EventText")[0].textContent.replace(RegExp("<br\\s*/?>", "g"), "");
						var evtTeamId = evt.getElementsByTagName("SubjectTeamID")[0].textContent;
						var evtType = evt.getElementsByTagName("EventKey")[0].textContent.replace(/_.+/, "");

						if (evtMarkup != "") {
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
			});
		}
	};
}()));
