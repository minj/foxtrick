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

	/** @param {document} doc */
	// eslint-disable-next-line complexity
	_Analyze_Player_Page: function(doc) {
		if (Foxtrick.Pages.Player.wasFired(doc))
			return;

		// to get match history table
		var mainBody = doc.getElementById('mainBody');
		var boxes = Array.from(mainBody.querySelectorAll('.mainBox'));
		boxes = Foxtrick.filter(function(n) {
			return n.id != 'trainingDetails' && n.id != 'transferHistory';
		}, boxes);

		var matchHistory = Foxtrick.nth(function(b) {
			return !!b.querySelector('.date') && /\(\d+'\)/.test(b.textContent) &&
				!!b.querySelector('a[href^="/Club/Matches/Match.aspx?"i]');
		}, boxes);
		if (!matchHistory)
			return;

		var matchTable = matchHistory.querySelector('table');
		if (!matchTable)
			return;

		// get player ID from top of the page:
		var playerId = Foxtrick.Pages.All.getId(doc);
		var teamName = Foxtrick.Pages.All.getTeamName(doc);

		// get leagueId for ntName and u20Name
		var leagueId = Foxtrick.Pages.Player.getNationalityId(doc);
		var league, ntName, ntId, u21Name, u21Id;
		if (leagueId) {
			league = Foxtrick.XMLData.League[leagueId];
			if (league) {
				ntId = league.NationalTeamId;
				u21Id = league.U20TeamId; // NOTE: property remains != U21
				ntName = Foxtrick.XMLData.getNTNameByLeagueId(leagueId);
				u21Name = 'U21 ' + ntName;
			}
			else {
				Foxtrick.log(new Error(`League ${leagueId} missing!`));
				leagueId = null;
			}
		}

		var hasTransfer = false;
		for (var i = 0; i < matchTable.rows.length; i++) {
			var row = matchTable.rows[i];
			var link = row.cells[1].getElementsByTagName('a')[0];
			var teamId = Foxtrick.util.id.getTeamIdFromUrl(link.href);
			var matchId = Foxtrick.util.id.getMatchIdFromUrl(link.href);
			link.href += '&HighlightPlayerID=' + playerId;

			// FIXME: this is bound to break
			// find out home/away team names
			//
			// textContent uses trimmed team names
			//
			// \u00a0 is no-break space (entity &nbsp;)
			// helps distinguishing from hyphens in team names
			var textTeams = link.textContent.split(/\u00a0-\u00a0/);

			// title is `${HomeTeam}-${AwayTeam}`
			var titleText = link.title;
			var homeIdx = titleText.indexOf(textTeams[0]);
			var awayIdx = titleText.indexOf(textTeams[1]);

			var fullNames = [
				// eslint-disable-next-line no-magic-numbers
				titleText.slice(homeIdx, awayIdx - 3).trim(), // skipping the hyphen
				titleText.slice(awayIdx).trim(),
			];

			var hasMatch = false;

			var opts;
			if (Foxtrick.has(fullNames, teamName)) {
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
			else if (leagueId && Foxtrick.has(fullNames, ntName)) {
				opts = {
					type: 'NT',
					matchId: matchId,
					playerId: playerId,
					teamId: ntId,
				};
				this._Add_Lineup_Link(doc, row, opts);
				hasMatch = true;
			}
			else if (leagueId && Foxtrick.has(fullNames, u21Name)) {
				opts = {
					type: 'U21',
					matchId: matchId,
					playerId: playerId,
					teamId: u21Id,
				};
				this._Add_Lineup_Link(doc, row, opts);
				hasMatch = true;
			}
			if (!hasMatch)
				hasTransfer = true;
		}
	},

	_Analyze_Stat_Page: function(doc) {
		let teamInput = Foxtrick.getMBElement(doc, 'ddlPreviousClubs').value;
		var teamId = parseInt(teamInput, 10) || 0;
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
	 * {type: NT|U21|Youth|normal, matchId, teamId, playerId, youthTeamId: number}
	 * @param {document}            doc
	 * @param {HTMLTableRowElement} row
	 * @param {object}              opts {type: NT|U21|Youth|normal,
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
		switch (opts.type) {
		    case 'youth':
			    link.href = url + '&YouthTeamId=' + opts.youthTeamId + '&SourceSystem=Youth#tab2';
			    break;
		    case 'NT':
		    case 'U21':
			    link.href = url + '&SourceSystem=HTOIntegrated#tab2';
			    break;
		    default:
			    link.href = url + '&SourceSystem=Hattrick#tab2';
			    break;
		}
		var src = '';
		if (opts.type == 'NT')
			src = 'formation.nt.png';
		else if (opts.type == 'U21')
			src = 'formation.u20.png'; // NOTE: remains != U21
		else
			src = 'formation.png';
		Foxtrick.addImage(doc, link, { src: Foxtrick.InternalPath + 'resources/img/' + src });
		cell.appendChild(link);
	},

	/** @param {document} doc */
	_Analyze_Youth_Player_Page: function(doc) {
		let mainBody = doc.getElementById('mainBody');
		let q = 'a[href^="/Club/Matches/Match."i][href*="MatchId="i][href*="SourceSystem=Youth"i]';
		let links = mainBody.querySelectorAll(q);
		if (!links.length) {
			// has not played
			return;
		}

		let byline = doc.querySelector('.byline');
		if (!byline || !byline.textContent.trim())
			return;

		// skip links inside dates
		let tables = Foxtrick.map(l => !l.closest('.date') && l.closest('table'), links);
		let mTables = new Set(tables.filter(Boolean));
		let withDates = Foxtrick.filter(t => !!t.querySelector('.date'), mTables);
		let [matchTable] = withDates;
		switch (withDates.length) {
			case 0:
				throw new Error('Matchtable not found');
			case 1:
				break;
			default:
				Foxtrick.log(new Error(`Found ${withDates.length} tables`));
		}

		let youthTeamId = Foxtrick.Pages.All.getTeamIdFromBC(doc);
		let teamId = Foxtrick.Pages.All.getTeamId(doc);
		let playerId = Foxtrick.Pages.All.getId(doc);
		for (let row of matchTable.rows) {
			let cell = row.cells[1];
			if (!cell)
				continue;

			let link = cell.querySelector('a');
			if (!link)
				continue;

			// fix matchlink
			link.href += '&YouthTeamId=' + youthTeamId + '&HighlightPlayerID=' + playerId;
			let matchId = Foxtrick.util.id.getMatchIdFromUrl(link.href);
			let opts = {
				type: 'youth',
				matchId: matchId,
				playerId: playerId,
				teamId: teamId,
				youthTeamId: youthTeamId,
			};
			this._Add_Lineup_Link(doc, row, opts);
		}
	},
};
