'use strict';
/**
 * show-lineup-set.js
 * @desc highlight teams that have set a lineup, ownerless teams,
 *       and/or winning teams in league fixture/result table.
 * @author convinced, ryanli
 */

Foxtrick.modules['ShowLineupSet'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['series', 'youthSeries', 'tournaments', 'tournamentsHistory', 'ladders', 'oldSeries', 'marathon', 'topScorers'],
	OPTIONS: ['LineupSet', 'Ownerless', 'Standing', 'Winning'],
	NICE: -2, //before ReLiveLinks
	CSS: Foxtrick.InternalPath + 'resources/css/show-lineup-set.css',

	run: function(doc) {
		var rtl = Foxtrick.util.layout.isRtl(doc);
		var lineupSet = [];
		var bots = [];

		// check teams that have set a lineup
		if (FoxtrickPrefs.isModuleOptionEnabled('ShowLineupSet', 'LineupSet') &&
			Foxtrick.isPage(doc, 'series')) {
			var newsFeed = doc.getElementById('ctl00_ctl00_CPContent_CPMain_repLLUFeed');
			var items = newsFeed.getElementsByClassName('feedItem');
			// check whether an item is a set-lineup item, if is, return team
			// name, otherwise return null
			var getLineupTeam = function(item) {
				var links = item.getElementsByTagName('a');
				if (links.length == 2) {
					var isTransfer = Foxtrick.any(function(n) {
						return n.href.search(/playerid=/i) >= 0;
					}, links);
					if (!isTransfer)
						return links[0].textContent;
				}
				return null;
			};

			lineupSet = Foxtrick.map(getLineupTeam, items);
			lineupSet = Foxtrick.filter(function(n) { return n != null; }, lineupSet);
		}

		// check ownerless teams
		var leagueTable = doc.getElementById('mainBody').getElementsByTagName('table')[0];
		// checks whether a team is ownerless
		var isOwnerless = function(link) { return Foxtrick.hasClass(link, 'shy'); };
		// get bots/ownerless
		var teams = leagueTable.getElementsByTagName('a');
		var botLinks = Foxtrick.filter(isOwnerless, teams);
		bots = Foxtrick.map(function(n) { return n.textContent; }, botLinks);

		var isFixtureTable = function(table) {
			try {
				return (table.getElementsByTagName('a')[0].href
				        .search(/\/Club\/Matches\/Live.aspx/i) >= 0);
			}
			catch (e) {
				return false;
			}
		};
		var isResultTable = function(table) {
			return Foxtrick.hasClass(table, 'left') && !isFixtureTable(table);
		};

		var tables = doc.getElementById('mainBody').getElementsByTagName('table');
		// only deal with fixture/result tables
		tables = Foxtrick.filter(function(n) {
			return isFixtureTable(n) || isResultTable(n);
		}, tables);
		for (var k = 0; k < tables.length; ++k) {
			var table = tables[k];
			if (isFixtureTable(table))
				Foxtrick.addClass(table, 'ft_league_matches');
			else if (isResultTable(table))
				Foxtrick.addClass(table, 'ft_league_results');
			for (var i = 1; i < table.rows.length; ++i) {
				var row = table.rows[i];
				if (row.cells.length < 2)
					continue; // not a valid fixture/result row

				var makeTeamNodes = function(link) {
					var teams = link.textContent.split('\u00a0-\u00a0');
					var teamNode0 = doc.createElement('span');
					teamNode0.textContent = teams[0];
					var teamNode1 = doc.createElement('span');
					teamNode1.textContent = teams[1];

					link.textContent = '';
					link.appendChild(teamNode0);
					link.appendChild(doc.createTextNode(' - '));
					link.appendChild(teamNode1);
					Foxtrick.addClass(link, 'nowrap');
					link = Foxtrick.makeFeaturedElement(link, Foxtrick.modules.ShowLineupSet);

					return [teamNode0, teamNode1];
				};

				var markBots = function(link, teams) {
					for (var j = 0; j < bots.length; ++j) {
						var pos = link.title.indexOf(bots[j]);
						if (pos == 0) {
							Foxtrick.addClass(teams[0], 'shy');
						}
						else if (pos > 0) {
							Foxtrick.addClass(teams[1], 'shy');
						}
					}
				};

				var link = row.cells[0].getElementsByTagName('a')[0];

				// lineup set (for future matches only)
				if (isFixtureTable(table)) {
					var teams = makeTeamNodes(link);
					for (var j = 0; j < lineupSet.length; ++j) {
						var pos = link.title.indexOf(lineupSet[j]);
						if (pos == 0)
							teams[0].className = 'bold';
						else if (pos > 0)
							teams[1].className = 'bold';
					}
					markBots(link, teams);
				}
				// wins (for results only)
				if (isResultTable(table)
					&& FoxtrickPrefs.isModuleOptionEnabled('ShowLineupSet', 'Winning')) {

					var teams = makeTeamNodes(link);

					var goals = Foxtrick.trim(row.cells[1].textContent).split(/\s*-\s*/);
					var goal_dif = parseInt(goals[0]) - parseInt(goals[1]);
					if (rtl)
						goal_dif *= -1; // reverted for rtl
					if (goal_dif > 0)
						teams[0].className = 'bold';
					else if (goal_dif < 0)
						teams[1].className = 'bold';

					markBots(link, teams);
				}
			}
		}

		if (FoxtrickPrefs.isModuleOptionEnabled('ShowLineupSet', 'Standing')) {
				if(Foxtrick.isPage(doc, 'youthSeries')) {
					var correctTeam = "TeamID="+Foxtrick.util.id.getOwnYouthTeamId();
				} else {
					var correctTeam = "TeamID="+Foxtrick.util.id.getOwnTeamId();
				}
				
				var tables = doc.getElementById('mainBody').getElementsByTagName('table');
				// only deal with fixture/result tables
				tables = Foxtrick.filter(function(n) {
					return !isFixtureTable(n) && !isResultTable(n) && n.getAttribute('class')=='indent';
				}, tables);
				for (var k = 0; k < tables.length; ++k) {
					var table = tables[k];
					for (var i = 1; i < table.rows.length; ++i) {
						var row = table.rows[i];
						for (var c = 0; c < row.cells.length; ++c) {
							if(row.cells[c].getElementsByTagName('a').length) {
								var link = row.cells[c].getElementsByTagName('a')[0];
								if(link.getAttribute('href').match(correctTeam)) {
									for (var s = 0; s < row.cells.length; ++s) {
										row.cells[s].style.fontWeight = 'bold';
									}
								}
							}
						}
					}
				}				
		}
	}
};
