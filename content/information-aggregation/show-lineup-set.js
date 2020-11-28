/**
 * show-lineup-set.js
 *
 * highlight own team, teams that have set a lineup, ownerless teams,
 * and/or winning teams in league fixture/result tables.
 *
 * @author convinced, ryanli, teles, LA-MJ
 */

'use strict';

Foxtrick.modules.ShowLineupSet = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: [
		'series', 'youthSeries',
		'tournaments', 'tournamentsHistory', 'ladders',
		'oldSeries', 'marathon', 'seriesHistoryNew',
		'topScorers',
	],
	OPTIONS: ['LineupSet', 'Ownerless', 'Standing', 'Winning'],
	NICE: -2, // before ReLiveLinks
	// CSS: Foxtrick.InternalPath + 'resources/css/show-lineup-set.css',

	/**
	 * @param  {HTMLTableElement} table
	 * @return {boolean}
	 */
	isFixtureTable: function(table) {
		// README: ReLiveLinks breaks this detection
		return !!table.querySelector('a[href^="/Club/Matches/Live.aspx"]');
	},

	/**
	 * @param  {HTMLTableElement} table
	 * @return {boolean}
	 */
	isResultTable: function(table) {
		return Foxtrick.hasClass(table, 'left') && !this.isFixtureTable(table);
	},

	/** @param {document} doc */
	// eslint-disable-next-line complexity
	run: function(doc) {
		const module = this;
		const isRTL = Foxtrick.util.layout.isRtl(doc);

		var leagueTable = doc.querySelector('#mainBody table');
		if (!leagueTable) {
			Foxtrick.log('league table not found. Tournament has not started yet?');
			return;
		}

		/** @type {string[]} */
		var lineupSet = [];

		// check teams that have set a lineup
		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'LineupSet') &&
		    Foxtrick.isPage(doc, 'series')) {

			let newsFeed = Foxtrick.Pages.Series.getNewsFeed(doc);
			if (!newsFeed) {
				// archived series
				return;
			}

			let items = newsFeed.getElementsByClassName('feedItem');

			/**
			 * check whether an item is a set-lineup item, if is, return team
			 * name, otherwise return null
			 *
			 * @param  {Element} item
			 * @return {string}
			 */
			let getLineupTeam = function(item) {
				let teamLinks = item.querySelectorAll('a[href*="TeamID="]');
				if (teamLinks.length == 2)
					return teamLinks[0].textContent.trim();

				return null;
			};

			lineupSet = Foxtrick.map(getLineupTeam, items);
			lineupSet = Foxtrick.filter(n => n != null, lineupSet);
		}

		// check ownerless teams
		// get bots/ownerless
		let botLinks = leagueTable.querySelectorAll('a.shy');
		var bots = Foxtrick.map(n => n.textContent, botLinks);

		/**
		 * @param  {HTMLAnchorElement}          matchLink
		 * @return {[HTMLElement, HTMLElement]}           wrapped team names
		 */
		var splitMatchLink = function(matchLink) {
			var teams = matchLink.textContent.split('\u00a0-\u00a0');
			var teamNode0 = doc.createElement('span');
			teamNode0.textContent = teams[0];
			var teamNode1 = doc.createElement('span');
			teamNode1.textContent = teams[1];

			Foxtrick.addClass(matchLink, 'nowrap');
			matchLink.textContent = '';
			matchLink.appendChild(teamNode0);
			matchLink.appendChild(doc.createTextNode('\u00a0-\u00a0'));
			matchLink.appendChild(teamNode1);
			Foxtrick.makeFeaturedElement(matchLink, module);

			return [teamNode0, teamNode1];
		};

		/**
		 * @param {HTMLAnchorElement}          link
		 * @param {[HTMLElement, HTMLElement]} teamWrappers
		 * @param {string[]}                   teamsNeedle
		 * @param {string}                     className
		 */
		var markTeams = function(link, teamWrappers, teamsNeedle, className) {
			let [first, second] = teamWrappers;
			for (let teamNeedle of teamsNeedle) {
				let pos = link.title.trim().indexOf(teamNeedle);
				if (pos == -1) {
					// Foxtrick.log(`WARNING: team '${teamNeedle}' not found in '${link.title}'`);
					continue;
				}

				let target = pos == 0 ? first : second;
				Foxtrick.addClass(target, className);
			}
		};

		/** @type {Iterable<HTMLTableElement>} */
		var tables = doc.querySelectorAll('#mainBody table');

		// only deal with fixture/result tables
		tables = Foxtrick.filter(function(n) {
			return module.isFixtureTable(n) || module.isResultTable(n);
		}, tables);

		for (let table of tables) {
			if (module.isFixtureTable(table))
				Foxtrick.addClass(table, 'ft_league_matches');
			else if (module.isResultTable(table))
				Foxtrick.addClass(table, 'ft_league_results');

			let rows = Foxtrick.toArray(table.rows).slice(1); // skip header
			for (let row of rows) {
				if (row.cells.length < 2)
					continue; // not a valid fixture/result row

				let link = row.querySelector('a');
				let teams = splitMatchLink(link);
				let [home, away] = teams;

				if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Ownerless'))
					markTeams(link, teams, bots, 'shy');

				// lineup set (for future matches only)
				if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'LineupSet') &&
				    module.isFixtureTable(table))
					markTeams(link, teams, lineupSet, 'bold');

				// wins (for results only)
				if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Winning') &&
				    module.isResultTable(table)) {

					let goals = row.cells[1].textContent.trim().split(/\s*-\s*/);
					let [first, second] = goals;
					let goalDiff = parseInt(first, 10) - parseInt(second, 10);

					if (isRTL)
						goalDiff *= -1; // reverted for RTL

					if (goalDiff > 0)
						Foxtrick.addClass(home, 'bold');
					else if (goalDiff < 0)
						Foxtrick.addClass(away, 'bold');
				}
			}
		}

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Standing'))
			module.detectOwnTeam(doc);
	},

	/** @param {document} doc */
	change: function(doc) {
		if (Foxtrick.isPage(doc, 'seriesHistoryNew'))
			this.run(doc);
	},

	/** @param {document} doc */
	detectOwnTeam: function(doc) {
		const module = this;

		let ownTeamId = Foxtrick.isPage(doc, 'youthSeries') ?
			Foxtrick.util.id.getOwnYouthTeamId() :
			Foxtrick.util.id.getOwnTeamId();

		let ownTeamReText = `TeamID=${ownTeamId}(?!\\d)`; // lookahead to ignore longer IDs;
		let ownTeamRe = new RegExp(ownTeamReText, 'i');

		/** @type {Iterable<HTMLTableElement>} */
		let tables = doc.querySelectorAll('#mainBody table.indent');

		// skip fixture/result tables
		tables = Foxtrick.filter(function(t) {
			return !module.isFixtureTable(t) && !module.isResultTable(t);
		}, tables);

		for (let table of tables) {
			for (let row of Foxtrick.toArray(table.rows)) {
				let links = row.querySelectorAll('a');
				for (let link of Foxtrick.toArray(links)) {
					if (!ownTeamRe.test(link.href))
						continue;

					Foxtrick.makeFeaturedElement(row, module);

					for (let cell of Foxtrick.toArray(row.cells))
						Foxtrick.addClass(cell, 'bold');

					break;
				}
			}
		}

	},
};
