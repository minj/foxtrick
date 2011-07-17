/**
 * @file show-lineup-set.js
 * @desc highlight teams that have set a lineup, ownerless teams,
 *       and/or winning teams in league fixture/result table
 * @author convinced, ryanli
 */

var FoxtrickShowLineupSet = {
	MODULE_NAME : "ShowLineupSet",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["league"],
	OPTIONS : ["LineupSet", "Ownerless", "Winning"],

	run : function(doc) {
		var lineupSet = [];
		var bots = [];

		// check teams that have set a lineup
		if (Foxtrick.isModuleFeatureEnabled(this, "LineupSet")) {
			var newsFeed = doc.getElementById("ctl00_ctl00_CPContent_CPMain_repLLUFeed");
			var items = newsFeed.getElementsByClassName("feedItem");
			// check whether an item is a set-lineup item, if is, return team
			// name, otherwise return null
			var getLineupTeam = function(item) {
				var links = item.getElementsByTagName("a");
				if (links.length == 2) {
					var isTransfer = Foxtrick.some(links, function(n) { return n.href.indexOf("PlayerID=") >= 0; });
					if (!isTransfer)
						return links[0].textContent;
				}
				return null;
			};

			lineupSet = Foxtrick.map(items, getLineupTeam);
			lineupSet = Foxtrick.filter(lineupSet, function(n) { return n != null; });
		}

		// check ownerless teams
		if (Foxtrick.isModuleFeatureEnabled(this, "Ownerless")) {
			var leagueTable = doc.getElementById("mainBody").getElementsByTagName("table")[0];
			// checks whether a team is ownerless
			var isOwnerless = function(link) { return Foxtrick.hasClass(link, "shy"); }
			// get bots/ownerless
			var teams = leagueTable.getElementsByTagName("a");
			var botLinks = Foxtrick.filter(teams, isOwnerless);
			bots = Foxtrick.map(botLinks, function(n) { return n.textContent; });
		}

		var isFixtureTable = function(table) {
			try {
				var row = table.rows[1];
				return (row.cells.length >= 2)
					&& (row.cells[1].innerHTML.indexOf("/Club/Matches/Live.aspx?actionType=addMatch") >= 0);
			}
			catch (e) {
				return false;
			}
		};
		var isResultTable = function(table) {
			return Foxtrick.hasClass(table, "left");
		};

		var tables = doc.getElementById("mainBody").getElementsByTagName("table");
		for (var k = 1; k < tables.length; ++k) {
			var table = tables[k];
			for (var i = 1; i < table.rows.length; ++i) {
				var row = table.rows[i];
				if (row.cells.length < 2)
					continue; // not a valid fixture/result row
				var link = row.cells[0].getElementsByTagName('a')[0];
				// lineup set (for future matches only)
				if (isFixtureTable(table)) {
					for (var j = 0; j < lineupSet.length; ++j) {
						var pos = link.title.indexOf(lineupSet[j]);
						if (pos == 0) {
							// home team has set lineup
							var reg = new RegExp(/(.+)&nbsp;-/);
							link.innerHTML = link.innerHTML.replace(reg, '<strong>$1</strong>&nbsp;-');
						}
						else if (pos > 0) {
							// away team has set lineup
							var reg = new RegExp(/-&nbsp;(.+)/);
							link.innerHTML = link.innerHTML.replace(reg, '-&nbsp;<strong>$1</strong>');
						}
					}
				}
				// bots (for both results and future matches)
				for (var j = 0; j < bots.length; ++j) {
					var pos = link.title.indexOf(bots[j]);
					if (pos == 0) {
						// home team is bot
						var reg = new RegExp(/(.+)&nbsp;-/);
						link.innerHTML = link.innerHTML.replace(reg, '<span class="shy">$1</span>&nbsp;-');
					}
					else if (pos > 0) {
						// away team is bot
						var reg = new RegExp(/-&nbsp;(.+)/);
						link.innerHTML = link.innerHTML.replace(reg, '-&nbsp;<span class="shy">$1</span>');
					}
				}
				// wins (for results only)
				if (isResultTable(table)
					&& Foxtrick.isModuleFeatureEnabled(this, "Winning")) {
					var goals = Foxtrick.trim(row.cells[1].textContent).split(/\s*-\s*/);
					if (parseInt(goals[0]) > parseInt(goals[1])) {
						var reg = new RegExp(/(.+)\&nbsp;-/);
						link.innerHTML = link.innerHTML.replace(reg,'<strong>$1</strong>&nbsp;-');
					}
					else if (parseInt(goals[0]) < parseInt(goals[1])) {
						var reg = new RegExp(/\-&nbsp;(.+)/);
						link.innerHTML = link.innerHTML.replace(reg,'-&nbsp;<strong>$1</strong>');
					}
				}
			}
		}
	}
};
