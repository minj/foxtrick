/*
 * live-alert.js
 * Alerting HT Live goals
 * @author ryanli
 */

var FoxtrickLiveAlert = {
	MODULE_NAME : "LiveAlert",
	MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : [ "matchesLive" ],

	store : {},

	run : function(page, doc) {
		this.alert(doc);
	},

	change : function(page, doc) {
		this.alert(doc);
	},

	getScoreFromTab : function(tab) {
		try {
			var doc = tab.ownerDocument;
			if (tab.getElementsByClassName("liveTabScore").length > 0) {
				var score = tab.getElementsByClassName("liveTabScore")[0].textContent;
				if (score == "")
					return;
				const scoreRe = new RegExp("(\\d+)\\s*-\\s*(\\d+)");
				var scoreMatch = score.match(scoreRe);
				if (!Foxtrick.isRTLLayout(doc))
					return [parseInt(scoreMatch[1]), parseInt(scoreMatch[2])];
				else
					return [parseInt(scoreMatch[2]), parseInt(scoreMatch[1])];
			}
			return null;
		}
		catch (e) {
			Foxtrick.log("Cannot parse score \"", score, "\"");
			return null;
		}
	},

	getTeamsFromTab : function(tab) {
		var links = tab.getElementsByTagName("a");
		if (links.length == 2) {
			// expanded tab with team names as links
			return [links[0].textContent, links[1].textContent];
		}
		else {
			var teams = tab.childNodes[tab.childNodes.length - 1].textContent;
			teams = Foxtrick.trim(teams);
			return teams.split(" - ");
		}
	},

	alert : function(doc) {
		var tabs = doc.getElementsByClassName("liveTabText");
		for (var i = 0; i < tabs.length; ++i) {
			var tab = tabs[i];
			var score = this.getScoreFromTab(tab);
			if (score !== null) {
				var teams = this.getTeamsFromTab(tab);
				var teamsText = teams[0] + "-" + teams[1]; // used as index
				if (this.store[teamsText] === undefined) {
					this.store[teamsText] = score;
				}
				else if (this.store[teamsText][0] < score[0] || this.store[teamsText][1] < score[1]) {
					// score has changed, alert
					this.store[teamsText] = score;
					Foxtrick.util.notify.create(
						"%h %H - %A %a".replace(/%h/, teams[0])
							.replace(/%H/, score[0])
							.replace(/%A/, score[1])
							.replace(/%a/, teams[1]),
						doc.location
					);
				}
			}
		}
	}
}
