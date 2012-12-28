'use strict';
/* transfer-search-results.js
 * Utilities on transfer search results page
 * @author convincedd, ryanli
 */

Foxtrick.Pages.TransferSearchResults = {
	isTransferSearchResultsPage: function(doc) {
		return (doc.location.href.search(/TransfersSearchResult\.aspx/i) != -1);
	},

	getPlayerList: function(doc) {
		var players = doc.getElementsByClassName('transferPlayerInfo');

		return Foxtrick.map(function(playerInfo) {
			var player = {};

			// return player whenever we encounter a problem
			try {
				var divs = playerInfo.getElementsByTagName('div');

				// first row - country, name, ID
				player.countryId = Foxtrick.XMLData
					.getCountryIdByLeagueId(divs[0].getElementsByClassName('flag')[0].href
					                        .match(/leagueId=(\d+)/i)[1]);
				player.nameLink = divs[0].getElementsByClassName('transfer_search_playername')[0]
					.getElementsByTagName('a')[0].cloneNode(true);
				player.id = player.nameLink.href.match(/.+playerID=(\d+)/i)[1];
				// first row - bookmark link
				var bookmarkLinks = Foxtrick.filter(function(l) {
					return l.href.search(/Bookmarks/i) >= 0;
				}, divs[0].getElementsByTagName('a'));
				if (bookmarkLinks.length > 0)
					player.bookmarkLink = bookmarkLinks[0].cloneNode(true);
				// first row - hotlist link
				var hotlistLinks = Foxtrick.filter(function(l) {
					return l.href.search(/hotList/i) != -1;
				}, divs[0].getElementsByTagName('a'));
				if (hotlistLinks.length > 0)
					player.hotlistLink = hotlistLinks[0].cloneNode(true);
				// first row - cards, injury
				player.redCard = 0;
				player.yellowCard = 0;
				player.bruised = false;
				player.injured = false;
				// first row - HTMS points
				var htms;
				if (htms = divs[0].getElementsByClassName('ft-htms-points')[0]) {
					var htmsText = htms.getElementsByTagName('span')[0].textContent;
					var matched = htmsText.match(/(\d+).+?(\d+)/);
					if (matched) {
						player.htmsAbility = Number(matched[1]);
						player.htmsPotential = Number(matched[2]);
					}
				}

				var imgs = divs[0].getElementsByTagName('img');
				for (var i = 0; i < imgs.length; ++i) {
					var img = imgs[i];
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
				}
				// first row - current bid, bidder
				var items = divs[0].getElementsByClassName('transferPlayerInfoItems');
				player.currentBid = Foxtrick.trimnum(items[items.length - 3].textContent);
				if (items[items.length - 2].getElementsByTagName('a').length == 1) {
					player.currentBidderLink = items[items.length - 2].getElementsByTagName('a')[0];
					player.currentBidderLinkShort = player.currentBidderLink.cloneNode(true);
					player.currentBidderLinkShort.textContent = 'x';
				}

				// check if the player is sold, if he is, then following info
				// are not available and we go to the finally block with
				// return
				if (playerInfo.getElementsByClassName('transferPlayerCharacteristics').length == 0)
					return;

				// characteristics row - experience, leadership, form
				// they have inserted some empty divs so it's actually divs[3]
				var characteristics = playerInfo
					.getElementsByClassName('transferPlayerCharacteristics')[0];
				var links = characteristics.getElementsByTagName('a');
				var order = ['experience', 'leadership', 'form'];
				for (var i = 0; i < order.length; ++i)
					player[order[i]] = Number(links[i].href.match(/ll=(\d+)/)[1]);

				// left info table - owner, age, TSI, speciality, deadline
				var infoTable = playerInfo.getElementsByClassName('transferPlayerInformation')[0]
					.getElementsByTagName('table')[0];
				player.currentClubLink = infoTable.rows[0].cells[1].getElementsByTagName('a')[0]
					.cloneNode(true);
				player.ageText = infoTable.rows[1].cells[1].textContent;
				var ageMatch = player.ageText.match(/(\d+)/g);
				player.age = { years: parseInt(ageMatch[0], 10), days: parseInt(ageMatch[1], 10) };
				player.tsi = Foxtrick.trimnum(infoTable.rows[2].cells[1].textContent);
				var speciality = Foxtrick.trim(infoTable.rows[3].cells[1].textContent);
				player.speciality = (speciality == '-') ? '' : speciality;
				player.deadline = infoTable.rows[4].cells[1].cloneNode(true);

				player.transferCompare = doc.createElement('a');
				player.transferCompare.textContent = Foxtrickl10n.getString('TransferCompare.abbr');
				player.transferCompare.title = Foxtrickl10n.getString('TransferCompare');
				player.transferCompare.href = player.nameLink.href
					.replace('/Club/Players/Player.aspx', '/Club/Transfers/TransferCompare.aspx');

				// right skill table - skills
				var skillTable = playerInfo.getElementsByClassName('transferPlayerSkills')[0]
					.getElementsByTagName('table')[0];
				var skills = Foxtrick.map(function(e) {
					return e;
				}, skillTable.getElementsByTagName('a'));
				if (skillTable.getElementsByClassName('findSimilarPlayers').length)
					skills.shift();
				var skillOrder = ['stamina', 'keeper', 'playmaking', 'passing', 'winger',
					'defending', 'scoring', 'setPieces'];
				for (var i = 0; i < skillOrder.length; ++i)
					player[skillOrder[i]] = Number(skills[i].href.match(/ll=(\d+)/)[1]);
			}
			catch (e) {
				Foxtrick.log(e);
			}
			finally {
				return player;
			}
		}, players);
	}
};
