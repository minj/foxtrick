/**
* id.js
* Utilities for dealing with ID
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

/**
 * @param  {string} href
 * @return {boolean}
 */
Foxtrick.util.id.isSeriesDetailUrl = function(href) {
	return /Series\/(Default\.aspx)?\?LeagueLevelUnitID=/i.test(href);
};

/**
 * @param  {number} teamId
 * @return {boolean}
 */
Foxtrick.util.id.isNTId = function(teamId) {
	// eslint-disable-next-line no-magic-numbers
	return teamId >= 3000 && teamId < 4000; // regular teams seem to start @5000
};

/**
 * @param  {string} url
 * @return {number}
 */
Foxtrick.util.id.getLeagueLeveUnitIdFromUrl = function(url) {
	let p = Foxtrick.getUrlParam(url, 'leagueLevelUnitID');
	return Number(p);
};

/**
 * @param  {string} url
 * @return {number}
 */
Foxtrick.util.id.getUserIdFromUrl = function(url) {
	let p = Foxtrick.getUrlParam(url, 'userId');
	return p ? Number(p) : null;
};

/**
 * @param  {string} url
 * @return {number}
 */
Foxtrick.util.id.getTeamIdFromUrl = function(url) {
	let p = Foxtrick.getUrlParam(url, 'TeamID') || Foxtrick.getUrlParam(url, 'YouthTeamID');
	return p ? Number(p) : null;
};

/**
 * @param  {string} url
 * @return {number}
 */
Foxtrick.util.id.getYouthTeamIdFromUrl = function(url) {
	let p = Foxtrick.getUrlParam(url, 'YouthTeamID');
	return p ? Number(p) : null;
};

/**
 * @param  {string} url
 * @return {number}
 */
Foxtrick.util.id.getMatchIdFromUrl = function(url) {
	let p = Foxtrick.getUrlParam(url, 'matchID') || Foxtrick.getUrlParam(url, 'youthMatchID');
	return p ? Number(p) : null;
};

/**
 * @param  {HTMLAnchorElement} link
 * @return {number}
 */
Foxtrick.util.id.getSkillLevelFromLink = function(link) {
	var value = link.href.replace(/.+(ll|labellevel)=/i, '').match(/^\d+/);
	return parseInt(String(value), 10);
};

/**
 * @param  {Element} element
 * @return {number}
 */
Foxtrick.util.id.findLeagueId = function(element) {
	if (!element)
		return null;

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let links = element.querySelectorAll('a[href]');
	for (let link of links) {
		if (link.href.match(/League\.aspx/i)) {
			let p = Foxtrick.getUrlParam(link.href, 'leagueid');
			return Number(p);
		}
	}
	return null;
};

/**
 * @param  {Element} element
 * @return {number}
 */
Foxtrick.util.id.findUserId = function(element) {
	if (!element)
		return null;

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let links = element.querySelectorAll('a[href]');
	for (let link of links) {
		if (/UserID=/i.test(link.href)) {
			let p = Foxtrick.getUrlParam(link.href, 'UserID');
			return p ? Number(p) : null;
		}
	}
	return null;
};

/**
 * @param  {Element} element
 * @return {number}
 */
Foxtrick.util.id.findMatchId = function(element) {
	if (!element)
		return null;

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let links = element.querySelectorAll('a[href]');
	for (let link of links) {
		if (/Club\/Matches\/Match\.aspx/i.test(link.href)) {
			let p = Foxtrick.getUrlParam(link.href, 'matchID') ||
				Foxtrick.getUrlParam(link.href, 'youthMatchID');

			return p ? Number(p) : null;
		}
	}
	return null;
};


/**
 * @param  {Element} element
 * @return {number}
 */
Foxtrick.util.id.findTeamId = function(element) {
	if (!element)
		return null;

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let links = element.querySelectorAll('a[href]');
	for (let link of links) {
		if (/TeamID=/i.test(link.href)) {
			let p = Foxtrick.getUrlParam(link.href, 'TeamID') ||
				Foxtrick.getUrlParam(link.href, 'youthTeamID');
			return p ? Number(p) : null;
		}
	}
	return null;
};

/**
 * @param  {Element} element
 * @return {number}
 */
Foxtrick.util.id.findYouthTeamId = function(element) {
	if (!element)
		return null;

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let links = element.querySelectorAll('a[href]');
	for (let link of links) {
		if (/YouthTeamID=/i.test(link.href)) {
			let p = Foxtrick.getUrlParam(link.href, 'YouthTeamID');
			return p ? Number(p) : null;
		}
	}
	return null;
};

/**
 * @param  {Element} element
 * @param  {number} firstTeamId
 * @return {number}
 */
Foxtrick.util.id.findSecondTeamId = function(element, firstTeamId) {
	if (!element)
		return null;

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let links = element.querySelectorAll('a[href]');
	for (let link of links) {
		if (/TeamID=/i.test(link.href)) {
			let p = Foxtrick.getUrlParam(link.href, 'TeamID') ||
				Foxtrick.getUrlParam(link.href, 'YouthTeamID');

			if (p && p != String(firstTeamId))
				return Number(p);
		}
	}
	return 0;
};

/**
 * @param  {Element} element
 * @return {number}
 */
Foxtrick.util.id.findPlayerId = function(element) {
	if (!element)
		return null;

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let links = element.querySelectorAll('a[href]');
	for (let link of links) {
		if (/playerID=/i.test(link.href)) {
			let p = Foxtrick.getUrlParam(link.href, 'playerID') ||
				Foxtrick.getUrlParam(link.href, 'YouthplayerID');
			return p ? Number(p) : null;
		}
	}
	return null;
};

/**
 * @param  {Element} element
 * @return {number}
 */
Foxtrick.util.id.findYouthPlayerId = function(element) {
	if (!element)
		return null;

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let links = element.querySelectorAll('a[href]');
	for (let link of links) {
		if (/YouthPlayerID=/i.test(link.href)) {
			let p = Foxtrick.getUrlParam(link.href, 'YouthplayerID');
			return p ? Number(p) : null;
		}
	}
	return null;
};

/**
 * @param  {Element} element
 * @return {string} relative URL to trainer page
 */
Foxtrick.util.id.findTrainerUrl = function(element) {
	if (!element)
		return null;

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let links = element.querySelectorAll('a[href]');
	for (let link of links) {
		let match = link.href.match(/\/Club\/Specialists\/Trainer.aspx.*/);
		if (match) {
			return match[0];
		}
	}
	return null;
};

/**
 * @param  {Element} element
 * @return {number}
 */
Foxtrick.util.id.findLeagueLeveUnitId = function(element) {
	if (!element)
		return null;

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let links = element.querySelectorAll('a[href]');
	for (let link of links) {
		if (/Series\/(Default\.aspx)?\?LeagueLevelUnitID=/i.test(link.href)) {
			let p = Foxtrick.getUrlParam(link.href, 'leagueLevelUnitID');
			return p ? Number(p) : null;
		}
	}
	return null;
};

/**
 * @param  {Element} element
 * @return {number}
 */
Foxtrick.util.id.findYouthLeagueId = function(element) {
	if (!element)
		return null;

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let links = element.querySelectorAll('a[href]');
	for (let link of links) {
		if (/YouthLeagueId=/i.test(link.href)) {
			let p = Foxtrick.getUrlParam(link.href, 'YouthLeagueId');
			return p ? Number(p) : null;
		}
	}
	return null;
};

/**
 * @param  {Element} element
 * @return {string}
 */
Foxtrick.util.id.extractLeagueName = function(element) {
	if (!element)
		return null;

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let links = element.querySelectorAll('a[href]');
	for (let link of links) {
		if (Foxtrick.util.id.isSeriesDetailUrl(link.href))
			return link.text.trim();
	}
	return null;
};

/**
 * Parse seriesName into [levelnum, seriesnum].
 * levelnum is division number, seriesnum is series number in that division.
 * @param  {string} seriesName
 * @param  {number} leagueId
 * @return {[number, number]}
 */
Foxtrick.util.id.parseSeries = function(seriesName, leagueId) {
	if (!seriesName || !leagueId)
		return null;

	var level, number;
	var m = seriesName.match(/^([IVX])+\.(\d+)$/);
	if (m) {
		let [_, roman, num] = m;
		var dec = Foxtrick.util.id.romantodecimal(roman);
		if (String(leagueId) == '1') {
			// Sweden
			level = dec + 1;
		}
		else {
			level = dec;
		}
		number = parseInt(num, 10);
	}
	else if (leagueId == 1) {
		// Sweden
		if ((m = seriesName.match(/^II\.?([a-z])$/)))
			// eslint-disable-next-line no-magic-numbers
			level = 3;
		else if ((m = seriesName.match(/^I([a-z])$/)))
			level = 2;
		else
			level = 1;

		number = m ? m[1].charCodeAt(0) - 'a'.charCodeAt(0) + 1 : 1;
	}
	else {
		level = number = 1;
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

/**
 * Returns a flag as a link element
 * link href and img title may optionally override defaults:
 * league link and league name respectively
 *
 * !README: DO NOT use if leagueId is available
 *
 * @param  {document} doc
 * @param  {number}   countryId
 * @param  {string}   [href]    optional
 * @param  {string}   [title]   optional
 * @return {Element}            flag
 */
Foxtrick.util.id.createFlagFromCountryId = function(doc, countryId, href, title) {
	let leagueId = Foxtrick.XMLData.getLeagueIdByCountryId(countryId);
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
