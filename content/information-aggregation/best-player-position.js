'use strict';
/**
 * best-player-position.js
 * Show best position for player
 * @author Lukas Greblikas (greblys)
 */

Foxtrick.modules['BestPlayerPosition'] = {
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ['playerDetails', 'transferSearchResult', 'players'],
        
        run : function(doc) {            
            if (Foxtrick.Pages.Player.isSeniorPlayerPage(doc)) {
			if (!doc.getElementsByClassName('playerInfo').length)
				return;
                        var skills = Foxtrick.Pages.Player.getSkills(doc);
                        if (skills.defending == null) {
                            return;
                        }
                        
                        //creating the new element
                        var table = doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlplayerInfo')
                                .getElementsByTagName('table').item(0);
			var row = Foxtrick.insertFeaturedRow(table, this, table.rows.length);
			row.className = 'ft-best-player-position';
			var title = row.insertCell(0);
			title.textContent = Foxtrick.L10n.getString("BestPlayerPosition.title");
			var bestPositionCell = row.insertCell(1);
			var speciality = Foxtrick.Pages.Player.getSpeciality(doc);
			var contributions = Foxtrick.Pages.Player.getPositionsContributions(skills, speciality);
			var bestPositionValue = Foxtrick.Pages.Player.getBestPosition(contributions);
			bestPositionCell.textContent =
			    Foxtrick.L10n.getString(bestPositionValue.position + "Position") +
				" (" + bestPositionValue.value.toString() + ")";
			
            } else if (Foxtrick.isPage(doc, 'transferSearchResult')) {
                var players = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
                var transferPlayers = doc.getElementById('mainBody')
				.getElementsByClassName('transferPlayerSkills');
                for (var i = 0; i < transferPlayers.length; ++i) {
			var table = transferPlayers[i].getElementsByTagName('table').item(0);
			var row = Foxtrick.insertFeaturedRow(table, this, table.rows.length);
			row.className = 'ft-best-player-position';
			var title = row.insertCell(0);
			title.colSpan = "2";
			title.innerHTML = "<strong>" + Foxtrick.L10n.getString("BestPlayerPosition.title") + "</strong>";
			var bestPositionCell = row.insertCell(1);
			bestPositionCell.colSpan = "2";
			bestPositionCell.textContent = players[i].bestPositionLong;
                }
            } else if (Foxtrick.Pages.Players.isPlayersPage(doc) && Foxtrick.Pages.Players.isOwnPlayersPage(doc)) {
			var players = Foxtrick.Pages.Players.getPlayerList(doc, null, null);
			var playersNodes = doc.getElementsByClassName("playerInfo");
			for(var i = 0; i < players.length; ++i) {
				var container = Foxtrick.createFeaturedElement(doc, this, "div");
				container.className = "ft-best-player-position";
				container.textContent = Foxtrick.L10n.getString("BestPlayerPosition.title") + " " + players[i].bestPositionLong;
				
				var table = playersNodes[i].getElementsByTagName("table");
				var before = table.item(0).nextSibling;
				before.parentNode.insertBefore(container, before);
			}
			
	    }
        }
}
