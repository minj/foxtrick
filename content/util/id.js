/**
* id.js
* Utilities for dealing with ID
*/

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	// @ts-ignore
	var Foxtrick = {};
/* eslint-enable */

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.id = {};

Foxtrick.util.id.getOwnTeamId = function() {
	return Foxtrick.modules.Core.TEAM.teamId;
};

Foxtrick.util.id.getOwnYouthTeamId = function() {
	return Foxtrick.modules.Core.TEAM.youthTeamId;
};

Foxtrick.util.id.getOwnLeagueId = function() {
	return Foxtrick.modules.Core.TEAM.leagueId;
};

Foxtrick.util.id.isSeriesDetailUrl = function(href) {
	return href.match(/Series\/(Default\.aspx)?\?LeagueLevelUnitID=/i);
};

/**
 * @param  {number} teamId
 * @return {boolean}
 */
Foxtrick.util.id.isNTId = function(teamId) {
	// eslint-disable-next-line no-magic-numbers
	return teamId >= 3000 && teamId < 4000; // regular teams seem to start @5000
};

Foxtrick.util.id.getLeagueLeveUnitIdFromUrl = function(url) {
	return url.replace(/.+leagueLevelUnitID=/i, '').match(/^\d+/);
};

Foxtrick.util.id.findLeagueId = function(element) {
	if (!element)
		return null;

	var links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));
	for (var i = 0; i < links.length; i++) {
		if (links[i].href.match(/League\.aspx/i)) {
			return Number(links[i].href.replace(/.+leagueid=/i, '').match(/^\d+/)[0]);
		}
	}
	return null;
};

Foxtrick.util.id.findUserId = function(element) {
	var links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));
	for (var i = 0; i < links.length; i++) {
		if (links[i].href.match(/userId/i)) {
			return Number(links[i].href.replace(/.+userId=/i, '').match(/^\d+/)[0]);
		}
	}
	return null;
};
Foxtrick.util.id.getUserIdFromUrl = function(url) {
	var matched = url.match(/UserID=(\d+)/i);
	return matched ? Number(matched[1]) : null;
};

Foxtrick.util.id.getTeamIdFromUrl = function(url) {
	var matched = url.match(/TeamID=(\d+)/i);
	return matched ? Number(matched[1]) : null;
};

Foxtrick.util.id.getYouthTeamIdFromUrl = function(url) {
	var matched = url.match(/YouthTeamID=(\d+)/i);
	return matched ? Number(matched[1]) : null;
};

Foxtrick.util.id.getMatchIdFromUrl = function(url) {
	var matched = url.match(/matchID=(\d+)/i);
	return matched ? Number(matched[1]) : null;
};

Foxtrick.util.id.isTeamDetailUrl = function(href) {
	return href.match(/.+TeamID=/i);
};

Foxtrick.util.id.extractTeamName = function(element) {
	var links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));
	for (var i = 0; i < links.length; i++) {
		if (Foxtrick.util.id.isTeamDetailUrl(links[i].href)) {
			return links[i].textContent.trim();
		}
	}
	return null;
};

Foxtrick.util.id.findMatchId = function(element) {
	var links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));
	for (var i = 0; i < links.length; i++) {
		if (links[i].href.match(/Club\/Matches\/Match\.aspx/i)) {
			return Number(links[i].href.replace(/.+matchID=/i, '').match(/^\d+/)[0]);
		}
	}
	return null;
};

Foxtrick.util.id.findIsYouthMatch = function(href) {
	if (href.match(/Club\/Matches\/Match\.aspx/i)) {
		return (href.search(/isYouth=true|SourceSystem=Youth/i) != -1);
	}
	return false;
};

Foxtrick.util.id.findTeamId = function(element) {
	var links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));
	for (var i = 0; i < links.length; i++) {
		if (links[i].href.match(/TeamID=/i)) {
			return Number(links[i].href.replace(/.+TeamID=/i, '').match(/^\d+/)[0]);
		}
	}
	return null;
};

Foxtrick.util.id.findYouthTeamId = function(element) {
	var links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));

	for (var i = 0; i < links.length; i++) {
		if (links[i].href.match(/YouthTeamID=/i)) {
			return Number(links[i].href.replace(/.+YouthTeamID=/i, '').match(/^\d+/)[0]);
		}
	}
	return null;
};

/**
 * @param  {Element} element
 * @return {number}
 */
Foxtrick.util.id.findUserId = function(element) {
	let links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));

	for (let link of links) {
		if (link.href.match(/UserID=/i))
			return Number(link.href.replace(/.+UserID=/i, '').match(/^\d+/));
	}
	return null;
};


Foxtrick.util.id.findSecondTeamId = function(element, firstteamid) {
	var links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));
	for (var i = 0; i < links.length; i++) {
		if (links[i].href.match(/TeamID=/i)) {
			var id = links[i].href.replace(/.+TeamID=/i, '').match(/^\d+/)[0];
			if (id != firstteamid)
				return Number(id);
		}
	}
	return 0;
};

Foxtrick.util.id.findPlayerId = function(element) {
	var links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));
	for (var i = 0; i < links.length; i++) {
		if (links[i].href.match(/playerID=/i)) {
			return Number(links[i].href.replace(/.+playerID=/i, '').match(/^\d+/)[0]);
		}
	}
	return null;
};

Foxtrick.util.id.findYouthPlayerId = function(element) {
	var links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));
	for (var i = 0; i < links.length; i++) {
		if (links[i].href.match(/YouthPlayerID=/i)) {
			return Number(links[i].href.replace(/.+YouthPlayerID=/i, '').match(/^\d+/)[0]);
		}
	}
	return null;
};

Foxtrick.util.id.getSkillLevelFromLink = function(link) {
	var value = link.href.replace(/.+(ll|labellevel)=/i, '').match(/^\d+/);
	return parseInt(value, 10);
};

Foxtrick.util.id.extractLeagueName = function(element) {
	var links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));
	for (var i = 0; i < links.length; i++) {
		if (Foxtrick.util.id.isSeriesDetailUrl(links[i].href)) {
			return links[i].text.trim();
		}
	}
	return null;
};

/**
 * Parse seriesName into [levelnum, seriesnum].
 * levelnum is division number, seriesnum is series number in that division.
 * @param  {string} seriesName
 * @param  {number} leagueId
 * @return {Array}             Array.<number>
 */
Foxtrick.util.id.parseSeries = function(seriesName, leagueId) {
	if (!seriesName || !leagueId)
		return null;

	var level, number;
	var m = seriesName.match(/^([IVX])+\.(\d+)$/);
	if (!m) {
		if (leagueId == 1) {
			// Sweden
			if ((m = seriesName.match(/^II\.?([a-z])$/))) {
				level = 3;
			}
			else if ((m = seriesName.match(/^I([a-z])$/))) {
				level = 2;
			}
			else {
				level = 1;
			}

			number = m ? m[1].charCodeAt(0) - 'a'.charCodeAt(0) + 1 : 1;
		}
		else {
			level = number = 1;
		}
	}
	else {
		var dec = Foxtrick.util.id.romantodecimal(m[1]);
		if (leagueId == '1') {
			// Sweden
			level = dec + 1;
		}
		else {
			level = dec;
		}
		number = parseInt(m[2], 10);
	}
	return [level, number];
};

/**
 * @param  {string} roman roman number
 * @return {number}
 */
Foxtrick.util.id.romantodecimal = function(roman) {
	/* eslint-disable no-magic-numbers */
	// very very stupid ....
	switch (roman) {
		case 'I': return 1;
		case 'II': return 2;
		case 'III': return 3;
		case 'IV': return 4;
		case 'V': return 5;
		case 'VI': return 6;
		case 'VII': return 7;
		case 'VIII': return 8;
		case 'IX': return 9;
		case 'X': return 10;
		case 'XI': return 11;
		default: return 0;
	}
	/* eslint-enable no-magic-numbers */
};

Foxtrick.util.id.findLeagueLeveUnitId = function(element) {
	var links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));
	for (var i = 0; i < links.length; i++) {
		if (links[i].href.match(/Series\/(Default\.aspx)?\?LeagueLevelUnitID=/i)) {
			return Number(links[i].href.replace(/.+leagueLevelUnitID=/i, '').match(/^\d+/)[0]);
		}
	}
	return null;
};

/**
 * Returns a flag as a link element
 * link href and img title may optionally override defaults:
 * league link and league name respectively
 *
 * README: DO NOT use if leagueId is available
 *
 * @param  {document} doc
 * @param  {number}   countryId
 * @param  {string}   [href]    optional
 * @param  {string}   [title]   optional
 * @return {Element}            flag
 */
Foxtrick.util.id.createFlagFromCountryId = function(doc, countryId, href, title) {
	var leagueId = Foxtrick.XMLData.getLeagueIdByCountryId(countryId);
	return Foxtrick.util.id.createFlagFromLeagueId(doc, leagueId, href, title);
};

/**
 * Returns a flag as a link element
 *
 * link href and img title may optionally override defaults:
 *
 * league link and league name respectively
 *
 * @param  {document} doc
 * @param  {number}   leagueId
 * @param  {string}   [href]    optional
 * @param  {string}   [title]   optional
 * @return {HTMLAnchorElement} flag
 */
Foxtrick.util.id.createFlagFromLeagueId = function(doc, leagueId, href, title) {
	const leagueName = Foxtrick.L10n.getCountryName(leagueId);

	var flag;

	// if (imgOnly) {
	// 	flag = doc.createElement('span');
	// }

	let a = doc.createElement('a');
	if (href)
		a.href = href;
	else
		a.href = '/World/Leagues/League.aspx?LeagueID=' + leagueId;

	flag = a;

	let img = doc.createElement('img');
	img.className = 'flag' + leagueId;
	img.alt = img.title = title ? title : leagueName;
	img.src = '/Img/Icons/transparent.gif';

	flag.className = 'flag inner';
	flag.appendChild(img);
	return flag;
};

Foxtrick.util.id.findYouthLeagueId = function(element) {
	var links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));
	for (var i = 0; i < links.length; i++) {
		if (links[i].href.match(/YouthLeagueId=/i)) {
			return Number(links[i].href.replace(/.+YouthLeagueId=/i, '').match(/^\d+/)[0]);
		}
	}
	return null;
};
