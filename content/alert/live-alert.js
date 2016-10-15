'use strict';
/*
 * live-alert.js
 * Alerting HT Live goals
 * @author ryanli
 */

Foxtrick.modules['LiveAlert'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.ALERT,
	PAGES: ['matchesLive'],
	OPTIONS: ['Sound', 'home', 'away', 'own', 'opponent'],
	OPTION_EDITS: true,
	OPTION_EDITS_DISABLED_LIST: [true, false, false, false, false],
	OPTION_EDITS_DATAURL_LOAD_BUTTONS: [false, true, true, true, true],
	OPTION_EDITS_DATAURL_IS_SOUND: [false, true, true, true, true],

	store: {},

	run: function(doc) {
		var results = doc.querySelector('#ngLive .htbox-content');
		var opts = { childList: true, characterData: true, subtree: true };
		Foxtrick.onChange(results, this.runTabs.bind(this), opts);
	},

	// onChange: function(doc) {
	// 	this.runTabs(doc);
	// },

	/**
	 * Get goals from tab.
	 *
	 * Returns [home, away] goals as integers
	 * @param  {element} tab
	 * @return {array}       <Array.<number>>
	 */
	getScoreFromTab: function(tab) {
		var ret = null;

		var scores = tab.querySelectorAll('.live-matchlist-item-score');
		var goals = Foxtrick.map(function(score) {
			return score.textContent;
		}, scores);
		ret = goals.map(function(s) { return parseInt(s, 10); });

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
		return Foxtrick.toArray(tab.querySelectorAll('.ellipsis'));
	},

	runTabs: function(doc, results) {
		var tabs = results.querySelectorAll('li');
		// skip first tab = header
		for (var tab of Foxtrick.toArray(tabs).slice(1)) {
			var score = this.getScoreFromTab(tab);
			if (score === null)
				continue;

			var teams = this.getTeamsFromTab(tab);

			var info = {
				homeGoals: score[0],
				homeName: teams[0].textContent,
				awayGoals: score[1],
				awayName: teams[1].textContent,
			};
			info.teamsText = info.homeName + '-' + info.awayName; // used as index

			this.alert(doc, info);
		}
	},

	alert: function(doc, info) {
		var ALERT_TMPL = '{homeName} {homeGoals} - {awayGoals} {awayName}';

		var score = [info.homeGoals, info.awayGoals];

		var store = this.store[info.teamsText];
		if (typeof store === 'undefined') {
			store = this.store[info.teamsText] = { score: score };
			return;
		}

		var homeScored = store.score[0] < score[0];
		var awayScored = store.score[1] < score[1];
		if (!homeScored && !awayScored)
			return;

		// score has changed, alert
		var own = {
			full: Foxtrick.modules.Core.TEAM.teamName,
			abbr: Foxtrick.modules.Core.TEAM.shortTeamName,
		};

		// README: during HT-Live games own.full == own.abbr!!!
		// FIXME: no way to recognize own goal during Live?!
		var isHomeOwn = own.abbr == info.homeName || // HT-Live
			// own.full == info.homeLong || // Re-Live
			own.full == info.homeName; // HT-Live fallback (if shortTeamName failed)

		var isAwayOwn = own.abbr == info.awayName || // HT-Live
			// own.full == info.awayLong || // Re-Live
			own.full == info.awayName; // HT-Live fallback (if shortTeamName failed)

		var ownScored = isHomeOwn && homeScored || isAwayOwn && awayScored;
		var opScored = isHomeOwn && awayScored || isAwayOwn && homeScored;

		store.score = score;
		// show notification
		var txt = Foxtrick.format(ALERT_TMPL, info);
		var url = doc.location.href;

		Foxtrick.util.notify.create(txt, url, { id: info.teamsText });

		// play sound if enabled
		if (!Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'Sound'))
			return;

		var sound = null;

		if (ownScored && Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'own'))
			sound = Foxtrick.Prefs.getString('module.LiveAlert.own_text');
		else if (opScored && Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'opponent'))
			sound = Foxtrick.Prefs.getString('module.LiveAlert.opponent_text');
		else if (homeScored && Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'home'))
			sound = Foxtrick.Prefs.getString('module.LiveAlert.home_text');
		else if (awayScored && Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'away'))
			sound = Foxtrick.Prefs.getString('module.LiveAlert.away_text');

		if (sound)
			Foxtrick.playSound(sound);

	},
};
