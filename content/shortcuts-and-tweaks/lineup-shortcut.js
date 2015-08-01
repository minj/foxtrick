'use strict';
/**
 * FoxtrickLineupShortcut (Add a direct shortcut to lineup in player detail page)
 * @author taised, ryanli
 */

Foxtrick.modules['LineupShortcut'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['playerDetails', 'statsBestGames', 'youthPlayerDetails'],

	run: function(doc) {
		if (Foxtrick.isPage(doc, 'playerDetails'))
			this._Analyze_Player_Page(doc);
		else if (Foxtrick.isPage(doc, 'youthPlayerDetails'))
			this._Analyze_Youth_Player_Page(doc);
		else if (Foxtrick.isPage(doc, 'statsBestGames'))
			this._Analyze_Stat_Page(doc);
	},

	change: function(doc) {
		if (doc.getElementsByClassName('ft-lineup-cell').length > 0)
			return;
		if (Foxtrick.isPage(doc, 'statsBestGames'))
			this._Analyze_Stat_Page(doc);
	},

	_Analyze_Player_Page: function(doc) {
		if (Foxtrick.Pages.Player.wasFired(doc))
			return;

		// to get match history table
		var mainBody = doc.getElementById('mainBody');
		var boxes = mainBody.getElementsByClassName('mainBox');
		boxes = Foxtrick.filter(function(n) {
			return n.id != 'trainingDetails';
		}, boxes);
		var matchHistory = boxes[boxes.length - 1];
		if (!matchHistory)
			return;
		var matchTable = matchHistory.getElementsByTagName('table')[0];
		if (!matchTable)
			return;

		// get player ID from top of the page:
		var playerId = Foxtrick.Pages.All.getId(doc);
		var teamName = Foxtrick.Pages.All.getTeamName(doc);

		// get leagueId for ntName and u20Name
		var leagueId = Foxtrick.Pages.Player.getNationalityId(doc);
		var league, ntName, ntId, u20Name, u20Id;
		if (leagueId) {
			league = Foxtrick.XMLData.League[leagueId];
			ntId = league.NationalTeamId;
			u20Id = league.U20TeamId;
			ntName = Foxtrick.XMLData.getNTNameByLeagueId(leagueId);
			u20Name = 'U-20 ' + ntName;
		}

		var hasTransfer = false;
		for (var i = 0; i < matchTable.rows.length; i++) {
			var row = matchTable.rows[i];
			var link = row.cells[1].getElementsByTagName('a')[0];
			var teamId = Foxtrick.util.id.getTeamIdFromUrl(link.href);
			var matchId = Foxtrick.util.id.getMatchIdFromUrl(link.href);
			link.href += '&HighlightPlayerID=' + playerId;

			// find out home/away team names
			// \u00a0 is no-break space (entity &nbsp;)
			// use textContent to deal with encoded entities (like &amp;)
			// which innerHTML isn't capable of
			var teamsTrimmed = link.textContent.split(/\u00a0-\u00a0/);
			var teamsText = link.title;
			var homeIdx = teamsText.indexOf(teamsTrimmed[0]);
			var awayIdx = teamsText.indexOf(teamsTrimmed[1]);
			var matchTeams = [teamsText.substr(homeIdx, awayIdx - 1), teamsText.substr(awayIdx)];
			var hasMatch = false;

			var opts;
			if (Foxtrick.has(matchTeams, teamName)) {
				if (!hasTransfer) {
					opts = {
						type: 'normal',
						matchId: matchId,
						playerId: playerId,
						teamId: teamId,
					};
					this._Add_Lineup_Link(doc, row, opts);
					hasMatch = true;
				}
			}
			else if (leagueId && Foxtrick.has(matchTeams, ntName)) {
				opts = {
					type: 'NT',
					matchId: matchId,
					playerId: playerId,
					teamId: ntId,
				};
				this._Add_Lineup_Link(doc, row, opts);
				hasMatch = true;
			}
			else if (leagueId && Foxtrick.has(matchTeams, u20Name)) {
				opts = {
					type: 'U20',
					matchId: matchId,
					playerId: playerId,
					teamId: u20Id,
				};
				this._Add_Lineup_Link(doc, row, opts);
				hasMatch = true;
			}
			if (!hasMatch)
				hasTransfer = true;
		}
	},

	_Analyze_Stat_Page: function(doc) {
		var teamId = Foxtrick.getMBElement(doc, 'ddlPreviousClubs').value;
		// Now getting playerId from top of the page:
		var playerId = Foxtrick.Pages.All.getId(doc);
		var lineuplabel = Foxtrick.L10n.getString('LineupShortcut.lineup');
		var panel = Foxtrick.getMBElement(doc, 'UpdatePanel1');
		var matchtable = panel.getElementsByTagName('table')[0];
		// matchtable is `not present if the player hasn't played for a team
		if (!matchtable)
			return;
		var checktables = matchtable.getElementsByClassName('ft_lineupheader');
		if (checktables.length === 0) {
			// adding lineup to header row
			var newhead = Foxtrick.createFeaturedElement(doc, this, 'th');
			newhead.className = 'ft_lineupheader';
			newhead.textContent = lineuplabel;
			matchtable.rows[0].appendChild(newhead);
			// We start from second row because first is header
			for (var i = 1; i < matchtable.rows.length; i++) {
				var row = matchtable.rows[i];
				var link = row.cells[1].getElementsByTagName('a')[0];
				var matchId = Foxtrick.util.id.getMatchIdFromUrl(link.href);
				var opts = {
					type: 'normal',
					matchId: matchId,
					playerId: playerId,
					teamId: teamId,
				};
				this._Add_Lineup_Link(doc, row, opts);
			}
		}
	},

	/**
	 * {type: NT|U20|Youth|normal, matchId, teamId, playerId, youthTeamId: number}
	 * @param {document}            doc
	 * @param {HTMLTableRowElement} row
	 * @param {object}              opts {type: NT|U20|Youth|normal,
	 *                                    matchId, teamId, playerId, youthTeamId: number}
	 */
	_Add_Lineup_Link: function(doc, row, opts) {
		//the link is: /Club/Matches/MatchLineup.aspx?MatchID=<opts.matchId>&TeamID=<opts.teamId>
		//the new link:
		// /Club/Matches/Match.aspx?matchID=<opts.matchId>&SourceSystem=<sourcesystem>&TeamId=<opts.teamId>
		// &HighlightPlayerID=<opts.playerId>#tab2
		var cell = Foxtrick.insertFeaturedCell(row, this, -1); // append as the last cell
		cell.className = 'ft-lineup-cell';
		var url = '/Club/Matches/Match.aspx?matchID=' + opts.matchId +
			'&TeamId=' + opts.teamId + '&HighlightPlayerID=' + opts.playerId;
		var link = Foxtrick.createFeaturedElement(doc, this, 'a');
		if (opts.type == 'youth') {
			link.href = url + '&YouthTeamId=' + opts.youthTeamId + '&SourceSystem=Youth#tab2';
		}
		else {
			link.href = url + '&SourceSystem=Hattrick#tab2';
		}
		var src = '';
		if (opts.type == 'NT')
			src = 'formation.nt.png';
		else if (opts.type == 'U20')
			src = 'formation.u20.png';
		else
			src = 'formation.png';
		Foxtrick.addImage(doc, link, { src: Foxtrick.InternalPath + 'resources/img/' + src });
		cell.appendChild(link);
	},

	//***************** YOUTH TEAM ********************
	_Analyze_Youth_Player_Page: function(doc) {
		var mainBody = doc.getElementById('mainBody');

		var matchLink = Foxtrick.nth(function(n) {
			return /\/Club\/Matches\/Match\.aspx/i.test(n.href);
		}, mainBody.getElementsByTagName('a'));
		if (!matchLink)
			return; // hasn't played a match yet

		// get matchTable which contains matches played
		var matchTable = matchLink;
		while (matchTable.tagName.toLowerCase() != 'table' && matchTable.parentNode)
			matchTable = matchTable.parentNode;
		if (matchTable.tagName.toLowerCase() != 'table')
			return;

		var youthTeamId = Foxtrick.Pages.All.getTeamIdFromBC(doc);
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		var playerId = Foxtrick.Pages.All.getId(doc);
		for (var i = 0; i < matchTable.rows.length; i++) {
			var link = matchTable.rows[i].cells[1].getElementsByTagName('a')[0];
			// fix matchlink
			link.href += '&YouthTeamId=' + youthTeamId + '&HighlightPlayerID=' + playerId;
			var matchId = Foxtrick.util.id.getMatchIdFromUrl(link.href);
			var opts = {
				type: 'youth',
				matchId: matchId,
				playerId: playerId,
				teamId: teamId,
				youthTeamId: youthTeamId
			};
			this._Add_Lineup_Link(doc, matchTable.rows[i], opts);
		}
	},
};
