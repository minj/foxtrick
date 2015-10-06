'use strict';
/* transfer-search-results.js
 * Utilities on transfer search results page
 * @author convincedd, ryanli
 */

if (!Foxtrick)
	var Foxtrick = {};
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

/**
 * Get a list of player objects with the information in the result page.
 * Keep in mind that not all info might be available (e.g. after deadline).
 * @param  {document} doc
 * @return {array}        Array.<object>
 */
Foxtrick.Pages.TransferSearchResults.getPlayerList = function(doc) {
	var players = doc.getElementsByClassName('transferPlayerInfo');

	return Foxtrick.map(function(playerInfo) {
		var player = { playerNode: playerInfo };

		// return player whenever we encounter a problem
		try {
			var divs = playerInfo.getElementsByTagName('div');

			// first row - country, name, ID
			var flag = playerInfo.querySelector('.flag');
			var leagueId = Foxtrick.getParameterFromUrl(flag.href, 'leagueId');
			player.countryId = Foxtrick.XMLData.getCountryIdByLeagueId(leagueId);
			var nameLink = playerInfo.querySelector('.transfer_search_playername a');
			player.nameLink = nameLink.cloneNode(true);
			player.nameLink.target = '_blank';
			player.id = Foxtrick.getParameterFromUrl(player.nameLink.href, 'playerId');
			var bookmarkLink = playerInfo.querySelector('.bookmarkSmall');
			if (bookmarkLink) {
				player.bookmarkLink = bookmarkLink.cloneNode(true);
				player.bookmarkLink.target = '_blank';
			}
			var hotlistLink = playerInfo.querySelector('a[href*="hotList"]');
			if (hotlistLink) {
				player.hotlistLink = hotlistLink.cloneNode(true);
				player.hotlistLink.target = '_blank';
			}

			var htms = playerInfo.querySelector('.ft-htms-points');
			if (htms) {
				player.htmsAbility = parseInt(htms.getAttribute('data-htms-ability'), 10);
				player.htmsPotential = parseInt(htms.getAttribute('data-htms-potential'), 10);
			}

			player.redCard = 0;
			player.yellowCard = 0;
			player.bruised = false;
			player.injured = false;

			var imgs = divs[0].getElementsByTagName('img');
			Foxtrick.forEach(function(img) {
				if (img.className == 'cardsOne') {
					if (img.src.search(/red_card/i) != -1) {
						player.redCard = 1;
					}
					else {
						player.yellowCard = 1;
					}
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

			var items = divs[0].getElementsByClassName('transferPlayerInfoItems');
			var bid = items[items.length - 3];
			player.currentBid = Foxtrick.trimnum(bid.textContent);
			var bidder = items[items.length - 2];
			var bidderLink = bidder.querySelector('a');
			if (bidderLink) {
				bidderLink = bidderLink.cloneNode(true);
				bidderLink.target = '_blank';
				player.currentBidderLink = bidderLink;
				var shortBidder = bidderLink.cloneNode(true);
				shortBidder.textContent = 'x';
				player.currentBidderLinkShort = shortBidder;
			}

			// check if the player is sold, if he is, then following info
			// are not available and we go to the finally block with
			// return
			var characteristics = playerInfo.querySelector('.transferPlayerCharacteristics');
			if (!characteristics)
				return;

			// characteristics row - experience, leadership, form
			var links = characteristics.getElementsByTagName('a');
			var order = ['experience', 'leadership', 'form'];
			for (var i = 0; i < order.length; ++i) {
				player[order[i]] = Foxtrick.util.id.getSkillLevelFromLink(links[i]);
			}

			// left info table - owner, age, TSI, speciality, deadline
			var infoTable = playerInfo.querySelector('.transferPlayerInformation table');
			var ownerCell = infoTable.rows[0].cells[1];
			player.currentClubLink = ownerCell.querySelector('a').cloneNode(true);
			player.ageText = infoTable.rows[1].cells[1].textContent;
			var ageMatch = player.ageText.match(/(\d+)/g);
			player.age = { years: parseInt(ageMatch[0], 10), days: parseInt(ageMatch[1], 10) };
			player.ageYears = player.age.years;
			player.tsi = Foxtrick.trimnum(infoTable.rows[2].cells[1].textContent);
			var speciality = infoTable.rows[3].cells[1].textContent.trim();
			player.speciality = (speciality == '-') ? '' : speciality;
			player.specialityNumber = Foxtrick.L10n.getNumberFromSpeciality(player.speciality);
			player.deadline = infoTable.rows[4].cells[1].cloneNode(true);

			var tc = doc.createElement('a');
			tc.target = '_blank';
			tc.textContent = Foxtrick.L10n.getString('TransferCompare.abbr');
			tc.title = Foxtrick.L10n.getString('TransferCompare');
			tc.href = player.nameLink.href.replace('/Club/Players/Player.aspx',
			                                       '/Club/Transfers/TransferCompare.aspx');
			player.transferCompare = tc;

			// playerstats
			var ps = doc.createElement('a');
			ps.target = '_blank';
			ps.textContent = Foxtrick.L10n.getString('PerformanceHistory.abbr');
			ps.title = Foxtrick.L10n.getString('PerformanceHistory');
			var psUrl = player.nameLink.href;
			psUrl = psUrl.replace('/Club/Players/Player.aspx',
			                      '/Club/Players/PlayerStats.aspx') + '&ShowAll=true';
			ps.href = psUrl;
			player.performanceHistory = ps;

			// right skill table - skills
			var skillTable = playerInfo.querySelector('.transferPlayerSkills table');
			var skillLinks = Foxtrick.toArray(skillTable.getElementsByTagName('a'));
			if (skillTable.querySelector('.findSimilarPlayers'))
				// similar player feature link
				skillLinks.shift();

			var skillOrder = [
				'stamina',
				'keeper',
				'playmaking',
				'passing',
				'winger',
				'defending',
				'scoring',
				'setPieces'
			];
			var skills = {};
			for (var i = 0; i < skillOrder.length; ++i) {
				player[skillOrder[i]] = Foxtrick.util.id.getSkillLevelFromLink(skillLinks[i]);
				skills[skillOrder[i]] = player[skillOrder[i]];
			}
			player.skills = skills;

			var psico = playerInfo.querySelector('.ft-psico');
			if (psico) {
				var psicoTSI = psico.getAttribute('data-psico-avg');
				var psicoTitle = psico.getAttribute('data-psico-skill');
				player.psicoTSI = psicoTSI;
				player.psicoTitle = psicoTitle;
			}

			var contributions = Foxtrick.Pages.Player.getContributions(skills, player);
			for (var name in contributions)
				player[name] = contributions[name];

			var bestPosition = Foxtrick.Pages.Player.getBestPosition(contributions);
			player.bestPosition =
				Foxtrick.L10n.getString(bestPosition.position + 'Position.abbr');
			player.bestPositionLong =
				Foxtrick.L10n.getString(bestPosition.position + 'Position');
			player.bestPositionValue = bestPosition.value;

		}
		catch (e) {
			Foxtrick.log(e);
		}
		finally {
			return player;
		}
	}, players);
};
