'use strict';
/* match-view.js
 * utilities for match view
 *
 * @author ryanli
 */

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line
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
		var type = match.getElementsByTagName('MatchType')[0].textContent;
		var cupLvl = match.getElementsByTagName('CupLevel')[0].textContent;
		var cupIdx = match.getElementsByTagName('CupLevelIndex')[0].textContent;
		var cup = parseInt(cupLvl, 10) * 3 + parseInt(cupIdx, 10);
		return type2info(type, cup);
	};

	var doc = container.ownerDocument;

	container.textContent = ''; // clear container first
	var table = doc.createElement('table');
	container.appendChild(table);

	var teamId = xml.getElementsByTagName('TeamID')[0].textContent;
	// var teamName = xml.getElementsByTagName('TeamName')[0].textContent;

	var isYouth = xml.bool('IsYouth');
	var matches = xml.getElementsByTagName('Match');

	// add one played and one not played
	var played = Foxtrick.filter(function(n) {
		return n.getElementsByTagName('Status')[0].textContent == 'FINISHED';
	}, matches);
	var notPlayed = Foxtrick.filter(function(n) {
		return n.getElementsByTagName('Status')[0].textContent != 'FINISHED';
	}, matches);

	// get last previous and first future match
	played.reverse();
	var toAdd = Foxtrick.map(function(type) {
		// only supported types (no HTO)
		return Foxtrick.nth(getMatchInfo, type);
	}, [played, notPlayed]);

	var nextMatchDate = toAdd[1] ? xml.time('MatchDate', toAdd[1]) : null;

	var makeMatchRow = function(match) {
		var rtl = Foxtrick.util.layout.isRtl(doc);

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
		matchLink.setAttribute('data-match-type', match.type);
		matchLink.href = '/Club/Matches/Match.aspx?matchID=' + match.id + '&SourceSystem=' +
			(isYouth ? 'Youth' : 'Hattrick');

		// get in one line for standard theme while won't fit in one
		// line anyway for simple theme
		var cutLength = 12;
		if (!rtl) {
			matchLink.title = match.home + ' - ' + match.away;
			var spanLTR1 = doc.createElement('span');
			spanLTR1.className = 'nowrap';
			spanLTR1.textContent = match.home.slice(0, cutLength);
			matchLink.appendChild(spanLTR1);
			matchLink.appendChild(doc.createTextNode(' - '));
			var spanLTR2 = doc.createElement('span');
			spanLTR2.className = 'nowrap';
			spanLTR2.textContent = match.away.slice(0, cutLength);
			matchLink.appendChild(spanLTR2);
		}
		else {
			matchLink.title = match.away + ' - ' + match.home;
			var spanRTL1 = doc.createElement('span');
			spanRTL1.className = 'nowrap';
			spanRTL1.textContent = match.away.slice(0, cutLength);
			matchLink.appendChild(spanRTL1);
			matchLink.appendChild(doc.createTextNode(' - '));
			var spanRTL2 = doc.createElement('span');
			spanRTL2.className = 'nowrap';
			spanRTL2.textContent = match.home.slice(0, cutLength);
			matchLink.appendChild(spanRTL2);
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
			matchLink.setAttribute('data-live', '');
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

	for (var matchXML of toAdd) {
		if (!matchXML)
			continue;

		var type = xml.text('MatchType', matchXML);
		var typeInfo = getMatchInfo(matchXML);

		var matchId = xml.num('MatchID', matchXML);
		var homeTeam = xml.text('HomeTeamName', matchXML);
		var awayTeam = xml.text('AwayTeamName', matchXML);
		var homeId = xml.num('HomeTeamID', matchXML);
		// var awayId = xml.getElementsByTagName('AwayTeamID', matchXML)[0].textContent;
		var side = teamId == homeId ? 'home' : 'away';

		var homeGoals = null;
		var awayGoals = null;
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
