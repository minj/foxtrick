'use strict';
/**
 * match.js
 * utilities on match page
 * @author taised, Jestar, LA-MJ
 */
////////////////////////////////////////////////////////////////////////////////

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.Match = {};

/**
 * Get team links
 * @param  {document} doc
 * @return {array}
 */
Foxtrick.Pages.Match.getTeams = function(doc) {
	var teams = [], container;
	if (Foxtrick.isPage(doc, 'matchesLive')) {
		container = doc.querySelector('.rtsSelected .liveTabText');
		Foxtrick.forEach(function(child) {
			if (child.textContent.trim() === '')
				// skip empty
				return;
			var team;
			if (child.nodeType == Foxtrick.NodeTypes.TEXT_NODE) {
				var name = child.textContent.replace(/\s+-\s+$/, '').trim();
				if (name === '')
					// hyphen for non-street teams
					return;
				// street team
				team = doc.createTextNode(name);
			}
			else if (child.nodeName.toLowerCase() !== 'a')
				// skip spans etc
				return;
			else
				team = child;

			teams.push(team);
		}, container.childNodes);
	}
	else {
		container = doc.querySelector('#mainBody h1');
		Foxtrick.forEach(function(child) {
			if (child.textContent.trim() === '')
				// skip empty
				return;
			var team;
			if (child.nodeType == Foxtrick.NodeTypes.TEXT_NODE) {
				var name = child.textContent.replace(/\s+\d+\s+-\s+\d+\s+$/, '').trim();
				if (name === '')
					// hyphen for non-street teams
					return;
				// street team
				team = doc.createTextNode(name);
			}
			else if (child.nodeName.toLowerCase() !== 'a')
				// team popup
				team = child.querySelector('a');
			else
				team = child;

			teams.push(team);
		}, container.childNodes);
	}
	return teams;
};

/**
 * Get home team link
 * @param  {document}          doc
 * @return {HTMLAnchorElement}
 */
Foxtrick.Pages.Match.getHomeTeam = function(doc) {
	var homeIdx = Foxtrick.util.layout.isRtl(doc) ? 1 : 0;
	var teams = this.getTeams(doc);
	return teams[homeIdx];
};

/**
 * Get home team link
 * @param  {document}          doc
 * @return {HTMLAnchorElement}
 */
Foxtrick.Pages.Match.getAwayTeam = function(doc) {
	var awayIdx = Foxtrick.util.layout.isRtl(doc) ? 0 : 1;
	var teams = this.getTeams(doc);
	return teams[awayIdx];
};

/**
 * Get home team ID
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.Match.getHomeTeamId = function(doc) {
	var team = this.getHomeTeam(doc);
	return team && team.href ? Foxtrick.util.id.getTeamIdFromUrl(team.href) : null;
};

/**
 * Get home team ID
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.Match.getAwayTeamId = function(doc) {
	var team = this.getAwayTeam(doc);
	return team && team.href ? Foxtrick.util.id.getTeamIdFromUrl(team.href) : null;
};

/**
 * Get home team name
 * @param  {document} doc
 * @return {string}
 */
Foxtrick.Pages.Match.getHomeTeamName = function(doc) {
	var team = this.getHomeTeam(doc);
	return team ? team.textContent : null;
};

/**
 * Get home team name
 * @param  {document} doc
 * @return {string}
 */
Foxtrick.Pages.Match.getAwayTeamName = function(doc) {
	var team = this.getAwayTeam(doc);
	return team ? team.textContent : null;
};

/**
 * Test whether match has not started
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Match.isPrematch = function(doc) {
	return doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlPreMatch') !== null;
};

/**
 * Test whether match report has advanced ratings
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Match.hasRatingsTabs = function(doc) {
	return doc.getElementById('divSectors') !== null;
};

/**
 * Get sourceSystem
 * @param  {document} doc
 * @return {string}
 */
Foxtrick.Pages.Match.getSourceSystem = function(doc) {
	var SourceSystem = 'Hattrick';
	var isYouth = this.isYouth(doc);
	var isHTOIntegrated = this.isHTOIntegrated(doc);
	if (isYouth)
		SourceSystem = 'Youth';
	if (isHTOIntegrated)
		SourceSystem = 'HTOIntegrated';
	return SourceSystem;
};

/**
 * Test whether it's a youth match
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Match.isYouth = function(doc) {
	return /isYouth=true|SourceSystem=Youth/i.test(doc.location.search);
};

/**
 * Test whether it's an HTO match
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Match.isHTOIntegrated = function(doc) {
	return /SourceSystem=HTOIntegrated/i.test(doc.location.search);
};

/**
 * Test whether it's an NT match
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Match.isNT = function(doc) {
	var homeId = this.getHomeTeamId(doc);
	var awayId = this.getAwayTeamId(doc);
	return homeId && awayId && homeId < 10000 && awayId < 10000 || false;
};

/**
 * Get match ID
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.Match.getId = function(doc) {
	var url;
	if (Foxtrick.isPage(doc, 'matchesLive')) {
		var link = doc.querySelector('.liveResult a');
		if (!link)
			return null;
		else
			url = link.href;
	}
	else {
		url = doc.location.href;
	}
	return Foxtrick.util.id.getMatchIdFromUrl(url);
};

/**
 * Get match date object
 * @param  {document} doc
 * @return {Date}
 */
Foxtrick.Pages.Match.getDate = function(doc) {
	var date = doc.getElementsByClassName('date')[0];
	return Foxtrick.util.time.getDateFromText(date.textContent);
};

/**
 * Test whether match is in progress
 * @param  {document} doc
 * @return {Boolean}
 */
Foxtrick.Pages.Match.inProgress = function(doc) {
	var matchStatus = doc.getElementById('ctl00_ctl00_CPContent_CPMain_lblMatchStatus');
	return matchStatus !== null && matchStatus.textContent.trim() !== '';
};

/**
 * Get ratings table
 * @param  {document} doc
 * @return {HTMLAnchorElement}
 */
Foxtrick.Pages.Match.getRatingsTable = function(doc) {
	return doc.querySelector('.teamMatchRatingsTable table');
};

/**
 * Test whether ratings table has indirect SP info
 * @param  {HTMLTableElement} ratingstable
 * @return {Boolean}
 */
Foxtrick.Pages.Match.hasIndSetPieces = function(ratingstable) {
	// either iSP level link in that cell or for old matches tactic=no link
	return ratingstable.rows.length > 10 && ratingstable.rows[10].cells.length > 1 &&
		ratingstable.rows[10].cells[1].getElementsByTagName('a').length > 0;
};

/**
 * Test whether match is a walkover
 * @param  {HTMLTableElement} ratingstable
 * @return {Boolean}
 */
Foxtrick.Pages.Match.isWalkOver = function(ratingstable) {
	try {
		for (var i = 1; i <= 7; i++) {
			for (var j = 3; j <= 4; j++) {
				var value = parseInt(ratingstable.rows[i].cells[j].textContent, 10);
				if (value > 0) { // no Walk-over
					return false;
				}
			}
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return true;
};

/**
 * Get ratings in floats for both teams.
 * Returns an array map where first element is home team, away second:
 * {mf, rd, cd, ld, ra, ca, la}
 * @param  {HTMLTableElement} ratingstable
 * @return {object}                        Object.<string, Array.<number>>
 */
Foxtrick.Pages.Match.getRatingsByTeam = function(ratingstable) {
	var getRatingFromCell = function(coords) {
		var cell = ratingstable.rows[coords[0]].cells[coords[1]];
		return Foxtrick.Math.hsToFloat(cell.textContent);
	};
	var ratings = {};
	// rows 1-7 contain numeric data (columns 3-4) for both team ratings in this order:
	var order = ['mf', 'rd', 'cd', 'ld', 'ra', 'ca', 'la'];
	try {
		for (var i = 1; i <= 7; i++) {
			ratings[order[i - 1]] = Foxtrick.map(getRatingFromCell, [[i, 3], [i, 4]]);
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return ratings;
};

/**
 * Get tactics level value from a tactics cell
 * @param  {HTMLTableCellElement} cell
 * @return {number}
 */
Foxtrick.Pages.Match.getTacticsLevelFromCell = function(cell) {
	var basevalue = 0;
	var tacticsLink = cell.getElementsByTagName('a')[0];
	if (tacticsLink) {
		basevalue = Foxtrick.util.id.getSkillLevelFromLink(tacticsLink.href);
	}
	return basevalue;
};

/**
 * Get tactics type from a tactics cell.
 * Returns one of normal, pressing, ca, aim, aow, creatively, longshots
 * @param  {HTMLTableCellElement} cell
 * @return {string}
 */
Foxtrick.Pages.Match.getTacticsFromCell = function(cell) {
	var tactics = cell.textContent.trim();
	var lang = Foxtrick.Prefs.getString('htLanguage');

	try {
		var category = Foxtrick.L10n.htLanguagesJSON[lang].language['tactics'];
		var subLevelValue = Foxtrick.nth(function(item) {
			return item.value == tactics;
		}, category).type;
		return subLevelValue || -1;
	}
	catch (e) {
		Foxtrick.log('getTacticsFromCell', e);
	}
	return null;
};

/**
 * Get tactics data for home and away teams
 * E. g. { tactics: ['aow', 'normal'], level: [15, 0] }
 * @param  {HTMLTableElement} ratingstable
 * @return {object}                        {tactics: Array.<string>, level: Array.<number>}
 */
Foxtrick.Pages.Match.getTacticsByTeam = function(ratingstable) {
	var tacticRow = 10, levelRow = 11;
	if (this.hasIndSetPieces(ratingstable)) {
		tacticRow = 14;
		levelRow = 15;
	}
	var tactics = [
		this.getTacticsFromCell(ratingstable.rows[tacticRow].cells[1]),
		this.getTacticsFromCell(ratingstable.rows[tacticRow].cells[2])
	];
	var level = [
		parseInt(ratingstable.rows[levelRow].cells[3].textContent, 10) || 0,
		parseInt(ratingstable.rows[levelRow].cells[4].textContent, 10) || 0
	];
	return { tactics: tactics, level: level };
};

// START NEW RATINGS UTILS

/**
 * Add a listener to changes of tabId in HT-Live matches.
 * Calls callback(doc) on mutation.
 * Registers a chain of MOs to by-pass the Live timer.
 * Cannot use subtree: true on the container because
 * change() would execute every second in FF.
 * This is because the match timer triggers childList changes in FF.
 * @param {document} doc
 * @param {string}   tabId    element to listen to
 * @param {Function} callback function(document)
 */
Foxtrick.Pages.Match.addLiveTabListener = function(doc, tabId, callback) {
	var registerTab = function(doc) {
		callback(doc);
		var target = doc.getElementById(tabId);
		if (target) {
			// found the right tab
			Foxtrick.onChange(target, callback);
		}
	};
	var registerMatch = function(doc) {
		registerTab(doc);
		var target = doc.getElementById('ctl00_ctl00_CPContent_CPMain_phLiveStatusPanel');
		if (target) {
			// found match view
			Foxtrick.onChange(target, registerTab, { subtree: false });
		}
	};
	// start everything onLoad
	registerMatch(doc);
	var liveContainer = doc.getElementById('ctl00_ctl00_CPContent_CPMain_UpdatePanelMatch');
	if (liveContainer) {
		// this the largest container that contains overview OR match view
		Foxtrick.onChange(liveContainer, registerMatch, { subtree: false });
	}
};

/**
 * Add a box to the sidebar on the right.
 * Returns the added box.
 * Modeled on Foxtrick.addBoxToSidebar.
 * @param  {document} doc
 * @param  {string}   title   the title of the box, will create one if inexists
 * @param  {element}  content HTML node of the content
 * @param  {number}   prec    precedence of the box, the smaller, the higher
 * @return {element}          box to be added to
 */
Foxtrick.Pages.Match.addBoxToSidebar = function(doc, title, content, prec) {
	if (this.isPrematch(doc))
		// redirect to old style in prematch
		return Foxtrick.addBoxToSidebar.apply(Foxtrick, arguments);

	var sidebar = doc.getElementsByClassName('reportHighlights')[0];
	if (!sidebar)
		return;

	// class of the box to add
	var boxClass = 'ft-newSidebarBox';

	// destination box
	var dest;

	// for some strange reason HTs do not wrap sidebar boxes in their own div
	// check for existing custom sidebar boxes only
	var boxes = sidebar.getElementsByClassName(boxClass);
	dest = Foxtrick.nth(function(box) {
		var h = box.querySelector('h4');
		return h.textContent == title;
	}, boxes);
	// create new box if old one doesn't exist
	if (!dest) {
		dest = doc.createElement('div');
		dest.className = boxClass;
		dest.setAttribute('x-precedence', prec);
		// boxHead
		var boxHead = doc.createElement('div');
		dest.appendChild(boxHead);
		// header
		var header = doc.createElement('h4');
		header.className = 'rightHandBoxHeader';
		header.textContent = title;
		boxHead.appendChild(header);
		// boxBody
		var boxBody = doc.createElement('div');
		boxBody.className = 'rightHandBoxBody';
		dest.appendChild(boxBody);
		// append content to boxBody
		boxBody.appendChild(content);

		// now we insert the newly created box
		var inserted = false;

		// since HT structure does not fit us
		// we need to handle top and bottom boxes separately

		// list of top boxes
		var topBoxes = Foxtrick.filter(function(box) {
			return parseInt(box.getAttribute('x-precedence'), 10) <= 0;
		}, boxes);
		// list of buttom boxes
		var bottomBoxes = Foxtrick.filter(function(box) {
			return parseInt(box.getAttribute('x-precedence'), 10) > 0;
		}, boxes);
		var insertBox = function(box) {
			// precedence of current box
			var curPrec = parseInt(box.getAttribute('x-precedence'), 10) || 0;
			if (curPrec > prec) {
				box.parentNode.insertBefore(dest, box);
				return true;
			}
			return false;
		};

		if (prec <= 0) {
			if (!topBoxes.length) {
				// first topBox, add up top
				sidebar.insertBefore(dest, sidebar.firstChild);
			}
			else {
				inserted = Foxtrick.any(insertBox, topBoxes);
				if (!inserted) {
					// insert after last top box
					var lastTopBox = topBoxes.pop();
					lastTopBox.parentNode.insertBefore(dest, lastTopBox.nextSibling);
				}
			}
			inserted = true;
		}
		else {
			inserted = Foxtrick.any(insertBox, bottomBoxes);
		}
		if (!inserted)
			sidebar.appendChild(dest);
	}

	// finally we add the content
	dest.getElementsByClassName('rightHandBoxBody')[0].appendChild(content);

	return dest;
};

/**
 * Modify player container in the lineup tab.
 * Calls func(playerDiv).
 * The right player is found with help of player links list.
 * @param  {number}   playerId
 * @param  {Function} func     function(element)
 * @param  {NodeList} links
 */
Foxtrick.Pages.Match.modPlayerDiv = function(playerId, func, links) {
	var link = Foxtrick.filter(function(link) {
		return new RegExp(playerId).test(link.href);
	}, links)[0];
	if (link && typeof(func) == 'function')
		func(link.parentNode.parentNode);
};

/**
 * Parse and return playerData object used by HT lineup utils.
 * Produces a list of player objects:
 * {ChartRatings, FirstName, LastName, NickName, PlayerId, ShirtNumber, SourcePlayerId}
 * @param  {document} doc
 * @return {array}        Array.<object>
 */
Foxtrick.Pages.Match.parsePlayerData = function(doc) {
	var playerData = null;
	try {
		var json = doc.querySelector('#matchdata [id$="lblPlayerData"]').textContent;
		playerData = JSON.parse(json);
	}
	catch (e) {
		Foxtrick.error('FAILED to parse player JSON', e);
	}
	return playerData;
};

/**
 * Get timeline data as an array of {min, sec}.
 * Each minute/event has input.hidden[id$="_time"][value="min.sec"]
 * @param  {document} doc
 * @return {array}        Array.<{min: number, sec: number}>
 */
Foxtrick.Pages.Match.getTimeline = function(doc) {
	var timeline = Foxtrick.map(function(el) {
		var time = el.value;
		return {
			min: parseInt(time.match(/^\d+/), 10),
			sec: parseInt(time.match(/\d+$/), 10)
		};
	}, doc.querySelectorAll('input[id$="_time"]'));
	return timeline;
};

/**
 * Get team ratings event by event.
 * Each minute has input.hidden[id$="_playerRatingsHome"][value="jsonArray"]
 * Returns an array of {players, source}.
 * Where source is the input element
 * and players is an array of Player objects
 * { Cards: 0,	FromMin: -1, InjuryLevel: 0, IsCaptain: false,
 * 	IsKicker: false, PlayerId: 360991810, PositionBehaviour: 0,
 * 	PositionID: 100, Stamina: 1, Stars: 3, ToMin: 90 }
 * @param  {document} doc
 * @param  {Boolean}  isHome
 * @return {array}           Array.<{players: Array.<object>, source: HTMLInputElement}>
 */
Foxtrick.Pages.Match.getTeamRatingsByEvent = function(doc, isHome) {
	var playerRatings = doc.querySelectorAll('input[id$="_playerRatings' +
											 (isHome ? 'Home' : 'Away') + '"]');
	var playerRatingsByEvent = Foxtrick.map(function(ratings) {
		return { players: JSON.parse(ratings.value), source: ratings };
	}, playerRatings);
	// keep playerRatingsByEvent[i].source as a pointer to the input
	// so that we know where to save
	return playerRatingsByEvent;
};

/**
 * Get event indices event by event.
 * doc.querySelectorAll('input[id$="_eventIndex"]') points to the report tab.
 * Returns an array of {eventIdx, idx}.
 * Where eventIdx is the event index in the report (xml),
 * used to match highlights (#matchEventIndex_ + eventIdx).
 * 5 minute updates have index=0, no event.
 * While idx is the timeline index (starts at 0, includes 5 minute updates)
 * @param  {document} doc
 * @return {array}        Array.<{eventIdx: number, idx: number}>
 */
Foxtrick.Pages.Match.getEventIndicesByEvent = function(doc) {
	var eventIndices = doc.querySelectorAll('input[id$="_eventIndex"]');
	var eventIndexByEvent = Foxtrick.map(function(index, i) {
		return { eventIdx: index.value, idx: i };
	}, eventIndices);
	return eventIndexByEvent;
};
