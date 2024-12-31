/**
 * live-alert.js
 * Alerting HT Live goals
 * @author ryanli
 */

'use strict';

Foxtrick.modules['LiveAlert'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.ALERT,
	PAGES: ['matchesLive'],
	OPTIONS: ['Notification', 'Sound', 'home', 'away', 'own', 'opponent'],
	OPTION_EDITS: true,
	OPTION_EDITS_DISABLED_LIST: [true, true, false, false, false, false],
	OPTION_EDITS_DATAURL_LOAD_BUTTONS: [false, false, true, true, true, true],
	OPTION_EDITS_DATAURL_IS_SOUND: [false, false, true, true, true, true],

	store: {},

	run: function(doc) {
		let isNewLive = Foxtrick.Pages.Match.isNewLive(doc);
		let results = isNewLive ?
			doc.querySelector('#ngLive .ht-tabs') :
			Foxtrick.getMBElement(doc, 'UpdatePanelPopupMessages');

		if (!results)
			return;

		let opts = { childList: true, characterData: true, subtree: true };
		Foxtrick.onChange(results, this.runTabs.bind(this), opts);

		if (!isNewLive)
			return;

		// call runTabs after page load to set initial stored values for scores
		this.runTabs(doc, results);

		/*
		 * The score tabs in the Live scores banner now update immediately,
		 * so we no longer need this. 
		 *
		// add overlay pre-announce support
		let container = doc.querySelector('.live-left-container');
		if (container)
			Foxtrick.onChange(container, this.runOverlay.bind(this));
		*/
	},

	// onChange: function(doc) {
	// 	this.runTabs(doc);
	// },

	runOverlay: function(doc) {
		var overlay = doc.querySelector('.pitchOverlay');
		if (!overlay)
			return;

		var goal = doc.querySelector('.live-goal:not(.ng-hide)');
		if (!goal)
			return;

		var tab = doc.querySelector('.live-matchlist-item.live-matchlist-item-selected, ' +
			'.ht-tabs-last-row.ht-tabs-item-selected');

		var score = this.getScoreFromTab(tab);
		if (score === null)
			return;

		// new goal logic
		var scorer = doc.querySelector('.specialMention');
		if (!scorer || scorer.dataset.done)
			return;

		scorer.dataset.done = true; // use a tag to prevent alerting twice during match change

		if (Foxtrick.hasClass(scorer, 'bench-home'))
			score[0]++;
		else if (Foxtrick.hasClass(scorer, 'bench-away'))
			score[1]++;

		var teams = this.getTeamsFromTab(tab);

		this.alert(doc, teams, score);
	},

	/**
	 * Get goals from tab.
	 *
	 * Returns [home, away] goals as integers
	 * @param  {Element} tab Element containing team names and score
	 * @return {Array}       <Array.<number>>
	 */
	getScoreFromTab: function(tab) {
		if (!tab)
			return null;

		var goals = null;

		if (Foxtrick.Pages.Match.isNewLive(tab.ownerDocument)) {
			var scores = tab.querySelectorAll('.live-matchlist-item-score');
			goals = Foxtrick.map(function(score) {
				return parseInt(score.textContent, 10);
			}, scores);
		}
		else {
			var score = tab.querySelector('.liveTabScore');
			var match = score.textContent.trim().match(/^(\d+) - (\d+)$/);
			if (match) {
				goals = Foxtrick.toArray(match).slice(1);
				goals = goals.map(function(s) { return parseInt(s, 10); });
			}
		}

		return goals;
	},

	/**
	 * Get team elements from tab.
	 *
	 * Returns an [home, away] where teams are either links or spans.
	 * team.title = full team name team.textContent = shortTeamName.
	 * @param  {Element} tab Element containing team names and score
	 * @return {Array}       {Array.<HTMLAnchorElement|HTMLSpanElement}
	 */
	getTeamsFromTab: function(tab) {
		var ret = null;

		if (Foxtrick.Pages.Match.isNewLive(tab.ownerDocument))
			ret = Foxtrick.toArray(tab.querySelectorAll('span.ellipsis'));
		else
			ret = [tab.querySelector('.hometeam'), tab.querySelector('.awayteam')];

		return ret;
	},

	runTabs: function(doc, results) {
		var isNewLive = Foxtrick.Pages.Match.isNewLive(doc);

		var tabs = isNewLive ? results.querySelectorAll('li') :
			doc.querySelectorAll('.liveTabText');

		// skip first tab = overview/header
		for (var tab of Foxtrick.toArray(tabs).slice(1)) {
			if (!tab.childElementCount)
				continue;

			var score = this.getScoreFromTab(tab);
			if (score === null)
				continue;

			var teams = this.getTeamsFromTab(tab);

			this.alert(doc, teams, score);
		}
	},

	alert: function(doc, teams, score) {
		const MODULE = this;

		var ALERT_TMPL = '{homeFull} {homeGoals} - {awayGoals} {awayFull}';

		var homeText = teams[0].textContent;
		var homeTitle = teams[0].title;
		var homeFull = homeTitle.length > homeText.length ? homeTitle : homeText;

		var awayText = teams[1].textContent;
		var awayTitle = teams[1].title;
		var awayFull = awayTitle.length > awayText.length ? awayTitle : awayText;

		var info = {
			homeGoals: score[0],
			homeFull: homeFull,
			awayGoals: score[1],
			awayFull: awayFull,
		};

		info.teamsText = info.homeFull + '-' + info.awayFull; // used as index

		var store = this.store[info.teamsText];
		if (typeof store === 'undefined') {
			this.store[info.teamsText] = { score: score };
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

		var isHomeOwn = own.full === info.homeFull;
		var isAwayOwn = own.full === info.awayFull;

		var ownScored = isHomeOwn && homeScored || isAwayOwn && awayScored;
		var opScored = isHomeOwn && awayScored || isAwayOwn && homeScored;

		store.score = score;

		// show notification if enabled
		if (Foxtrick.Prefs.isModuleOptionEnabled('LiveAlert', 'Notification')) {
			var txt = Foxtrick.format(ALERT_TMPL, info);
			var url = doc.location.href;

			Foxtrick.util.notify.create(txt, url, { id: info.teamsText })
				.catch(e => e.message != Foxtrick.TIMEOUT_ERROR ? Promise.reject(e) : e)
				// @ts-ignore: MODULE_NAME is set after module is loaded
				.catch(Foxtrick.catch(MODULE));
		}

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
