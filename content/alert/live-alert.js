'use strict';
/*
 * live-alert.js
 * Alerting HT Live goals
 * @author ryanli
 */

Foxtrick.modules['LiveAlert'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.ALERT,
	PAGES: ['matchesLive'],
	OPTIONS: ['Sound', 'home', 'away', 'own'],
	OPTION_EDITS: true,
	OPTION_EDITS_DISABLED_LIST: [true, false, false, false],
	OPTION_EDITS_DATAURL_LOAD_BUTTONS: [false, true, true, true],
	OPTION_EDITS_DATAURL_IS_SOUND: [false, true, true, true],

	store: {},

	run: function(doc) {
		this.alert(doc);
		var results = Foxtrick.getMBElement(doc, 'UpdatePanelPopupMessages');
		Foxtrick.onChange(results, this.alert.bind(this));
	},

	onChange: function(doc) {
		this.alert(doc);
	},

	/**
	 * Get goals from tab.
	 *
	 * Returns [home, away] goals as integers
	 * @param  {element} tab
	 * @return {array}       <Array.<number>>
	 */
	getScoreFromTab: function(tab) {
		var ret = null;

		var score = tab.querySelector('.liveTabScore');
		var match = score.textContent.trim().match(/^(\d+) - (\d+)$/);
		if (match) {
			var goals = Foxtrick.toArray(match).slice(1);
			ret = goals.map(function(s) { return parseInt(s, 10); });
		}

		return ret;
	},

	/**
	 * Get team elements from tab.
	 *
	 * Returns an [home, away] where teams are either links or spans.
	 * team.title = full team name team.textContent = shortTeamName.
	 * @param  {element} tab
	 * @return {array}       {Array.<HTMLAnchorElement|HTMLSpanElement}
	 */
	getTeamsFromTab: function(tab) {
		return [tab.querySelector('.hometeam'), tab.querySelector('.awayteam')];
	},

	alert: function(doc) {
		var ALERT_TMPL = '{homeShort} {homeGoals} - {awayGoals} {awayShort}';
		var tabs = doc.getElementsByClassName('liveTabText');
		// skip first tab = header
		for (var i = 1; i < tabs.length; ++i) {
			var tab = tabs[i];
			var score = this.getScoreFromTab(tab);
			if (score === null)
				continue;

			var teams = this.getTeamsFromTab(tab);

			var info = {
				homeGoals: score[0],
				homeShort: teams[0].textContent,
				homeLong: teams[0].title,
				awayGoals: score[1],
				awayShort: teams[1].textContent,
				awayLong: teams[1].title,
			};

			var teamsText = info.homeShort + '-' + info.awayShort; // used as index
			if (typeof this.store[teamsText] === 'undefined') {
				this.store[teamsText] = score;
				continue;
			}
			var homeScored = this.store[teamsText][0] < score[0];
			var awayScored = this.store[teamsText][1] < score[1];
			if (homeScored || awayScored) {
				// score has changed, alert
				var own = Foxtrick.modules.Core.TEAM.teamName;
				var ownScored = own == info.homeLong && homeScored ||
					own == info.awayLong && awayScored;

				this.store[teamsText] = score;
				// show notification
				var txt = Foxtrick.format(ALERT_TMPL, info);
				var url = doc.location.href;
				var noop = function(response) {};

				Foxtrick.util.notify.create(txt, url, noop, { id: teamsText });
				// play sound if enabled
				if (Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'Sound')) {
					var sound = null;

					if (ownScored &&
					    Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'own'))
						sound = Foxtrick.Prefs.getString('module.LiveAlert.own_text');
					else if (homeScored &&
					         Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'home'))
						sound = Foxtrick.Prefs.getString('module.LiveAlert.home_text');
					else if (awayScored &&
					         Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'away'))
						sound = Foxtrick.Prefs.getString('module.LiveAlert.away_text');

					if (sound)
						Foxtrick.playSound(doc, sound);
				}
			}
		}
	},
};
