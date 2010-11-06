/*
 * live-alert.js
 * Alerting HT Live goals
 * @author ryanli
 */

var FoxtrickLiveAlert = {
	MODULE_NAME : "LiveAlert",
	MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : [ "matchesLive" ],
	NEW_AFTER_VERSION : "0.5.3",
	LATEST_CHANGE : "Module for alerting HT Live goals",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,

	store : {},

	run : function(page, doc) {
		this.alert(doc);
	},

	change : function(page, doc) {
		this.alert(doc);
	},

	getScoreFromTab : function(tab) {
		if (tab.getElementsByClassName("liveTabScore").length > 0) {
			const scoreRe = new RegExp("^(\\d+)\\s*-\\s*(\\d+)$");
			var score = tab.getElementsByClassName("liveTabScore")[0].textContent;
			score = Foxtrick.trim(score);
			var scoreMatch = score.match(scoreRe);
			return [parseInt(scoreMatch[1]), parseInt(scoreMatch[2])];
		}
		return null;
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
				else if (this.store[teamsText][0] !== score[0] || this.store[teamsText][1] !== score[1]) {
					// score has changed, alert
					this.store[teamsText] = score;
					FoxtrickAlert.foxtrick_showAlert_std(teams[0] + " " + score[0] + ":" + score[1] + " " + teams[1], doc.location);
				}
			}
		}
	}
}
