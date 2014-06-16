'use strict';
/* top-players-owner.js
 * Highlight players of the logged in manager in Top Players stats page
 * @author tasosventouris
 */

Foxtrick.modules['TopPlayersOwner'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['statsTopPlayers'],
	CSS: Foxtrick.InternalPath + 'resources/css/top-players-owner.css',

	run: function(doc) {

		var teamId = Foxtrick.modules.Core.getSelfTeamInfo().teamId;
		var ids = [];

		Foxtrick.util.api.retrieve(doc, [
			['file', 'players'],
			['version', '2.2'],
			['teamId', teamId]
		],
		{ cache_lifetime: 'session' },

		function(xml, errorText) {
			if (!xml || errorText) {
				Foxtrick.log(errorText);
				return;
			}
                        
			var all = xml.getElementsByTagName('PlayerID');
			for (var i = 0; i < all.length; i++)
				ids.push(all[i].textContent);
                       
			var allPlayers = doc.getElementsByClassName('mainBox')[0].getElementsByTagName('a');
			for (var i = 0; i<allPlayers.length; ++i) {
				var player = Foxtrick.getParameterFromUrl(allPlayers[i].href, 'playerId')
				if (player && ids.indexOf(player) >= 0) {
					var row = allPlayers[i].parentNode.parentNode
					Foxtrick.addClass(row, 'ft-top-players-owner');
					Foxtrick.makeFeaturedElement(row, Foxtrick.modules.TopPlayersOwner)
				}			
			}
		});
	}
}
