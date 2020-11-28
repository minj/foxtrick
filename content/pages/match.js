/**
 * match.js
 * utilities on match page
 * @author taised, Jestar, LA-MJ
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	// @ts-ignore
	var Foxtrick = {};
/* eslint-enable */

if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.Match = {};

/**
 * Get team links
 * @param  {document} doc
 * @return {[HTMLElement, HTMLElement]}
 */
Foxtrick.Pages.Match.getTeams = function(doc) {
	var container;
	if (Foxtrick.isPage(doc, 'matchesLive')) {
		container = doc.querySelector('.rtsSelected .liveTabText');
		if (!container) {
			// no match open
			return [null, null];
		}
	}
	else {
		container = doc.querySelector('#mainBody h1');
	}
	return [container.querySelector('.hometeam'), container.querySelector('.awayteam')];
};

/**
 * Get home team link
 * @param  {document}          doc
 * @return {HTMLAnchorElement}
 */
Foxtrick.Pages.Match.getHomeTeam = function(doc) {
	let container;
	if (Foxtrick.isPage(doc, 'matchesLive')) {
		container = doc.querySelector('.rtsSelected .liveTabText');
		if (!container) {
			// no match open
			return null;
		}
	}
	else {
		container = doc.querySelector('#mainBody h1');
	}

	if (container)
		return container.querySelector('.hometeam');

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let teams = doc.querySelectorAll('.live-scoreboard-teamname');
	let [home, _away] = teams;

	return home;
};

/**
 * Get away team link
 * @param  {document}          doc
 * @return {HTMLAnchorElement}
 */
Foxtrick.Pages.Match.getAwayTeam = function(doc) {
	var container;
	if (Foxtrick.isPage(doc, 'matchesLive')) {
		container = doc.querySelector('.rtsSelected .liveTabText');
		if (!container) {
			// no match open
			return null;
		}
	}
	else {
		container = doc.querySelector('#mainBody h1');
	}

	if (container)
		return container.querySelector('.awayteam');

	/** @type {NodeListOf<HTMLAnchorElement>} */
	let teams = doc.querySelectorAll('.live-scoreboard-teamname');
	let [_home, away] = teams;

	return away;

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
 * Get away team ID
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.Match.getAwayTeamId = function(doc) {
	var team = this.getAwayTeam(doc);
	return team && team.href ? Foxtrick.util.id.getTeamIdFromUrl(team.href) : null;
};

/**
 * Get team ID belonging to user's team.
 *
 * Mostly suited for matchOrder page.
 * May be youth or NT team ID.
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.Match.getMyTeamId = function(doc) {
	if (Foxtrick.isPage(doc, 'matchOrder')) {
		if (!this.isYouth(doc)) {
			// URL id is not really reliable: it might be completely wrong or missing
			// alas it is the only place to find NT team ID
			var urlId = Foxtrick.util.id.getTeamIdFromUrl(doc.location.href); // NT
			if (Foxtrick.util.id.isNTId(urlId))
				return urlId;
		}

		var crumbs = Foxtrick.Pages.All.getBreadCrumbs(doc);
		var crumbId = Foxtrick.util.id.getTeamIdFromUrl(crumbs[0].href);
		if (crumbId)
			return crumbId;
	}
	return Foxtrick.util.id.getOwnTeamId();
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
 * Get away team name
 * @param  {document} doc
 * @return {string}
 */
Foxtrick.Pages.Match.getAwayTeamName = function(doc) {
	var team = this.getAwayTeam(doc);
	return team ? team.textContent : null;
};

/**
 * Get the game result as an array [home, away]
 * @param  {document} doc
 * @return {number[]}        {Array.<number>}
 */
Foxtrick.Pages.Match.getResult = function(doc) {
	var isLive = Foxtrick.isPage(doc, 'matchesLive');
	var score;
	if (isLive) {
		score = doc.querySelector('.rtsSelected .liveTabScore');
		if (!score) {
			// no match open
			return null;
		}
	}
	else {
		score = doc.querySelector('#mainBody h1 [class="notByLine"]');
	}
	var match = score.textContent.trim().match(/^(\d+) - (\d+)$/);
	var goals = Foxtrick.toArray(match).slice(1);
	var ret = goals.map(s => parseInt(s, 10));

	if (!isLive && Foxtrick.util.layout.isRtl(doc))
		ret.reverse();
	return ret;
};

/**
 * Test whether match has not started
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Match.isPrematch = function(doc) {
	return this.getPreMatchPanel(doc) !== null;
};

/**
 * Test whether match report has advanced ratings
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Match.hasRatingsTabs = function(doc) {
	/** @type {HTMLElement} */
	var lineupTab = doc.querySelector('#mainBody .tab2');

	return !!(lineupTab && lineupTab.style.display != 'none');
};

/**
 * Test whether match report has a valid timeline
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Match.hasTimeline = function(doc) {
	var timeline = doc.getElementById('timeline');
	return timeline && !Foxtrick.hasClass(timeline, 'hidden');
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
 * @return {boolean}
 */
Foxtrick.Pages.Match.isYouth = function(doc) {
	return /isYouth=true|SourceSystem=Youth/i.test(doc.location.search);
};

/**
 * Test whether it's an HTO match
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Match.isHTOIntegrated = function(doc) {
	return /SourceSystem=HTOIntegrated/i.test(doc.location.search);
};

/**
 * Test whether it's an NT match
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Match.isNT = function(doc) {
	var homeId = this.getHomeTeamId(doc);
	var awayId = this.getAwayTeamId(doc);
	return homeId && Foxtrick.util.id.isNTId(homeId) &&
		awayId && Foxtrick.util.id.isNTId(awayId) || false;
};

/**
 * Get match ID
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.Match.getId = function(doc) {
	let url;
	if (Foxtrick.isPage(doc, 'matchesLive')) {
		/** @type {HTMLAnchorElement} */
		let link = doc.querySelector('.liveResult a');
		if (!link)
			return null;

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
	let date = doc.querySelector('.date');
	return Foxtrick.util.time.getDateFromText(date.textContent);
};

/**
 * Get the ArenaID where the match took place
 * @param  {document} doc
 * @return {number}       {?number}
 */
Foxtrick.Pages.Match.getArenaId = function(doc) {
	var arenaId = null;
	try {
		var matchReport = doc.getElementById('matchReport');

		/** @type {HTMLAnchorElement} */
		var arena = matchReport.querySelector('a[href^="/Club/Arena/"]');
		arenaId = parseInt(Foxtrick.getUrlParam(arena.href, 'ArenaID'), 10);
	}
	catch (e) {
		Foxtrick.log(e);
	}
	return arenaId;
};

/**
 * Test whether match is in progress
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Match.inProgress = function(doc) {
	var matchStatus = Foxtrick.getMBElement(doc, 'lblMatchStatus');
	return matchStatus !== null && matchStatus.textContent.trim() !== '' ||
		!!doc.querySelector('img.matchHTLive');
};

/**
 * Test whether match is played in neutral grounds
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Match.isNeutral = function(doc) {
	var neutralEvent = doc.querySelector('#matchReport span[data-eventtype^="26_"]');
	return neutralEvent !== null;
};

/**
 * Test whether match is a league match
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Match.isLeague = function(doc) {
	var mainBody = doc.getElementById('mainBody');
	var isLeague = mainBody.getElementsByClassName('matchLeague').length > 0;
	return isLeague;
};

/**
 * Test whether match is a qualification match
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Match.isQualification = function(doc) {
	var mainBody = doc.getElementById('mainBody');
	var isQualification = mainBody.getElementsByClassName('matchQualification').length > 0;
	return isQualification;
};

/**
 * Test whether match is a cup match
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Match.isCup = function(doc) {
	var mainBody = doc.getElementById('mainBody');
	var isCup = mainBody.querySelectorAll('*[class^="matchCup"]').length > 0;
	return isCup;
};

/**
 * Test whether match is a friendly match
 * @param  {document} doc
 * @return {boolean}
 */
Foxtrick.Pages.Match.isFriendly = function(doc) {
	var mainBody = doc.getElementById('mainBody');
	var isFriendly = mainBody.getElementsByClassName('matchFriendly').length > 0;
	return isFriendly;
};

/**
 * Get ratings table
 * @param  {document} doc
 * @return {HTMLTableElement}
 */
Foxtrick.Pages.Match.getRatingsTable = function(doc) {
	return doc.querySelector('.teamMatchRatingsTable table');
};

/**
 * Test whether ratings table has indirect SP info
 * @param  {HTMLTableElement} ratingstable
 * @return {boolean}
 */
Foxtrick.Pages.Match.hasIndSetPieces = function(ratingstable) {
	// either iSP level link in that cell or for old matches tactic=no link
	return ratingstable.rows.length > 10 && ratingstable.rows[10].cells.length > 1 &&
		ratingstable.rows[10].cells[1].getElementsByTagName('a').length > 0;
};

/**
 * Test whether match is a walkover
 * @param  {HTMLTableElement} ratingstable
 * @return {boolean}
 */
Foxtrick.Pages.Match.isWalkOver = function(ratingstable) {
	try {
		// eslint-disable-next-line no-magic-numbers
		for (var i = 1; i <= 7; i++) {
			// eslint-disable-next-line no-magic-numbers
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
 * Returns an array map where first Element is home team, away second:
 * {mf, rd, cd, ld, ra, ca, la}
 * @param  {HTMLTableElement} ratingstable
 * @return {object}                        Object.<string, Array.<number>>
 */
Foxtrick.Pages.Match.getRatingsByTeam = function(ratingstable) {
	var getRatingFromCell = function([row, col]) {
		let cell = ratingstable.rows[row].cells[col];
		return Foxtrick.Math.hsToFloat(cell.textContent);
	};
	var ratings = {};

	// rows 1-7 contain numeric data (columns 3-4) for both team ratings in this order:
	let order = ['mf', 'rd', 'cd', 'ld', 'ra', 'ca', 'la'];
	const HOME_IDX = 3, AWAY_IDX = 4;
	try {
		for (let i of Foxtrick.range(1, order.length + 1))
			ratings[order[i - 1]] = Foxtrick.map(getRatingFromCell, [[i, HOME_IDX], [i, AWAY_IDX]]);
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
	let basevalue = 0;
	let tacticsLink = cell.querySelector('a');
	if (tacticsLink)
		basevalue = Foxtrick.util.id.getSkillLevelFromLink(tacticsLink.href);

	return basevalue;
};

/**
 * Get tactics type from a tactics cell.
 * Returns one of normal, pressing, ca, aim, aow, creatively, longshots
 * @param  {HTMLTableCellElement} cell
 * @return {string}
 */
Foxtrick.Pages.Match.getTacticsFromCell = function(cell) {
	let tactics = cell.textContent.trim();
	let lang = Foxtrick.Prefs.getString('htLanguage');

	try {
		let category = Foxtrick.L10n.htLanguagesJSON[lang].language.tactics;
		let subLevelValue = Foxtrick.nth(function(item) {
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
	let tacticRow = 10, levelRow = 11;
	if (this.hasIndSetPieces(ratingstable)) {
		// eslint-disable-next-line no-magic-numbers
		tacticRow = 14;
		// eslint-disable-next-line no-magic-numbers
		levelRow = 15;
	}
	let tactics = [
		this.getTacticsFromCell(ratingstable.rows[tacticRow].cells[1]),
		this.getTacticsFromCell(ratingstable.rows[tacticRow].cells[2]),
	];
	let level = [
		parseInt(ratingstable.rows[levelRow].cells[3].textContent, 10) || 0,
		parseInt(ratingstable.rows[levelRow].cells[4].textContent, 10) || 0,
	];
	return { tactics, level };
};

// START NEW RATINGS UTILS

/**
 * Add a listener to changes on HT-Live page.
 * Calls callback(document) on mutation.
 * Cannot use subtree: true on the container because
 * change() would execute every second in FF.
 * This is because the match timer triggers childList changes in FF.
 * @param {document} doc
 * @param {Function} callback function(document)
 */
Foxtrick.Pages.Match.addLiveListener = function(doc, callback) {
	var safeCallback = function(doc) {
		try {
			callback(doc);
			return;
		}
		catch (e) {
			Foxtrick.log('Uncaught exception in callback', e);
		}
	};

	// start everything onLoad
	safeCallback(doc);
	var liveContainer = this.getLiveContainer(doc);
	if (liveContainer) {
		// this is the smallest container that contains overview OR match view
		Foxtrick.onChange(liveContainer, safeCallback, { subtree: false });
	}
};


/**
 * Add a listener to changes of tabId in HT-Live matches.
 * Calls callback(doc) on mutation.
 * Registers a chain of MOs to by-pass the Live timer.
 * Cannot use subtree: true on the container because
 * change() would execute every second in FF.
 * This is because the match timer triggers childList changes in FF.
 * @param {document} doc
 * @param {string}   tabId    Element to listen to
 * @param {Function} callback function(document)
 */
Foxtrick.Pages.Match.addLiveTabListener = function(doc, tabId, callback) {
	var safeCallback = function(doc) {
		try {
			callback(doc);
			return;
		}
		catch (e) {
			Foxtrick.log('Uncaught exception in callback', e);
		}
	};
	var registerTab = function(doc) {
		safeCallback(doc);
		var target = doc.getElementById(tabId);
		if (target) {
			// found the right tab
			Foxtrick.onChange(target, safeCallback);
		}
	};
	var registerMatch = function(doc) {
		registerTab(doc);
		var target = Foxtrick.getMBElement(doc, 'phLiveStatusPanel');
		if (target) {
			// found match view
			Foxtrick.onChange(target, registerTab, { subtree: false });
		}
	};

	// start everything onLoad
	registerMatch(doc);
	var liveContainer = this.getLiveContainer(doc);
	if (liveContainer) {
		// this is the smallest container that contains overview OR match view
		Foxtrick.onChange(liveContainer, registerMatch, { subtree: false });
	}
};

/**
 * Add a listener to changes of HT-Live overview.
 * Calls callback(overview) on mutation.
 * Cannot use subtree: true on the container because
 * change() would execute every second in FF.
 * This is because the match timer triggers childList changes in FF.
 * @param {document} doc
 * @param {Function} callback function(HTMLElement)
 */
Foxtrick.Pages.Match.addLiveOverviewListener = function(doc, callback) {
	var safeCallback = function(overview) {
		try {
			callback(overview);
			return;
		}
		catch (e) {
			Foxtrick.log('Uncaught exception in callback', e);
		}
	};

	var findOverview = function(doc) {
		var overview = Foxtrick.getMBElement(doc, 'repM');
		if (overview)
			safeCallback(overview);
	};

	// start everything onLoad
	findOverview(doc);
	var liveContainer = this.getLiveContainer(doc);
	if (liveContainer) {
		// this is the smallest container that contains overview OR match view
		Foxtrick.onChange(liveContainer, findOverview, { subtree: false });
	}
};


/**
 * Add a box to the sidebar on the right.
 * Returns the added box.
 * Modeled on Foxtrick.addBoxToSidebar.
 * @param  {document} doc
 * @param  {string}   title   the title of the box, will create one if inexists
 * @param  {Element}  content HTML node of the content
 * @param  {number}   prec    precedence of the box, the smaller, the higher
 * @return {Element}          box to be added to
 */
Foxtrick.Pages.Match.addBoxToSidebar = function(doc, title, content, prec) {
	if (this.isPrematch(doc)) {
		// redirect to old style in prematch
		return Foxtrick.addBoxToSidebar(doc, title, content, prec);
	}

	var sidebar = doc.getElementsByClassName('reportHighlights')[0];
	if (!sidebar)
		return null;

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
		dest.setAttribute('x-precedence', String(prec));

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
			if (topBoxes.length) {
				inserted = Foxtrick.any(insertBox, topBoxes);
				if (!inserted) {
					// insert after last top box
					let lastTopBox = topBoxes.pop();
					lastTopBox.parentNode.insertBefore(dest, lastTopBox.nextSibling);
				}
			}
			else {
				// first topBox, add up top
				sidebar.insertBefore(dest, sidebar.firstChild);
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
 * @param  {number}                        playerId
 * @param  {function(HTMLElement):void} func     function(Element)
 * @param  {ArrayLike<HTMLAnchorElement>}  links
 */
Foxtrick.Pages.Match.modPlayerDiv = function(playerId, func, links) {
	if (!playerId)
		return;

	var link = Foxtrick.nth(function(link) {
		return new RegExp(String(playerId)).test(link.href);
	}, links);

	if (link && typeof func == 'function') {
		let div = link.parentElement.parentElement;
		func(div);
	}
};

/**
 * Make the player avatar and append it to shirtDiv
 * @param  {Element} shirtDiv
 * @param  {Element} avatarXml
 * @param  {number} scale
 */
Foxtrick.Pages.Match.makeAvatar = function(shirtDiv, avatarXml, scale) {
	var doc = shirtDiv.ownerDocument;

	/* eslint-disable no-magic-numbers */
	var sizes = {
		backgrounds: [0, 0], // don't show
		kits: [92, 123],
		bodies: [92, 123],
		faces: [92, 123],
		eyes: [60, 60],
		mouths: [50, 50],
		goatees: [70, 70],
		noses: [70, 70],
		hair: [92, 123],
		misc: [0, 0], // don't show (eg cards)
	};
	var sizesOld = {
		backgrounds: [0, 0], // don't show
		faces: [47, 49],
		eyes: [47, 49],
		mouths: [47, 49],
		noses: [47, 49],
		hair: [47, 49],
		misc: [0, 0], // don't show (eg cards)
	};
	/* eslint-enable no-magic-numbers */

	const oldFaces = Foxtrick.Prefs.isModuleEnabled('OldStyleFace');
	const FACTOR = oldFaces ? 1 : scale;
	const SZ = oldFaces ? sizesOld : sizes;

	let xml = /** @type {CHPPXML} */ (avatarXml.ownerDocument);
	let layers = avatarXml.getElementsByTagName('Layer');
	for (let layer of layers) {
		let src = xml.text('Image', layer);
		let bodypart;
		for (bodypart in SZ) {
			if (src.search(bodypart) != -1)
				break;
		}
		if (!bodypart)
			continue;

		/** @type {number[]} */
		let sizes = SZ[bodypart];
		let [width, height] = sizes.map(s => Math.round(s / FACTOR));

		let styleString = '';
		if (!oldFaces) {
			let x = Math.round(parseInt(layer.getAttribute('x'), 10) / FACTOR);
			let y = Math.round(parseInt(layer.getAttribute('y'), 10) / FACTOR);
			styleString = 'top:' + y + 'px;left:' + x + 'px;position:absolute;';
		}

		if (Foxtrick.Prefs.isModuleOptionEnabled('OriginalFace', 'ColouredYouth'))
			src = src.replace(/y_/, '');

		// use protocol agnostic URLs
		src = src.replace(/^https?:/, '');

		let img = doc.createElement('img');
		img.setAttribute('style', styleString);
		img.src = src;
		img.width = width;
		img.height = height;
		shirtDiv.appendChild(img);
	}
};

/**
 * @typedef HTMatchReportPlayerData
 * @prop {number} PlayerId
 * @prop {number} SourcePlayerId
 * @prop {number} ShirtNumber
 * @prop {string} FirstName
 * @prop {string} LastName
 * @prop {string} NickName
 * @prop {string} ChartRatings JSON.strinfify([minute, stars][][])
 */

/**
 * Parse and return playerData object used by HT lineup utils.
 * Produces a list of player objects:
 * {ChartRatings, FirstName, LastName, NickName, PlayerId, ShirtNumber, SourcePlayerId}
 * @param  {document} doc
 * @return {HTMatchReportPlayerData[]} Array.<object>
 */
Foxtrick.Pages.Match.parsePlayerData = function(doc) {
	var playerData = null;
	try {
		var json = doc.querySelector('#matchdata [id$="lblPlayerData"]').textContent;
		playerData = /** @type {HTMatchReportPlayerData[]} */ (JSON.parse(json));
	}
	catch (e) {
		Foxtrick.log(new Error('FAILED to parse player JSON: ' + e));
	}
	return playerData;
};

/**
 * Get timeline data as an array of {min, sec}.
 * Each minute/event has input.hidden[id$="_time"][value="min.sec"]
 * @param  {document} doc
 * @return {{min: number, sec: number}[]}
 */
Foxtrick.Pages.Match.getTimeline = function(doc) {
	/** @type {NodeListOf<HTMLInputElement>} */
	let inputs = doc.querySelectorAll('input[id$="_time"]');
	let timeline = Foxtrick.map(function(el) {
		let time = el.value;
		return {
			min: parseInt(String(time.match(/^\d+/)), 10),
			sec: parseInt(String(time.match(/\d+$/)), 10),
		};
	}, inputs);

	timeline.unshift({ min: -1, sec: 0 });
	return timeline;
};

/**
 * @typedef HTMatchReportRatingPlayer
 * @prop {number} PlayerId
 * @prop {number} ftIdx] our expando
 * @prop {number} FromMin
 * @prop {number} ToMin
 * @prop {number} PositionID
 * @prop {number} PositionBehaviour
 * @prop {number} Stars
 * @prop {number} Stamina
 * @prop {number} InjuryLevel
 * @prop {number} Cards
 * @prop {boolean} IsCaptain
 * @prop {boolean} IsKicker
 */

/**
 * @typedef MatchEventRatings
 * @prop {HTMatchReportRatingPlayer[]} players
 * @prop {HTMLInputElement} source
 */

/**
 * Get team ratings event by event.
 * Each minute has input.hidden[id$="_playerRatingsHome"][value="jsonArray"]
 * Returns an array of {players, source}.
 * Where source is the input Element
 * and players is an array of Player objects
 * { Cards: 0,	FromMin: -1, InjuryLevel: 0, IsCaptain: false,
 * 	IsKicker: false, PlayerId: 360991810, PositionBehaviour: 0,
 * 	PositionID: 100, Stamina: 1, Stars: 3, ToMin: 90 }
 * @param  {document} doc
 * @param  {boolean}  isHome
 * @return {MatchEventRatings[]} Array.<{players: Array.<object>, source: HTMLInputElement}>
 */
Foxtrick.Pages.Match.getTeamRatingsByEvent = function(doc, isHome) {
	/** @type {NodeListOf<HTMLInputElement>} */
	let playerRatings =
		doc.querySelectorAll(`input[id$="_playerRatings${isHome ? 'Home' : 'Away'}"]`);

	let playerRatingsByEvent = Foxtrick.map(function(ratings) {
		let players = /** @type {HTMatchReportRatingPlayer[]} */ (JSON.parse(ratings.value));
		return { players, source: ratings };
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
 * While idx is the timeline index (starts at average, includes 5 minute updates)
 * @param  {document} doc
 * @return {{ eventIdx: number, idx: number }[]}
 */
Foxtrick.Pages.Match.getEventIndicesByEvent = function(doc) {
	/** @type {NodeListOf<HTMLInputElement>} */
	let eventIndices = doc.querySelectorAll('input[id$="_eventIndex"]');

	let eventIndexByEvent = Foxtrick.map(function(index) {
		return { eventIdx: parseInt(index.value, 10), idx: -1 };
	}, eventIndices);
	eventIndexByEvent.unshift({ eventIdx: -1, idx: 0 }); // timeline average

	Foxtrick.forEach(function(evnt, i) {
		evnt.idx = i;
	}, eventIndexByEvent);
	return eventIndexByEvent;
};

/**
 * Get event types event by event.
 * Returns an array of {type, idx}.
 * Where type is event type ID;
 * Where idx is the timeline index (starts at average, includes 5 minute updates).
 * @param  {document} doc
 * @return {{ type: number, idx: number }[]}
 */
Foxtrick.Pages.Match.getEventTypesByEvent = function(doc) {
	/** @type {NodeListOf<HTMLInputElement>} */
	let timelineEvents = doc.querySelectorAll('input[id$="_timelineEventType"]');

	let tEventTypeByEvent = Foxtrick.map(function(evTypeEl) {
		return { type: parseInt(evTypeEl.value, 10), idx: -1 };
	}, timelineEvents);
	tEventTypeByEvent.unshift({ type: -1, idx: 0 }); // timeline average

	Foxtrick.forEach(function(evnt, i) {
		evnt.idx = i;
	}, tEventTypeByEvent);
	return tEventTypeByEvent;
};

/**
 * Test whether this is the new HT-Live view
 * @param  {document}  doc
 * @return {boolean}
 */
Foxtrick.Pages.Match.isNewLive = function(doc) {
	return !!doc.getElementById('ngLive');
};

/**
 * Get the smallest OLD HT-Live container that includes
 * both the single match view and the match list view
 * @param  {document} doc
 * @return {Element}
 */
Foxtrick.Pages.Match.getLiveContainer = function(doc) {
	return Foxtrick.getMBElement(doc, 'UpdatePanelMatch');
};

/**
 * Get the pre-match panel that contains tabs for Head-To-Head,
 * stadium, fans, referee info, etc
 * @param  {document} doc
 * @return {Element}
 */
Foxtrick.Pages.Match.getPreMatchPanel = function(doc) {
	return Foxtrick.getMBElement(doc, 'pnlPreMatch') || doc.querySelector('.match-h2h');
};

/**
 * Get the pre-match container with team summary (coach, fans, etc)
 * @param  {document} doc
 * @return {Element}
 */
Foxtrick.Pages.Match.getPreMatchSummary = function(doc) {
	return Foxtrick.getMBElement(doc, 'pnlTeamInfo') || doc.querySelector('.match-h2h');
};

/**
 * Get the arena flash container
 * @param  {document} doc
 * @return {Element}
 */
Foxtrick.Pages.Match.getArenaContainer = function(doc) {
	return Foxtrick.getMBElement(doc, 'pnlArenaFlash');
};

/**
 * Get tabs from the match report
 * @param  {document} doc
 * @return {Element}
 */
Foxtrick.Pages.Match.getReportTabs = function(doc) {
	return Foxtrick.getMBElement(doc, 'ucMatchTabs_ulTabs');
};
