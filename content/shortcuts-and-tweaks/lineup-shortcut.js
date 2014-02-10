'use strict';
/**
 * FoxtrickLineupShortcut (Add a direct shortcut to lineup in player detail page)
 * @author taised, ryanli
 */

Foxtrick.modules['LineupShortcut'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['playerDetails', 'statsBestGames', 'matchLineup', 'youthPlayer'],
	OPTIONS: ['HighlightPlayer'],

	run: function(doc) {
		if (Foxtrick.isPage(doc, 'playerDetails'))
			this._Analyze_Player_Page(doc);
		else if (Foxtrick.isPage(doc, 'youthPlayer'))
			this._Analyze_Youth_Player_Page(doc);
		else if (Foxtrick.isPage(doc, 'statsBestGames'))
			this._Analyze_Stat_Page(doc);
		else if (Foxtrick.isPage(doc, 'matchLineup'))
			this._Highlight_Player(doc);
	},

	change: function(doc) {
		if (doc.getElementsByClassName('ft-lineup-cell').length > 0)
			return;
		if (Foxtrick.isPage(doc, 'statsBestGames'))
			this._Analyze_Stat_Page(doc);
	},

	_Analyze_Player_Page: function(doc) {
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
		var mainWrapper = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
		var playerId = Foxtrick.util.id.findPlayerId(mainWrapper);
		var teamName = Foxtrick.util.id.extractTeamName(mainWrapper);

		// get leagueId for ntName and u20Name
		var leagueId = Foxtrick.Pages.Player.getNationalityId(doc);
		if (leagueId) {
			var league = Foxtrick.XMLData.League[leagueId];
			var ntName = league.LeagueName;
			var ntId = league.NationalTeamId;
			var u20Name = 'U-20 ' + ntName;
			var u20Id = league.U20TeamId;
		}

		var hasTransfer = false;
		for (var i = 0; i < matchTable.rows.length; i++) {
			var link = matchTable.rows[i].cells[1].getElementsByTagName('a')[0];
			var teamId = Foxtrick.util.id.getTeamIdFromUrl(link.href);
			var matchId = Foxtrick.util.id.getMatchIdFromUrl(link.href);
			link.href += '&HighlightPlayerID=' + playerId;
			// new ratings launched on 2012-08-28
			var date = Foxtrick.util.time.getDateFromText(matchTable.rows[i].cells[0].textContent);
			var newRatings = (date.valueOf() > 1346101200000);

			// find out home/away team names
			// \u00a0 is no-break space (entity &nbsp;)
			// use textContent to deal with encoded entities (like &amp;)
			// which innerHTML isn't capable of
			var teamsTrimmed = link.textContent.split(new RegExp('\u00a0-\u00a0'));
			var teamsText = link.title;
			var homeIdx = teamsText.indexOf(teamsTrimmed[0]);
			var awayIdx = teamsText.indexOf(teamsTrimmed[1]);
			var matchTeams = [teamsText.substr(homeIdx, awayIdx - 1), teamsText.substr(awayIdx)];
			var hasMatch = false;

			if (Foxtrick.member(teamName, matchTeams)) {
				if (!hasTransfer) {
					this._Add_Lineup_Link(doc, matchTable.rows[i], teamId, playerId, matchId,
										  'normal', newRatings);
					hasMatch = true;
				}
			}
			else if (leagueId && Foxtrick.member(ntName, matchTeams)) {
				this._Add_Lineup_Link(doc, matchTable.rows[i], ntId, playerId, matchId, 'NT',
									  newRatings);
				hasMatch = true;
			}
			else if (leagueId && Foxtrick.member(u20Name, matchTeams)) {
				this._Add_Lineup_Link(doc, matchTable.rows[i], u20Id, playerId, matchId, 'U20',
									  newRatings);
				hasMatch = true;
			}
			if (!hasMatch)
				hasTransfer = true;

			if (newRatings && !link.href.match(/#/))
				link.href += '#tab2';
		}
	},

	_Analyze_Stat_Page: function(doc) {
		var teamid = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ddlPreviousClubs').value;
		//Now getting playerid from top of the page:
		var element = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
		var playerid = Foxtrick.util.id.findPlayerId(element);
		var lineuplabel = Foxtrickl10n.getString('LineupShortcut.lineup');
		var matchtable = doc.getElementById('ctl00_ctl00_CPContent_CPMain_UpdatePanel1')
			.getElementsByTagName('table').item(0);
		// matchtable is `not present if the player hasn't played for a team
		if (!matchtable)
			return;
		var checktables = matchtable.getElementsByClassName('ft_lineupheader');
		if (checktables.length == 0)
		{
			//adding lineup to header row
			var newhead = Foxtrick.createFeaturedElement(doc, this, 'th');
			newhead.className = 'ft_lineupheader';
			newhead.textContent = lineuplabel;
			matchtable.rows[0].appendChild(newhead);
			//We start from second row because first is header
			for (var i = 1; i < matchtable.rows.length; i++) {
				// new ratings launched on 2012-08-28
				var date =
					Foxtrick.util.time.getDateFromText(matchtable.rows[i].cells[0].textContent);
				var newRatings = (date.valueOf() > 1346101200000);
				var link = matchtable.rows[i].cells[1].getElementsByTagName('a').item(0);
				var matchid = Foxtrick.util.id.getMatchIdFromUrl(link.href);
				this._Add_Lineup_Link(doc, matchtable.rows[i], teamid, playerid, matchid, 'normal',
									  newRatings);
			}
		}
	},

	//@param type = 'normal'|'NT'|'U20'|'youth'
	_Add_Lineup_Link: function(doc, row, teamid, playerid, matchid, type, newRatings) {
		//the link is: /Club/Matches/MatchLineup.aspx?MatchID=<matchid>&TeamID=<teamid>
		//the new link:
		// /Club/Matches/Match.aspx?matchID=<matchid>&SourceSystem=<sourcesystem>&TeamId=<teamid>
		// &HighlightPlayerID=<playerid>#tab2
		var cell = Foxtrick.insertFeaturedCell(row, this, -1); // append as the last cell
		cell.className = 'ft-lineup-cell';
		var link = Foxtrick.createFeaturedElement(doc, this, 'a');
		if (type == 'youth') {
			if (!newRatings)
				link.href = '/Club/Matches/MatchLineup.aspx?matchID=' + matchid + '&YouthTeamId=' +
					teamid + '&HighlightPlayerID=' + playerid + '&SourceSystem=Hattrick';
			else
				link.href = '/Club/Matches/Match.aspx?matchID=' + matchid + '&TeamId=' +
					teamid + '&HighlightPlayerID=' + playerid + '&SourceSystem=Youth#tab2';
		} else {
			if (!newRatings)
				link.href = '/Club/Matches/MatchLineup.aspx?matchID=' + matchid + '&TeamId=' +
					teamid + '&HighlightPlayerID=' + playerid + '&SourceSystem=Hattrick';
			else
				link.href = '/Club/Matches/Match.aspx?matchID=' + matchid + '&TeamId=' +
					teamid + '&HighlightPlayerID=' + playerid + '&SourceSystem=Hattrick#tab2';
		}
		var src = '';
		if (type == 'NT')
			src = 'formation.nt.png';
		else if (type == 'U20')
			src = 'formation.u20.png';
		else
			src = 'formation.png';
		Foxtrick.addImage(doc, link, { src: Foxtrick.InternalPath + 'resources/img/' + src });
		cell.appendChild(link);
	},

	//***************** YOUTH TEAM ********************
	_Analyze_Youth_Player_Page: function(doc) {
		var mainWrapper = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
		var mainBody = doc.getElementById('mainBody');

		var matchLink = Foxtrick.nth(0, function(n) {
				return n.href.search(/\/Club\/Matches\/Match\.aspx/i) >= 0;
			}, mainBody.getElementsByTagName('a'));
		if (!matchLink)
			return; // hasn't played a match yet

		// get matchTable which contains matches played
		var matchTable = matchLink;
		while (matchTable.tagName.toLowerCase() != 'table' && matchTable.parentNode)
			matchTable = matchTable.parentNode;
		if (matchTable.tagName.toLowerCase() != 'table')
			return;

		var playerid = Foxtrick.util.id.findYouthPlayerId(mainWrapper);
		var teamid = Foxtrick.util.id.findYouthTeamId(mainWrapper);
		for (var i = 0; i < matchTable.rows.length; i++) {
			var date = Foxtrick.util.time.getDateFromText(matchTable.rows[i].cells[0].textContent);
			var newRatings = (date.valueOf() > 1346101200000);
			var link = matchTable.rows[i].cells[1].getElementsByTagName('a').item(0);
			var matchid = Foxtrick.util.id.getMatchIdFromUrl(link.href);
			this._Add_Lineup_Link(doc, matchTable.rows[i], teamid, playerid, matchid, 'youth', newRatings);
		}
	},

	//************************ HIGHLIGHT PLAYER ***********************************
	_Highlight_Player: function(doc) {
		if (FoxtrickPrefs.isModuleOptionEnabled('LineupShortcut', 'HighlightPlayer')) {
			var newimg = 'url(' + Foxtrick.ResourcePath + 'resources/img/box_yellow.gif)';
			//Getting playerid from url
			var passedid = doc.baseURI.replace(/.+HighlightPlayerID=/i, '').match(/^\d+/);
			if (passedid) {
				var playerdivs = doc.getElementsByClassName('name');
				for (var i = 0; i < playerdivs.length; i++) {
					var playerid = Foxtrick.util.id.findPlayerId(playerdivs[i]);
					if (playerid == passedid) {
						//Found it!
						playerdivs[i].parentNode.style.backgroundImage = newimg;
					}
				}
			}
		}
	}
};
