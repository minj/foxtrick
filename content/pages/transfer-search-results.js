/**
 * transfer-search-results.js
 * Utilities on transfer search results page
 * @author convincedd, ryanli
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	// @ts-ignore
	var Foxtrick = {};
/* eslint-enable */

if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.TransferSearchResults = {};

/**
 * Test whether it's transfer search results
 * @param  {document}  doc
 * @return {boolean}
 */
Foxtrick.Pages.TransferSearchResults.isPage = function(doc) {
	return Foxtrick.isPage(doc, 'transferSearchResult');
};

Foxtrick.Pages.TransferSearchResults.isNewDesign = (doc) => {
	let ret = false;
	let playerNodes = [...doc.querySelectorAll('.transferPlayerInfo')];
	if (playerNodes.length) {
		let [first] = playerNodes;
		ret = first.parentNode.parentNode != doc.getElementById('mainBody');
	}

	return ret;
};

/**
 * Get a list of player objects with the information in the result page.
 *
 * Keep in mind that not all info might be available (e.g. after deadline).
 *
 * @param  {document}      doc
 * @return {Array<Player>}     Array<Player>
 */
Foxtrick.Pages.TransferSearchResults.getPlayerList = function(doc) {
	var isNewDesign = this.isNewDesign(doc);

	/** @type {Map<number, HTMLTableRowElement>} */
	var htRows = null;

	if (isNewDesign) {
		/** @type {HTMLTableElement} */
		var htTable = doc.querySelector('#playersTable');

		if (htTable) {
			/** @type {NodeListOf<HTMLAnchorElement>} */
			let playerLinks = htTable.querySelectorAll('td[data-fullname] a');
			htRows = new Map([...playerLinks].map((link) => {
				let id = Foxtrick.getUrlParam(link.href, 'playerId');
				return [parseInt(id, 10), link.closest('tr')];
			}));
		}
	}

	/**
	 * @param {Player} player
	 */
	var parseHTTableRow = (player) => {
		let htRow = htRows.get(player.id);

		let cellClubWeeks = htRow.cells[9];
		let clubWeeks = parseInt(cellClubWeeks.textContent.trim(), 10);
		let daysInWeek = Foxtrick.util.time.DAYS_IN_WEEK;
		let joinedSince = Foxtrick.util.time.addDaysToDate(Date.now(), -clubWeeks * daysInWeek);
		Foxtrick.util.time.setMidnight(joinedSince);
		player.joinedSince = joinedSince;
	};

	/**
	 * @param {Player}  player
	 * @param {Element} pNode
	 */
	var parseSkills = (player, pNode) => {
		/** @type {(PlayerSkillName|'stamina')[]} */
		const SKILLS_OLD = [
			'stamina',
			'keeper',
			'playmaking',
			'passing',
			'winger',
			'defending',
			'scoring',
			'setPieces',
		];

		/** @type {PlayerSkillName[]} */
		const SKILLS_NEW = [
			'keeper',
			'defending',
			'playmaking',
			'winger',
			'passing',
			'scoring',
			'setPieces',
		];
		let skills = isNewDesign ? SKILLS_NEW : SKILLS_OLD;

		// right skill table - skills
		/** @type {HTMLTableElement} */
		let tbl = pNode.querySelector('.transferPlayerSkills table');

		/**
		 * @param  {number} idx
		 * @return {number}
		 */
		var getSkill = (idx) => {
			let mod = idx % 2;
			let mIdx = 1 + mod * 2;
			let dIdx = (idx - mod) / 2 + 1; // first is empty

			let cell = isNewDesign ? tbl.rows[idx].cells[1] : tbl.rows[dIdx].cells[mIdx];
			return cell ? Foxtrick.Pages.Player.getSkillLevel(cell) : null;
		};

		player.skills = {};
		for (let [idx, skill] of skills.entries()) {
			player[skill] = getSkill(idx);
			player.skills[skill] = player[skill];
		}

		let contributions = Foxtrick.Pages.Player.getContributions(player.skills, player);
		for (let name in contributions)
			player[name] = contributions[name];

		let bestPos = Foxtrick.Pages.Player.getBestPosition(contributions);
		if (bestPos.position) {
			player.bestPosition = Foxtrick.L10n.getString(bestPos.position + 'Position.abbr');
			player.bestPositionLong = Foxtrick.L10n.getString(bestPos.position + 'Position');
			player.bestPositionValue = bestPos.value;
		}

		let htms = pNode.querySelector('.ft-htms-points');
		if (htms) {
			player.htmsAbility = parseInt(htms.getAttribute('data-htms-ability'), 10);
			player.htmsPotential = parseInt(htms.getAttribute('data-htms-potential'), 10);
		}

		/** @type {HTMLElement} */
		let psico = pNode.querySelector('.ft-psico');
		if (psico) {
			player.psicoTSI = Number(psico.dataset.psicoAvg);
			player.psicoTitle = psico.dataset.psicoSkill;
			player.psicoWage = psico.dataset.psicoWage;
		}

		/** @type {HTMLElement} */
		let u21 = pNode.querySelector('.ft-u21lastmatch');
		if (u21) {
			let title = u21.textContent;
			let text = u21.dataset.valueString;
			let value = parseInt(u21.dataset.value, 10);
			player.u21 = { title, text, value };
		}

		/** @type {HTMLElement} */
		let mtStats = pNode.querySelector('.ft-mercattrick-stats');
		if (mtStats) {
			player.mtFilters = Number(mtStats.dataset.filters);
			player.mtBookmarks = Number(mtStats.dataset.bookmarks);
		}
	};

	/**
	 * @param {Player}  player
	 * @param {Element} pNode
	 * @param {string}  urlTmpl
	 */
	var addLinks = (player, pNode, urlTmpl) => {
		/** @type {HTMLAnchorElement} */
		let bookmarkLink = pNode.querySelector('.bookmarkSmall');
		if (bookmarkLink) {
			player.bookmarkLink = Foxtrick.cloneElement(bookmarkLink, true);
			player.bookmarkLink.target = '_blank';
		}

		/** @type {HTMLAnchorElement} */
		let hotlistLink = pNode.querySelector('a[href*="hotList"]');
		if (hotlistLink) {
			player.hotlistLink = Foxtrick.cloneElement(hotlistLink, true);
			player.hotlistLink.target = '_blank';
		}

		// playerstats
		let ps = doc.createElement('a');
		player.performanceHistory = ps;
		ps.target = '_blank';
		ps.title = Foxtrick.L10n.getString('PerformanceHistory');
		let pH = urlTmpl.replace('/Club/Players/Player.aspx', '/Club/Players/PlayerStats.aspx') +
			'&ShowAll=true';
		ps.href = pH;

		Foxtrick.addImage(doc, ps, {
			src: Foxtrick.InternalPath + 'resources/img/shortcuts/stats.png',
			alt: Foxtrick.L10n.getString('PerformanceHistory.abbr'),
			height: 16,
			'aria-label': ps.title,
		});

		let tc = doc.createElement('a');
		player.transferCompare = tc;
		tc.target = '_blank';
		tc.title = Foxtrick.L10n.getString('TransferCompare');
		tc.href =
			urlTmpl.replace('/Club/Players/Player.aspx', '/Club/Transfers/TransferCompare.aspx');

		let tcImg = doc.createElement('img');
		tcImg.height = 16;
		tcImg.src = '/App_Themes/Standard/images/ActionIcons/sell.png';
		tcImg.alt = Foxtrick.L10n.getString('TransferCompare.abbr');
		tcImg.setAttribute('aria-label', tc.title);
		tc.appendChild(tcImg);
	};

	/**
	 * @param {Player}  player
	 * @param {Element} bidContainer
	 */
	var parseBidInfo = (player, bidContainer) => {
		/** @type {HTMLElement} */
		var bid;

		/** @type {HTMLAnchorElement} */
		var bidderLink;
		if (isNewDesign) {
			/** @type {HTMLSpanElement} */
			let ddl = bidContainer.querySelector('span[id$="lblDeadline"]');
			if (ddl) {
				player.deadline = doc.createElement('td');
				player.deadline.dataset.isodate = ddl.dataset.isodate;
				player.deadline.appendChild(Foxtrick.cloneElement(ddl, true));
			}

			/** @type {NodeListOf<HTMLAnchorElement>} */
			let links = bidContainer.querySelectorAll('a[href*="?TeamID="i]');
			bidderLink = [...links].pop();

			let strongs = [...bidContainer.querySelectorAll('strong')];
			let bidStrong = strongs.pop();

			if (bidStrong) {
				bid = Foxtrick.cloneElement(bidStrong, true);
				let curCalc = bid.querySelector('.ft-dummy');
				if (curCalc)
					curCalc.remove();
			}
		}
		else {
			/** @type {NodeListOf<HTMLElement>} */
			let itemEls = bidContainer.querySelectorAll('.transferPlayerInfoItems');
			let items = [...itemEls].reverse();

			// search for first item with parenthesis
			// this indicates bidder / starting price
			let indices = Foxtrick.range(items.length);
			let idx = Foxtrick.nth(i => items[i].textContent.includes('('), indices);

			if (idx != null) {
				let [bidder, bidItem] = items.slice(idx);
				bidderLink = bidder.querySelector('a');
				bid = bidItem;
			}
		}

		if (bid)
			player.currentBid = Foxtrick.trimnum(bid.textContent);
		if (!bidderLink)
			return;

		let bidDesc = Foxtrick.L10n.getString('CurrentBidder');
		let link = Foxtrick.cloneElement(bidderLink, true);
		link.target = '_blank';

		let shortBidder = Foxtrick.cloneElement(link, true);
		shortBidder.textContent = '';
		shortBidder.title = bidDesc + ': ' + shortBidder.title;
		player.currentBidderLinkShort = shortBidder;

		link.title = bidDesc;
		player.currentBidderLink = link;

		let bidderImg = doc.createElement('img');
		bidderImg.height = 16;
		bidderImg.src = '/Img/Icons/dollar.gif';
		bidderImg.alt = link.textContent;
		bidderImg.setAttribute('aria-label', bidDesc);
		shortBidder.appendChild(bidderImg);
	};

	/**
	 * @param {Player}  player
	 * @param {Element} statusContainer
	 */
	/* eslint-disable complexity */
	var parseStatus = (player, statusContainer) => {
		player.redCard = 0;
		player.yellowCard = 0;
		player.bruised = false;
		player.injured = false;

		/** @type {NodeListOf<HTMLImageElement|HTMLElement|HTMLObjectElement>} */
		let icons = statusContainer.querySelectorAll('img, i, object');
		for (let icon of icons) {
			if (Foxtrick.hasClass(icon, 'cardsOne')) {
				if ('src' in icon && /red_card/i.test(icon.src))
					player.redCard = 1;
				else
					player.yellowCard = 1;
			}
			else if (Foxtrick.hasClass(icon, 'icon-red-card')) {
				player.redCard = 1;
			}
			else if (Foxtrick.hasClass(icon, 'icon-yellow-card')) {
				player.yellowCard = 1;
			}
			else if (Foxtrick.hasClass(icon, 'cardsTwo') ||
					 Foxtrick.hasClass(icon, 'icon-yellow-card-x2')) {
				player.yellowCard = 2;
			}
			else if (Foxtrick.any(cls => Foxtrick.hasClass(icon, cls),
			         ['injuryBruised', 'plaster', 'icon-plaster'])) {
				player.bruised = true;
			}
			else if (Foxtrick.hasClass(icon, 'injuryInjured') ||
					 Foxtrick.hasClass(icon, 'icon-injury')) {
				player.injured = true;

				// README: may contain infinity sign
				let lengthStr = icon.dataset.injuryLength || icon.nextSibling.textContent.trim();
				let length = parseFloat(lengthStr.replace(/\u221e/, 'Infinity'));
				if (!Number.isNaN(length))
					player.injuredWeeks = length;
			}
		}
	};
	/* eslint-enable complexity */

	/**
	 * @param {Player}  player
	 * @param {Element} attrContainer
	 * @param {HTMLTableElement} infoTable
	 */
	// eslint-disable-next-line complexity
	var parseAttributes = (player, attrContainer, infoTable) => {
		const ATTRIBUTES = ['experience', 'leadership', 'form'];
		if (isNewDesign)
			ATTRIBUTES.pop();

		let links = attrContainer.getElementsByTagName('a');
		for (let [idx, attr] of ATTRIBUTES.entries())
			player[attr] = Foxtrick.util.id.getSkillLevelFromLink(links[idx]);

		const ROWS = isNewDesign ?
			['owner', 'age', 'tsi', 'salary', 'specialty', 'form', 'stamina'] :
			['owner', 'age', 'tsi', 'specialty', 'deadline'];

		let cells = {}, texts = {};
		for (let [idx, row] of ROWS.entries()) {
			cells[row] = infoTable.rows[idx].cells[1];
			texts[row] = cells[row].textContent.trim();
		}

		player.currentClubLink = Foxtrick.cloneElement(cells.owner.querySelector('a'), true);
		player.tsi = Foxtrick.trimnum(texts.tsi);

		player.specialty = texts.specialty == '-' ? '' : texts.specialty;
		player.specialtyNumber = Foxtrick.L10n.getNumberFromSpecialty(player.specialty);

		if (cells.salary) {
			let salary = Foxtrick.cloneElement(cells.salary, true), cConverter;
			if ((cConverter = salary.querySelector('.ft-dummy')))
				cConverter.remove();

			player.salary = Foxtrick.trimnum(salary.textContent);
			let span = salary.querySelector('span');
			if (span && span.hasAttribute('title')) {
				let title = span.title.replace(/\d+\s*%/, '');
				player.salaryBase = Foxtrick.trimnum(title);
				player.isAbroad = true;
			}
			else {
				player.salaryBase = player.salary;
				player.isAbroad = false;
			}
		}

		if (cells.form)
			player.form = Foxtrick.Pages.Player.getSkillLevel(cells.form);

		if (cells.stamina)
			player.stamina = Foxtrick.Pages.Player.getSkillLevel(cells.stamina);

		if (cells.deadline)
			player.deadline = Foxtrick.cloneElement(cells.deadline, true);

		player.ageText = texts.age;
		let [yearsStr, daysStr] = player.ageText.match(/(\d+)/g);
		let years = parseInt(yearsStr, 10);
		let days = parseInt(daysStr, 10);
		player.ageYears = years;
		player.age = { years, days };
	};

	/**
	 * @param  {HTMLElement} playerNode
	 * @return {Player}
	 */
	var parsePlayer = (playerNode) => {
		/** @type {Partial<Player>} */
		let player = { playerNode };
		var p = /** @type {Player} */ (player);

		try {
			// first row - country, name, ID
			/** @type {HTMLAnchorElement} */
			let nameLink = playerNode.querySelector('.transfer_search_playername a');
			if (nameLink) {
				p.id = Number(Foxtrick.getUrlParam(nameLink.href, 'playerId'));
				p.nameLink = Foxtrick.cloneElement(nameLink, true);
				p.nameLink.target = '_blank';
				addLinks(p, playerNode, nameLink.href);
			}

			/** @type {HTMLAnchorElement} */
			let flag = playerNode.querySelector('.flag');
			if (flag) {
				let leagueId = Number(Foxtrick.getUrlParam(flag.href, 'leagueId'));
				p.countryId = Foxtrick.XMLData.getCountryIdByLeagueId(leagueId);
			}

			let [first, second] = playerNode.children;
			parseStatus(p, first);

			let bidDiv = isNewDesign && second
				? second.querySelector('div[id$="updFastBid"]')
				: first;
			if (bidDiv)
				parseBidInfo(p, bidDiv);

			// check if the player is sold
			// if he is, the following info
			// are not available and we return
			let attrContSel = isNewDesign ? 'p' : '.transferPlayerCharacteristics';
			let attrContainer = playerNode.querySelector(attrContSel);
			if (attrContainer) {
				/** @type {HTMLTableElement} */
				let infoTable = playerNode.querySelector('.transferPlayerInformation table');
				parseAttributes(p, attrContainer, infoTable);
				parseSkills(p, playerNode);
			}

			if (htRows)
				parseHTTableRow(p);
		}
		catch (e) {
			Foxtrick.log(e);
		}

		// return player even if we've encountered a problem
		return p;
	};

	/** @type {NodeListOf<HTMLElement>} */
	let tInfos = doc.querySelectorAll('.transferPlayerInfo');
	let playerNodes = [...tInfos];
	if (isNewDesign)
		playerNodes = playerNodes.map(p => p.parentElement.parentElement);

	return playerNodes.map(parsePlayer);
};
