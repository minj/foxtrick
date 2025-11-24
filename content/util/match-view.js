/**
 * match-view.js
 * utilities for match view
 *
 * @author ryanli
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.matchView = {};

Foxtrick.util.matchView.startLoad = function(container) {
	var doc = container.ownerDocument;
	var loading = Foxtrick.util.note.createLoading(doc);
	container.appendChild(loading);
};

Foxtrick.util.matchView.fillMatches = function(container, xml, errorText) {
	if (xml === null) {
		container.textContent = errorText;
		return;
	}

	var type2info = function(type, cup) {
		// convert match type integer to match type info
		// source:
		// https://www.hattrick.org/goto.ashx?path=/Community/CHPP/NewDocs/DataTypes.aspx%23matchTypeID
		// TODO generalize and extract
		var mapping = {
			1: { key: 'league', className: 'matchLeague' },
			2: { key: 'qualification', className: 'matchQualification' },
			4: { key: 'friendly', className: 'matchFriendly' },
			5: { key: 'friendly.cup', className: 'matchFriendly' },
			7: { key: 'masters', className: 'matchMasters' },
			8: { key: 'friendly', className: 'matchFriendly' },
			9: { key: 'friendly.cup', className: 'matchFriendly' },
			10: { key: 'nt.competitive', className: ' matchLeague' },
			11: { key: 'nt.competitive', className: ' matchLeague' },
			12: { key: 'nt.friendly', className: ' matchFriendly' },
			100: { key: 'youth.league', className: 'matchLeague' },
			101: { key: 'youth.friendly', className: 'matchFriendly' },
			103: { key: 'youth.friendly.cup', className: 'matchFriendly' },
			105: { key: 'youth.friendly', className: 'matchFriendly' },
			106: { key: 'youth.friendly.cup', className: 'matchFriendly' },
		};
		var cups = {
			4: { key: 'cupA', className: 'matchCupA' },
			7: { key: 'cupB1', className: 'matchCupB1' },
			8: { key: 'cupB2', className: 'matchCupB2' },
			9: { key: 'cupB3', className: 'matchCupB3' },
			10: { key: 'cupC', className: 'matchCupC' },
		};
		var obj = type == 3 ? cups[cup] : mapping[type];

		if (obj) {
			return {
				str: Foxtrick.L10n.getString('match.type.' + obj.key),
				className: obj.className,
			};
		}
		return null;
	};
	var getMatchInfo = function(match) {
		var type = xml.text('MatchType', match);
		var cupLvl = xml.num('CupLevel', match);
		var cupIdx = xml.num('CupLevelIndex', match);
		var cup = cupLvl * 3 + cupIdx;
		return type2info(type, cup);
	};

	var doc = container.ownerDocument;
	var IS_RTL = Foxtrick.util.layout.isRtl(doc);

	container.textContent = ''; // clear container first
	var table = doc.createElement('table');
	container.appendChild(table);

	var teamId = xml.num('TeamID');
	// var teamName = xml.text('TeamName');

	var isYouth = xml.bool('IsYouth');
	var matches = xml.getElementsByTagName('Match');

	// add one played and one not played
	var playedMatches = Foxtrick.filter(function(m) {
		return xml.text('Status', m) == 'FINISHED';
	}, matches);
	var notPlayedMatches = Foxtrick.filter(function(m) {
		return xml.text('Status', m) != 'FINISHED';
	}, matches);

	// get last previous and first future match
	playedMatches.reverse();
	var displayed = Foxtrick.map(function(matches) {
		// only supported types (no HTO)
		return Foxtrick.nth(getMatchInfo, matches);
	}, [playedMatches, notPlayedMatches]);

	var nextMatchDate = displayed[1] ? xml.time('MatchDate', displayed[1]) : null;

	var makeMatchRow = function(match) {
		var row = doc.createElement('tr');

		var matchTypeCell = doc.createElement('td');
		if (match.typeInfo) {
			var typeImg = doc.createElement('img');
			typeImg.src = '/Img/icons/transparent.gif';
			typeImg.className = match.typeInfo.className;
			typeImg.title = typeImg.alt = match.typeInfo.str;
			matchTypeCell.appendChild(typeImg);
		}
		row.appendChild(matchTypeCell);

		var matchCell = doc.createElement('td');
		var matchLink = doc.createElement('a');
		matchLink.dataset.matchType = match.type;
		matchLink.href = '/Club/Matches/Match.aspx?matchID=' + match.id + '&SourceSystem=' +
			(isYouth ? 'Youth' : 'Hattrick');

		// limit team name length to fit in one line
		var cutLength = 12;
		var spanHome = doc.createElement('span');
		spanHome.className = 'nowrap';
		spanHome.textContent = match.home.slice(0, cutLength);

		var spanAway = doc.createElement('span');
		spanAway.className = 'nowrap';
		spanAway.textContent = match.away.slice(0, cutLength);

		if (!IS_RTL) {
			matchLink.title = match.home + ' - ' + match.away;
			matchLink.appendChild(spanHome);
			matchLink.appendChild(doc.createTextNode(' - '));
			matchLink.appendChild(spanAway);
		}
		else {
			matchLink.title = match.away + ' - ' + match.home;
			matchLink.appendChild(spanAway);
			matchLink.appendChild(doc.createTextNode(' - '));
			matchLink.appendChild(spanHome);
		}

		matchCell.appendChild(matchLink);
		row.appendChild(matchCell);

		var resultCell = doc.createElement('td');
		if (match.homeGoals !== null && match.awayGoals !== null) {
			resultCell.textContent = match.homeGoals + ' - ' + match.awayGoals;
			if (match.homeGoals == match.awayGoals) {
				resultCell.className = 'draw';
			}
			else if (match.homeGoals > match.awayGoals && match.side == 'home' ||
			         match.homeGoals < match.awayGoals && match.side == 'away') {
				resultCell.className = 'won';
			}
			else {
				resultCell.className = 'lost';
			}
		}
		else {
			matchLink.dataset.live = '';

			// add HT-Live
			var liveLink = doc.createElement('a');
			liveLink.href = '/Club/Matches/Live.aspx?actionType=addMatch&matchID=' + match.id +
				'&SourceSystem=' + (isYouth ? 'Youth' : 'Hattrick');

			var liveImg = doc.createElement('img');
			liveImg.className = 'matchHTLive';
			liveImg.src = '/Img/Icons/transparent.gif';
			liveImg.alt = liveImg.title = Foxtrick.L10n.getString('MyMonitor.htLive');
			liveLink.appendChild(liveImg);

			resultCell.appendChild(liveLink);
		}

		Foxtrick.addClass(resultCell, 'nowrap');
		row.appendChild(resultCell);
		return row;
	};

	for (var matchXML of displayed) {
		if (!matchXML)
			continue;

		var type = xml.text('MatchType', matchXML);
		var typeInfo = getMatchInfo(matchXML);

		var matchId = xml.num('MatchID', matchXML);
		var homeTeam = xml.text('HomeTeamName', matchXML);
		var awayTeam = xml.text('AwayTeamName', matchXML);
		var homeId = xml.num('HomeTeamID', matchXML);
		// var awayId = xml.num('AwayTeamID', matchXML);
		var side = teamId == homeId ? 'home' : 'away';

		var homeGoals = null, awayGoals = null;
		var status = xml.text('Status', matchXML);
		if (status == 'FINISHED') {
			homeGoals = xml.num('HomeGoals', matchXML);
			awayGoals = xml.num('AwayGoals', matchXML);
		}

		var match = {
			type: type,
			typeInfo: typeInfo,
			id: matchId,
			side: side,
			home: homeTeam,
			homeGoals: homeGoals,
			away: awayTeam,
			awayGoals: awayGoals,
		};

		table.appendChild(makeMatchRow(match));
	}
	return nextMatchDate;
};
