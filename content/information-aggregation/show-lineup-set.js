'use strict';
/**
 * show-lineup-set.js
 *
 * highlight own team, teams that have set a lineup, ownerless teams,
 * and/or winning teams in league fixture/result tables.
 *
 * @author convinced, ryanli, teles, LA-MJ
 */

Foxtrick.modules['ShowLineupSet'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: [
		'series', 'youthSeries',
		'tournaments', 'tournamentsHistory', 'ladders',
		'oldSeries', 'marathon',
		'topScorers',
	],
	OPTIONS: ['LineupSet', 'Ownerless', 'Standing', 'Winning'],
	NICE: -2, // before ReLiveLinks
	// CSS: Foxtrick.InternalPath + 'resources/css/show-lineup-set.css',

	isFixtureTable: function(table) {
		// README: ReLiveLinks breaks this detection
		return !!table.querySelector('a[href^="/Club/Matches/Live.aspx"]');
	},
	isResultTable: function(table) {
		return Foxtrick.hasClass(table, 'left') && !this.isFixtureTable(table);
	},

	run: function(doc) {
		var module = this;

		var leagueTable = doc.querySelector('#mainBody table');
		if (!leagueTable) {
			Foxtrick.log('league table not found. Tournament has not started yet?');
			return;
		}

		var isRTL = Foxtrick.util.layout.isRtl(doc);

		var lineupSet = [];

		// check teams that have set a lineup
		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'LineupSet') &&
		    Foxtrick.isPage(doc, 'series')) {

			var newsFeed = Foxtrick.Pages.Series.getNewsFeed(doc);
			var items = newsFeed.getElementsByClassName('feedItem');

			/**
			 * check whether an item is a set-lineup item, if is, return team
			 * name, otherwise return null
			 *
			 * @param  {element} item
			 * @return {string}
			 */
			var getLineupTeam = function(item) {
				var teamLinks = item.querySelectorAll('a[href*="TeamID="]');
				if (teamLinks.length == 2) {
					return teamLinks[0].textContent.trim();
				}
				return null;
			};

			lineupSet = Foxtrick.map(getLineupTeam, items);
			lineupSet = Foxtrick.filter(function(n) { return n != null; }, lineupSet);
		}

		// check ownerless teams
		// get bots/ownerless
		var botLinks = leagueTable.querySelectorAll('a.shy');
		var bots = Foxtrick.map(function(n) { return n.textContent; }, botLinks);

		var makeTeamsFromLink = function(link) {
			var teams = link.textContent.split('\u00a0-\u00a0');
			var teamNode0 = doc.createElement('span');
			teamNode0.textContent = teams[0];
			var teamNode1 = doc.createElement('span');
			teamNode1.textContent = teams[1];

			Foxtrick.addClass(link, 'nowrap');
			link.textContent = '';
			link.appendChild(teamNode0);
			link.appendChild(doc.createTextNode('\u00a0-\u00a0'));
			link.appendChild(teamNode1);
			link = Foxtrick.makeFeaturedElement(link, module);

			return [teamNode0, teamNode1];
		};

		var markTeams = function(link, teamsHay, teamsNeedle, className) {
			for (var teamNeedle of teamsNeedle) {
				var pos = link.title.trim().indexOf(teamNeedle);
				if (pos === 0)
					Foxtrick.addClass(teamsHay[0], className);
				else if (pos > 0)
					Foxtrick.addClass(teamsHay[1], className);
			}
		};


		var tables = doc.querySelectorAll('#mainBody table');
		// only deal with fixture/result tables
		tables = Foxtrick.filter(function(n) {
			return module.isFixtureTable(n) || module.isResultTable(n);
		}, tables);

		for (var table of tables) {
			if (module.isFixtureTable(table))
				Foxtrick.addClass(table, 'ft_league_matches');
			else if (module.isResultTable(table))
				Foxtrick.addClass(table, 'ft_league_results');

			var rows = Foxtrick.toArray(table.rows).slice(1); // skip header
			for (var row of rows) {
				if (row.cells.length < 2)
					continue; // not a valid fixture/result row

				var link = row.querySelector('a');
				var teams = makeTeamsFromLink(link);

				if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Ownerless'))
					markTeams(link, teams, bots, 'shy');

				// lineup set (for future matches only)
				if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'LineupSet') &&
				    module.isFixtureTable(table))
					markTeams(link, teams, lineupSet, 'bold');

				// wins (for results only)
				if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Winning') &&
				    module.isResultTable(table)) {

					var goals = row.cells[1].textContent.trim().split(/\s*-\s*/);
					var goal_dif = parseInt(goals[0]) - parseInt(goals[1]);
					if (isRTL)
						goal_dif *= -1; // reverted for RTL

					if (goal_dif > 0) // home
						Foxtrick.addClass(teams[0], 'bold');
					else if (goal_dif < 0) // away
						Foxtrick.addClass(teams[1], 'bold');
				}
			}
		}

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Standing')) {
			module.detectOwnTeam(doc);
		}
	},
	detectOwnTeam: function(doc) {
		var module = this;

		var ownTeamId = Foxtrick.isPage(doc, 'youthSeries') ?
			Foxtrick.util.id.getOwnYouthTeamId() :
			Foxtrick.util.id.getOwnTeamId();

		var ownTeamReTmpl = 'TeamID={}(?!\\d)'; // lookahead to ignore longer IDs
		var ownTeamReText = Foxtrick.format(ownTeamReTmpl, [ownTeamId]);
		var ownTeamRe = new RegExp(ownTeamReText, 'i');

		var tables = doc.querySelectorAll('#mainBody table.indent');
		// skip fixture/result tables
		tables = Foxtrick.filter(function(t) {
			return !module.isFixtureTable(t) && !module.isResultTable(t);
		}, tables);

		for (var table of tables) {
			for (var row of Foxtrick.toArray(table.rows)) {
				for (var cell of Foxtrick.toArray(row.cells)) {
					var link = cell.querySelector('a');
					if (!link)
						continue;

					if (!ownTeamRe.test(link.href))
						continue;

					Foxtrick.makeFeaturedElement(row, module);

					for (var matchedCell of Foxtrick.toArray(row.cells)) {
						Foxtrick.addClass(matchedCell, 'bold');
					}

					break;
				}
			}
		}

	},
};
