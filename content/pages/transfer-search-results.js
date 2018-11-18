/**
 * transfer-search-results.js
 * Utilities on transfer search results page
 * @author convincedd, ryanli
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	var Foxtrick = {};
/* eslint-enable */

if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.TransferSearchResults = {};

/**
 * Test whether it's transfer search results
 * @param  {document}  doc
 * @return {Boolean}
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
	var isNewDesign = false;

	let parseSkills = (player, pNode) => {
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
		let tbl = pNode.querySelector('.transferPlayerSkills table');
		let getSkill = (idx) => {
			let mod = idx % 2;
			let mIdx = 1 + mod * 2;
			let dIdx = (idx - mod) / 2 + 1; // first is empty

			let cell = isNewDesign ? tbl.rows[idx].cells[1] : tbl.rows[dIdx].cells[mIdx];
			return Foxtrick.Pages.Player.getSkillLevel(cell);
		};

		for (let [idx, skill] of skills.entries()) {
			player[skill] = getSkill(idx);
			player.skills[skill] = player[skill];
		}

		let contributions = Foxtrick.Pages.Player.getContributions(player.skills, player);
		for (let name in contributions)
			player[name] = contributions[name];

		let bestPos = Foxtrick.Pages.Player.getBestPosition(contributions);
		player.bestPosition = Foxtrick.L10n.getString(bestPos.position + 'Position.abbr');
		player.bestPositionLong = Foxtrick.L10n.getString(bestPos.position + 'Position');
		player.bestPositionValue = bestPos.value;

		let htms = pNode.querySelector('.ft-htms-points');
		if (htms) {
			player.htmsAbility = parseInt(htms.getAttribute('data-htms-ability'), 10);
			player.htmsPotential = parseInt(htms.getAttribute('data-htms-potential'), 10);
		}

		let psico = pNode.querySelector('.ft-psico');
		if (psico) {
			let psicoTSI = psico.getAttribute('data-psico-avg');
			let psicoTitle = psico.getAttribute('data-psico-skill');
			player.psicoTSI = psicoTSI;
			player.psicoTitle = psicoTitle;
		}
	};

	let addLinks = (player, pNode, urlTmpl) => {
		let bookmarkLink = pNode.querySelector('.bookmarkSmall');
		if (bookmarkLink) {
			player.bookmarkLink = bookmarkLink.cloneNode(true);
			player.bookmarkLink.target = '_blank';
		}

		let hotlistLink = pNode.querySelector('a[href*="hotList"]');
		if (hotlistLink) {
			player.hotlistLink = hotlistLink.cloneNode(true);
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

	let parseBidInfo = (player, bidContainer) => {
		var bid, bidderLink;
		if (isNewDesign) {
			let ddl = bidContainer.querySelector('span[id$="lblDeadline"]');
			player.deadline = doc.createElement('td');
			player.deadline.dataset.isodate = ddl.dataset.isodate;
			player.deadline.appendChild(ddl.cloneNode(true));

			let links = [...bidContainer.querySelectorAll('a[href]')];
			bidderLink = links.pop();

			let strongs = [...bidContainer.querySelectorAll('strong')];
			bid = strongs.pop().cloneNode(true);
			let curCalc = bid.querySelector('.ft-dummy');
			if (curCalc)
				curCalc.remove();
		}
		else {
			let items = [...bidContainer.querySelectorAll('.transferPlayerInfoItems')].reverse();
			items.shift(); // skip hot-list

			let [bidder, bidItem] = items;
			bidderLink = bidder.querySelector('a');
			bid = bidItem;
		}

		player.currentBid = Foxtrick.trimnum(bid.textContent);
		if (!bidderLink)
			return;

		let bidDesc = Foxtrick.L10n.getString('CurrentBidder');
		let link = bidderLink.cloneNode(true);
		link.target = '_blank';

		let shortBidder = link.cloneNode(true);
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

	/* eslint-disable complexity */
	let parseStatus = (player, statusContainer) => {
		player.redCard = 0;
		player.yellowCard = 0;
		player.bruised = false;
		player.injured = false;

		let icons = statusContainer.querySelectorAll('img, i, object');
		for (let icon of icons) {
			if (Foxtrick.hasClass(icon, 'cardsOne')) {
				if (/red_card/i.test(icon.src))
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
				let lengthStr = icon.dataset.injuryLength || icon.nextSibling.textContent;
				let length = lengthStr.replace(/\u221e/, 'Infinity');
				player.injuredWeeks = parseInt(length, 10) || length;
			}
		}
	};
	/* eslint-enable complexity */

	let parseAttributes = (player, attrContainer, infoTable) => {
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

		player.currentClubLink = cells.owner.querySelector('a').cloneNode(true);
		player.tsi = Foxtrick.trimnum(texts.tsi);

		player.specialty = texts.specialty == '-' ? '' : texts.specialty;
		player.specialtyNumber = Foxtrick.L10n.getNumberFromSpecialty(player.specialty);

		if (cells.salary) {
			let salary = cells.salary.cloneNode(true), cConverter;
			if ((cConverter = salary.querySelector('.ft-dummy')))
				cConverter.remove();

			player.salary = Foxtrick.trimnum(salary.textContent);
		}

		if (cells.form)
			player.form = Foxtrick.Pages.Player.getSkillLevel(cells.form);

		if (cells.stamina) {
			player.stamina = Foxtrick.Pages.Player.getSkillLevel(cells.stamina);
			player.skills.stamina = player.stamina;
		}

		if (cells.deadline)
			player.deadline = cells.deadline.cloneNode(true);

		player.ageText = texts.age;
		let [yearsStr, daysStr] = player.ageText.match(/(\d+)/g);
		let years = parseInt(yearsStr, 10);
		let days = parseInt(daysStr, 10);
		player.ageYears = years;
		player.age = { years, days };
	};

	let parsePlayer = (playerNode) => {
		var p = { playerNode, skills: {}};

		try {
			// first row - country, name, ID
			let nameLink = playerNode.querySelector('.transfer_search_playername a');
			p.id = Foxtrick.getParameterFromUrl(nameLink.href, 'playerId');
			p.nameLink = nameLink.cloneNode(true);
			p.nameLink.target = '_blank';
			addLinks(p, playerNode, nameLink.href);

			let flag = playerNode.querySelector('.flag');
			let leagueId = Foxtrick.getParameterFromUrl(flag.href, 'leagueId');
			p.countryId = Foxtrick.XMLData.getCountryIdByLeagueId(leagueId);

			let [first, second] = playerNode.children;
			parseStatus(p, first);

			let bidDiv = isNewDesign ? second.querySelector('div[id$="updFastBid"]') : first;
			parseBidInfo(p, bidDiv);

			// check if the player is sold
			// if he is, the following info
			// are not available and we return
			let attrContSel = isNewDesign ? 'p' : '.transferPlayerCharacteristics';
			let attrContainer = playerNode.querySelector(attrContSel);
			if (attrContainer) {
				let infoTable = playerNode.querySelector('.transferPlayerInformation table');
				parseAttributes(p, attrContainer, infoTable);
				parseSkills(p, playerNode);
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}

		// return player even if we've encountered a problem
		return p;
	};

	isNewDesign = this.isNewDesign(doc);
	let playerNodes = [...doc.querySelectorAll('.transferPlayerInfo')];
	if (isNewDesign)
		playerNodes = playerNodes.map(p => p.parentNode.parentNode);

	return playerNodes.map(parsePlayer);
};
