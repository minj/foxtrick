'use strict';
/**
 * cross-table.js
 * add cross table and season graph to fixtures page
 * @author spambot, ryanli
 */

Foxtrick.modules['CrossTable'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['fixtures'],
	CSS: Foxtrick.InternalPath + 'resources/css/cross-table.css',

	run: function(doc) {
		var teams = [];
		var getTeam = function(id) {
			var existing = Foxtrick.filter(function(n) { return n.id == id; }, teams)[0];
			if (existing)
				return existing;
			var created = {
				id: id,
				name: '',
				match: {},
				point: [],
				goalsFor: [],
				goalsAgainst: [],
				position: []
			};
			teams.push(created);
			return created;
		};

		var roundsPlayed = 0;

		// insert graph and table
		var insertBefore = doc.getElementById('ctl00_ctl00_CPContent_CPMain_repFixtures');

		// season graph
		var graphHeader = Foxtrick.createFeaturedElement(doc, this, 'h2');
		graphHeader.textContent = Foxtrick.L10n.getString('CrossTable.graph');
		graphHeader.className = 'ft-expander-unexpanded';
		insertBefore.parentNode.insertBefore(graphHeader, insertBefore);
		var graphContainer = Foxtrick.createFeaturedElement(doc, this, 'div');
		graphContainer.id = 'ft-season-graph-container';
		graphContainer.className = 'hidden';
		insertBefore.parentNode.insertBefore(graphContainer, insertBefore);
		var graph = doc.createElement('img');
		graph.id = 'ft-season-graph';
		graphContainer.appendChild(graph);

		// cross table
		var tableHeader = Foxtrick.createFeaturedElement(doc, this, 'h2');
		tableHeader.textContent = Foxtrick.L10n.getString('CrossTable.table');
		tableHeader.className = 'ft-expander-unexpanded';
		insertBefore.parentNode.insertBefore(tableHeader, insertBefore);
		var div = Foxtrick.createFeaturedElement(doc, this, 'div');
		div.className = 'ft-cross-table-div';
		var table = doc.createElement('table');
		table.id = 'ft-cross-table';
		table.className = 'hidden';
		div.appendChild(table);
		insertBefore.parentNode.insertBefore(div, insertBefore);

		var rememberState = function(object, state) {
			Foxtrick.Prefs.setBool('module.CrossTable.' + object, state);
		};
		var recallState = function(object) {
			return Foxtrick.Prefs.getBool('module.CrossTable.' + object);
		};

		var toggleGraph = function() {
			Foxtrick.toggleClass(graphHeader, 'ft-expander-unexpanded');
			Foxtrick.toggleClass(graphHeader, 'ft-expander-expanded');
			Foxtrick.toggleClass(graphContainer, 'hidden');
			rememberState('graph.expanded', !Foxtrick.hasClass(graphContainer, 'hidden'));
		};

		var toggleTable = function() {
			Foxtrick.toggleClass(tableHeader, 'ft-expander-unexpanded');
			Foxtrick.toggleClass(tableHeader, 'ft-expander-expanded');
			Foxtrick.toggleClass(table, 'hidden');
			rememberState('table.expanded', !Foxtrick.hasClass(table, 'hidden'));
		};

		Foxtrick.onClick(graphHeader, toggleGraph);
		Foxtrick.onClick(tableHeader, toggleTable);

		// if graph or table was expanded last time, expand it now.
		if (recallState('graph.expanded'))
			toggleGraph();
		if (recallState('table.expanded'))
			toggleTable();

		var processMatches = function(matchNodes) {
			for (var j = 0; j < matchNodes.length; ++j) {
				var matchNode = matchNodes[j];

				var round = Number(matchNode.getElementsByTagName('MatchRound')[0].textContent);
				var matchId = Number(matchNode.getElementsByTagName('MatchID')[0].textContent);
				var homeId = Number(matchNode.getElementsByTagName('HomeTeam')[0]
				                    .getElementsByTagName('HomeTeamID')[0].textContent);
				var awayId = Number(matchNode.getElementsByTagName('AwayTeam')[0]
				                    .getElementsByTagName('AwayTeamID')[0].textContent);
				var homeName = matchNode.getElementsByTagName('HomeTeam')[0]
				.getElementsByTagName('HomeTeamName')[0].textContent;
				var awayName = matchNode.getElementsByTagName('AwayTeam')[0]
				.getElementsByTagName('AwayTeamName')[0].textContent;
				var homeGoalsNode = matchNode.getElementsByTagName('HomeGoals')[0];
				var awayGoalsNode = matchNode.getElementsByTagName('AwayGoals')[0];

				if (homeGoalsNode && awayGoalsNode) {
					roundsPlayed = Math.max(roundsPlayed, round);
					var homeGoals = Number(homeGoalsNode.textContent);
					var awayGoals = Number(awayGoalsNode.textContent);
				}
				else {
					var homeGoals = NaN;
					var awayGoals = NaN;
				}

				var home = getTeam(homeId);
				var away = getTeam(awayId);

				home.name = homeName;
				away.name = awayName;
				home.match[away.id] = {};
				home.match[away.id].id = matchId;
				home.match[away.id].round = round;

				var appendIncrement = function(array, inc) {
					if (array.length === 0)
						array.push(inc);
					else
						array.push(array[array.length - 1] + inc);
				};
				// if game has finished
				if (!isNaN(homeGoals) && !isNaN(awayGoals)) {
					// update names, they might have changed
					home.match[away.id].home = homeGoals;
					home.match[away.id].away = awayGoals;

					if (homeGoals > awayGoals) {
						appendIncrement(home.point, 3);
						appendIncrement(away.point, 0);
					}
					else if (homeGoals < awayGoals) {
						appendIncrement(home.point, 0);
						appendIncrement(away.point, 3);
					}
					else {
						appendIncrement(home.point, 1);
						appendIncrement(away.point, 1);
					}

					appendIncrement(home.goalsFor, homeGoals);
					appendIncrement(home.goalsAgainst, awayGoals);
					appendIncrement(away.goalsFor, awayGoals);
					appendIncrement(away.goalsAgainst, homeGoals);
				}
			}
		};

		var fillCrossTable = function() {
			var getShortName = function(str) {
				var minLength = 3; // only suggested
				var maxLength = 9;
				if (str.length <= maxLength) {
					return str;
				}

				// if abbreviation made by all word initials is good, return it
				var initials = '';
				var initialRe = new RegExp('\\b(\\w)\\w*\\b', 'g');
				var initialMatches = str.replace(initialRe, '$1').match(initialRe);
				if (initialMatches) {
					for (var i = 0; i < initialMatches.length; ++i) {
						initials += initialMatches[i];
					}
					if (initials.length >= minLength && initials.length <= maxLength) {
						return initials;
					}
				}

				// otherwise, if abbreviation made by all capital letters is good,
				// return it
				var allCaps = '';
				var capRe = new RegExp('[A-Z]', 'g');
				var capMatches = str.match(capRe);
				if (capMatches) {
					for (var i = 0; i < capMatches.length; ++i) {
						allCaps += capMatches[i];
					}
					if (allCaps.length >= minLength && allCaps.length <= maxLength) {
						return allCaps;
					}
				}

				// otherwise, if first word is good, return it
				var firstWord;
				var firstWordRe = new RegExp('^\\w+\\b');
				var firstWordMatches = str.match(firstWordRe);
				if (firstWordMatches) {
					firstWord = str.match(firstWordRe)[0];
					if (firstWord.length >= minLength && firstWord.length <= maxLength) {
						return firstWord;
					}
				}

				// finally, just return the substring
				return str.substr(0, maxLength);
			};

			var headRow = doc.createElement('tr');
			table.appendChild(headRow);
			var empty = doc.createElement('th');
			headRow.appendChild(empty);
			for (var i = 0; i < teams.length; ++i) {
				var team = doc.createElement('th');
				team.textContent = getShortName(teams[i].name);
				team.title = teams[i].name;
				headRow.appendChild(team);
			}

			for (var i = 0; i < teams.length; ++i) {
				var row = doc.createElement('tr');
				table.appendChild(row);
				var head = doc.createElement('th');
				head.textContent = teams[i].name;
				row.appendChild(head);
				for (var j = 0; j < teams.length; ++j) {
					var cell = doc.createElement('td');
					row.appendChild(cell);
					if (!teams[i].match[teams[j].id])
						continue; // no matches between a team and itself!
					var match = teams[i].match[teams[j].id];
					var link = doc.createElement('a');
					cell.appendChild(link);
					link.href = '/Club/Matches/Match.aspx?matchID=' + match.id;
					if (!isNaN(match.home)) {
						link.textContent = match.home + ' - ' + match.away;
						if (match.home > match.away)
							Foxtrick.addClass(link, 'won');
						else if (match.home == match.away)
							Foxtrick.addClass(link, 'draw');
						else
							Foxtrick.addClass(link, 'lost');
					}
					else {
						link.textContent = Foxtrick.L10n.getString('CrossTable.round')
							.replace(/%s/, match.round);
					}
				}
			}
		};

		var drawSeasonGraph = function() {
			var width = 540;
			var sorter = function(r, a, b) {
				var goalsDifference = function(t) {
					return t.goalsFor[r] - t.goalsAgainst[r];
				};
				if (b.point[r] != a.point[r])
					return b.point[r] - a.point[r];
				if (goalsDifference(b) != goalsDifference(a))
					return goalsDifference(b) - goalsDifference(a);
				return b.goalsFor[r] - a.goalsFor[r];
			};
			// get position after each round
			for (var i = 0; i < roundsPlayed; ++i) {
				teams.sort(function(a, b) { return sorter(i, a, b); });
				for (var j = 0; j < teams.length; ++j) {
					// first team has a position of 8, bottom has 1
					teams[j].position[i] = teams.length - j;
				}
			}
			if (roundsPlayed == 0) {
				// no matches played, display a message instead of the graph
				graphContainer.removeChild(graph);
				var noMatches = Foxtrick.util.note.create(doc, Foxtrick.L10n
				                                          .getString('CrossTable.noMatches'));
				graphContainer.appendChild(noMatches);
			}
			else {
				// Google Chart API documentation:
				// Line charts:
				// http://code.google.com/apis/chart/docs/gallery/line_charts.html
				var url = 'http://chart.apis.google.com/chart'
					+ '?cht=lc' // chart type=line chart
					+ '&chs=' + width + 'x200' // chart size=widthÃ—20
					+ '&chds=0.5,8.5' // chart data series range=[0.5,8.5]
					+ '&chxt=x,y' // visible axis=X, Y
					+ '&chxr=0,1,' + roundsPlayed + ',1' // axis label=x:[1..roundsPlayed](1)
					+ '&chxl=1:|8|7|6|5|4|3|2|1|' // axis label=y:[8,7,6,5,4,3,2,1]
					+ '&chxp=1,6.25,18.5,31.75,44,56.25,68.25,81.5,93.75' // Y-axis label position
					+ '&chg=' + (100 / (roundsPlayed - 1)) + ',0'
					// Separate lines parallel with Y-axis
					+ '&chco=008000,FF9900,4684EE,DC3912,00E100,FF00FF,A7A7A7,000080' // line colors
					+ '&chd=t:' + Foxtrick.map(function(n) {
						return n.position.join(',');
					}, teams).join('|') // team position trend
					+ '&chdl=' + Foxtrick.map(function(n) { return n.name; }, teams).join('|')
					// team names
					+ '&chdlp=r|l';
				graph.src = url;
			}
		};

		var leagueId = doc.location.href.match(/leagueLevelUnitID=(\d+)/i)[1];
		// get season from select since the URL doesn't change when
		// switching different seasons
		var season =
			doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucSeasonsDropdown_ddlSeasons').value;
		var args = [
			['file', 'leaguefixtures'],
			['leagueLevelUnitId', leagueId],
			['season', season]
		];

		Foxtrick.util.api.retrieve(doc, args, { cache_lifetime: 'session' },
		  function(xml, errorText) {
			try {
				if (xml) {
					var matchNodes = xml.getElementsByTagName('Match');
					processMatches(matchNodes);
					fillCrossTable(xml);
					drawSeasonGraph(xml);
				}
				if (errorText) {
					var note = Foxtrick.util.note.create(doc, errorText);
					graphContainer.appendChild(note);
					note = Foxtrick.util.note.create(doc, errorText);
					table.appendChild(note);
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		});
	}
};
