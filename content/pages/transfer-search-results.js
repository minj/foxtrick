/* transfer-search-results.js
 * Utilities on transfer search results page
 * @author convincedd, ryanli
 */

Foxtrick.Pages.TransferSearchResults = {
	isTransferSearchResultsPage : function(doc) {
		return (doc.location.href.indexOf("TransfersSearchResult\.aspx") != -1);
	},

	getPlayerList : function(doc) {
		try {
			var playerList = [];

			var player;
			var transferTable = doc.getElementById("mainBody").getElementsByTagName("table")[0];
			for (var i = 0; i < transferTable.rows.length-1; ++i ) {
				player = {};
				
				// start defined by next row being first of skill rows
				if (transferTable.rows[i+1].id==null || transferTable.rows[i+1].id.search(/TransferPlayer_r1$/i)==-1) continue;
				
				// filter is on?
				if (transferTable.rows[i].style.display=='none') {
					i += 8;
					continue; 
				}
				
				player.deadline = transferTable.rows[i + 6].cells[1].getElementsByTagName("span")[0].cloneNode(true);

				var overviewtable = transferTable.rows[i].getElementsByTagName("table")[0];

				var bidderlink = overviewtable.rows[0].cells[5].getElementsByTagName("a");
				if (bidderlink.length !== 0) {
					player.currentBidderLink = bidderlink[0].cloneNode(true);
					player.currentBidderLinkShort = bidderlink[0].cloneNode(true);
					player.currentBidderLinkShort.textContent = "x";
				}
				else {
					player.currentBidderLink = doc.createTextNode("");
					player.currentBidderLinkShort = doc.createTextNode("");
				}
				player.currentBid = Foxtrick.trimnum(overviewtable.rows[0].cells[4].textContent);

				var nameLink = overviewtable.rows[0].cells[1].getElementsByTagName("a")[0];
				player.id = nameLink.href.match(/.+playerID=(\d+)/i)[1];
				player.nameLink = nameLink.cloneNode(true);
				player.countryId = Foxtrick.XMLData.getCountryIdByLeagueId(transferTable.rows[i].getElementsByTagName("a")[0].href.match(/leagueId=(\d+)/i)[1]);

				player.ageText = transferTable.rows[i+3].cells[1].textContent;
				var ageMatch = player.ageText.match(/(\d+)/g);
				player.age = { years: parseInt(ageMatch[0]), days: parseInt(ageMatch[1]) };
				player.tsi = parseInt(Foxtrick.trimnum(transferTable.rows[i+4].cells[1].textContent));
				var speciality = Foxtrick.trim(transferTable.rows[i+5].cells[1].textContent);
				player.speciality = (speciality == "-") ? "" : speciality;

				var links = {};
				var basicSkillLinks = transferTable.rows[i+1].cells[0].getElementsByTagName("a");
				links.form = basicSkillLinks[2];
				links.stamina = transferTable.rows[i+2].cells[3].getElementsByTagName("a")[0];
				links.leadership = basicSkillLinks[1];
				links.experience = basicSkillLinks[0];
				var basicSkillNames = ["form", "stamina", "leadership", "experience"];
				for (var j in basicSkillNames) {
					if (player[basicSkillNames[j]] === undefined
						&& links[basicSkillNames[j]] !== undefined) {
						player[basicSkillNames[j]] = parseInt(links[basicSkillNames[j]].href.match(/ll=(\d+)/)[1]);
					}
				}
				var skillOrder = ["keeper", "playmaking", "passing", "winger", "defending", "scoring", "setPieces"];
				var skillOrderRow = [2, 3, 3, 4, 4, 5, 5];
				var skillOrderCell = [5, 3, 5, 3, 5, 3, 5];
				for (var j = 0; j < skillOrder.length; ++j) {
					var level = transferTable.rows[i+skillOrderRow[j]].cells[skillOrderCell[j]].getElementsByTagName("a")[0].href.match(/ll=(\d+)/)[1];
					player[skillOrder[j]] = parseInt(level);
				}

				var links = transferTable.rows[i].getElementsByTagName("a");
				for (var j = 0; j < links.length; ++j) {
					if (links[j].href.search(/Bookmarks/) !== -1) {
						player.bookmarkLink = links[j].cloneNode(true);
					}
				}

				var imgs = transferTable.rows[i].getElementsByTagName("img");
				// red/yellow cards and injuries, these are shown as images
				player.redCard = 0;
				player.yellowCard = 0;
				player.bruised = false;
				player.injured = 0;

				for (var j = 0; j < imgs.length; ++j) {
					if (imgs[j].className == "cardsOne") {
						if (imgs[j].src.indexOf("red_card", 0) != -1) {
							player.redCard = 1;
						}
						else {
							player.yellowCard = 1;
						}
					}
					else if (imgs[j].className == "cardsTwo") {
						player.yellowCard = 2;
					}
					else if (imgs[j].className == "injuryBruised") {
						player.bruised = true;
					}
					else if (imgs[j].className == "injuryInjured") {
						player.injured = parseInt(imgs[j].nextSibling.textContent);
					}
				}
				player.currentClubLink = transferTable.rows[i+2].cells[1].getElementsByTagName("a")[0].cloneNode(true);

				playerList.push(player);
				i += 8;
			}
			return playerList;
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
};
