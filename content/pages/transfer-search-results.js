/**
 * transfer-search-results.js
 * Utilities on transfer search results page
 * @author convincedd, ryanli
 */

'use strict';

/* eslint-disable */
if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.Pages)
	Foxtrick.Pages = {};
/* eslint-enable */

Foxtrick.Pages.TransferSearchResults = {};

/**
 * Test whether it's transfer search results
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.TransferSearchResults.isPage = function(doc) {
	return Foxtrick.isPage(doc, 'transferSearchResult');
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
	let parseSkills = (player, pNode) => {
		const SKILLS = [
			'stamina',
			'keeper',
			'playmaking',
			'passing',
			'winger',
			'defending',
			'scoring',
			'setPieces',
		];

		// right skill table - skills
		let skillTable = pNode.querySelector('.transferPlayerSkills table');
		let skillLinks = Foxtrick.toArray(skillTable.getElementsByTagName('a'));
		if (skillTable.querySelector('.findSimilarPlayers')) {
			// similar player feature link
			skillLinks.shift();
		}
		player.skills = {};
		for (let [idx, skill] of SKILLS.entries()) {
			player[skill] = Foxtrick.util.id.getSkillLevelFromLink(skillLinks[idx]);
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
		let items = [...bidContainer.getElementsByClassName('transferPlayerInfoItems')].reverse();
		let bid = items[2];
		player.currentBid = Foxtrick.trimnum(bid.textContent);

		let bidder = items[1];
		let bidderLink = bidder.querySelector('a');
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

	let parseStatus = (player, statusContainer) => {
		player.redCard = 0;
		player.yellowCard = 0;
		player.bruised = false;
		player.injured = false;

		let imgs = statusContainer.getElementsByTagName('img');
		Foxtrick.forEach(function(img) {
			if (img.className == 'cardsOne') {
				if (/red_card/i.test(img.src))
					player.redCard = 1;
				else
					player.yellowCard = 1;
			}
			else if (img.className == 'cardsTwo') {
				player.yellowCard = 2;
			}
			else if (img.className == 'injuryBruised') {
				player.bruised = true;
			}
			else if (img.className == 'injuryInjured') {
				player.injured = true;
			}
		}, imgs);
	};

	let parseAttributes = (player, pNode, attrContainer) => {
		// characteristics row - experience, leadership, form
		let links = attrContainer.getElementsByTagName('a');
		const ATTRIBUTES = ['experience', 'leadership', 'form'];
		for (let [idx, attr] of ATTRIBUTES.entries())
			player[attr] = Foxtrick.util.id.getSkillLevelFromLink(links[idx]);

		// left info table - owner, age, TSI, specialty, deadline
		let infoTable = pNode.querySelector('.transferPlayerInformation table');
		let ownerCell = infoTable.rows[0].cells[1];
		player.currentClubLink = ownerCell.querySelector('a').cloneNode(true);
		player.ageText = infoTable.rows[1].cells[1].textContent.trim();
		let ageMatch = player.ageText.match(/(\d+)/g);
		player.age = { years: parseInt(ageMatch[0], 10), days: parseInt(ageMatch[1], 10) };
		player.ageYears = player.age.years;
		player.tsi = Foxtrick.trimnum(infoTable.rows[2].cells[1].textContent);
		let specialty = infoTable.rows[3].cells[1].textContent.trim();
		player.specialty = specialty == '-' ? '' : specialty;
		player.specialtyNumber = Foxtrick.L10n.getNumberFromSpecialty(player.specialty);
		player.deadline = infoTable.rows[4].cells[1].cloneNode(true);
	};

	let parsePlayer = (playerNode) => {
		var p = { playerNode };

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

			var [container] = playerNode.getElementsByTagName('div');
			parseBidInfo(p, container);
			parseStatus(p, container);

			// check if the player is sold, if he is, then following info
			// are not available and we return
			let attrDiv = playerNode.querySelector('.transferPlayerCharacteristics');
			if (attrDiv) {
				parseAttributes(p, playerNode, attrDiv);
				parseSkills(p, playerNode);
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}

		// return player even if we've encountered a problem
		return p;
	};

	let playerNodes = [...doc.querySelectorAll('.transferPlayerInfo')];
	return playerNodes.map(parsePlayer);

};
