'use strict';
/**
* id.js
* Utilities for dealing with ID
*/

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};
Foxtrick.util.id = {};

Foxtrick.util.id.getOwnTeamId = function() {
	return Foxtrick.modules['Core'].getSelfTeamInfo().teamId;
};

Foxtrick.util.id.getOwnYouthTeamId = function() {
	return Foxtrick.modules['Core'].getSelfTeamInfo().youthTeamId;
};

Foxtrick.util.id.getOwnLeagueId = function() {
	return Foxtrick.modules['Core'].getSelfTeamInfo().leagueId;
};

Foxtrick.util.id.isSeriesDetailUrl = function(href) {
	return href.match(/Series\/(Default\.aspx)?\?LeagueLevelUnitID=/i);
};

Foxtrick.util.id.getLeagueLeveUnitIdFromUrl = function(url) {
	return url.replace(/.+leagueLevelUnitID=/i, '').match(/^\d+/);
};

Foxtrick.util.id.findLeagueId = function(element) {
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
	return false;
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

Foxtrick.util.id.findUserId = function(element) {
	var links = Foxtrick.filter(function(n) {
		return n.hasAttribute('href');
	}, element.getElementsByTagName('a'));
	for (var i = 0; i < links.length; i++) {
		if (links[i].href.match(/UserID=/i)) {
			return Number(links[i].href.replace(/.+UserID=/i, '').match(/^\d+/));
		}
	}
	return false;
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
	return value;
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

Foxtrick.util.id.getSeriesNum = function(leaguename) {
	if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
		return '1';
	} else {
		return leaguename.match(/\d+/)[0];
	}
};

Foxtrick.util.id.getLevelNum = function(leaguename, countryid) {
	if (leaguename == null || countryid == null) return null;
	if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
		// sweden
		if (countryid == '1') {
			if (leaguename.match(/^II[a-z]+/)) {
				return '3';
			}
			if (leaguename.match(/^I[a-z]+/)) {
				return '2';
			}
			return '1';
		}
		return '1';
	} else {
		var temp = Foxtrick.util.id.romantodecimal(leaguename.match(/[A-Z]+/)[0]);
		// sweden
		if (countryid == '1') {
			return temp + 1;
		} else {
			return temp;
		}
	}
};

Foxtrick.util.id.romantodecimal = function(roman) {
	// very very stupid ....
	switch (roman) {
		case ('I'): return 1;
		case ('II'): return 2;
		case ('III'): return 3;
		case ('IV'): return 4;
		case ('V'): return 5;
		case ('VI'): return 6;
		case ('VII'): return 7;
		case ('VIII'): return 8;
		case ('IX'): return 9;
		case ('X'): return 10;
		default: return null;
	}
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

Foxtrick.util.id.countryNameEnglishToLocal = function(engName) {
	var i;
	for (i in Foxtrick.XMLData.League) {
		if (Foxtrick.XMLData.League[i].EnglishName === engName) {
			return Foxtrick.XMLData.League[i].LeagueName;
		}
	}
	return null;
};

Foxtrick.util.id.countryNameLocalToEnglish = function(localName) {
	var i;
	for (i in Foxtrick.XMLData.League) {
		if (Foxtrick.XMLData.League[i].LeagueName === localName) {
			return Foxtrick.XMLData.League[i].EnglishName;
		}
	}
	return null;
};

Foxtrick.util.id.getLeagueDataFromId = function(id) {
	var data = null;
	try { data = Foxtrick.XMLData.League[id];}
	catch (e) {}

	if (data == null)
		Foxtrick.log('getLeagueDataFromId error. id: ' + id + '\n');
	return data;
};

Foxtrick.util.id.getCurrencyRateFromId = function(id) {
	try {
		Foxtrick.dump(Foxtrick.util.id.getLeagueDataFromId(id).Country.CurrencyRate
		              .replace(',', '.') + '\n');
		return parseFloat(Foxtrick.util.id.getLeagueDataFromId(id).Country.CurrencyRate
		                  .replace(',', '.')) / 10;
	}
	catch (e) {}
	Foxtrick.dump('getCurrencyRate error. id: ' + id + '\n');
};
/**
 * Returns a flag as a link element
 * link href and img title may optionally override defaults:
 * league link and league name respectively
 * @param	{document}	doc
 * @param	{Integer}	countryId
 * @param	{String}	href		optional
 * @param	{String}	title		optional
 * @param	{Boolean}	imgOnly		return image only
 * @returns	{element}		flag
 */
Foxtrick.util.id.createFlagFromCountryId = function(doc, countryId, href, title, imgOnly) {
	var leagueId = Foxtrick.XMLData.getLeagueIdByCountryId(countryId);
	return Foxtrick.util.id.createFlagFromLeagueId(doc, leagueId, href, title, imgOnly);
}
/**
 * Returns a flag as a link element
 * link href and img title may optionally override defaults:
 * league link and league name respectively
 * @param	{document}	doc
 * @param	{Integer}	leagueId
 * @param	{String}	href		optional
 * @param	{String}	title		optional
 * @param	{Boolean}	imgOnly		return image only
 * @returns	{element}		flag
 */
Foxtrick.util.id.createFlagFromLeagueId = function(doc, leagueId, href, title, imgOnly) {
	var leagueName = 'New Moon';
	if (leagueId) {
		leagueName = Foxtrick.util.id.getLeagueDataFromId(leagueId).LeagueName;
	}
	var a = doc.createElement('a');
	if (href)
		a.href = href;
	else a.href = '/World/Leagues/League.aspx?LeagueID=' + leagueId;

	if (imgOnly)
		a = doc.createElement('span');
	a.className = 'flag inner';
	var img = doc.createElement('img');
	img.className = 'flag' + leagueId;
	if (title)
		img.alt = img.title = title;
	else img.alt = img.title = leagueName;
	img.src = '/Img/Icons/transparent.gif';
	a.appendChild(img);
	return a;
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
