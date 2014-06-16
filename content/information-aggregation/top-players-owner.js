'use strict';
/* top-players-owner.js
 * Highlight players of the logged in manager in Top Players stats page
 * @author tasosventouris
 */

Foxtrick.modules['TopPlayersOwner'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['statsTopPlayers'],

	run: function(doc) {

			var teamId = Foxtrick.modules.Core.getSelfTeamInfo().teamId;

			var ids = [];


			Foxtrick.util.api.retrieve(doc, [
                        ['file', 'players'],
                        ['version', '2.3'],
                        ['teamID', teamId],
						['actionType', "view"]
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
                       
						var allPlayers = doc.getElementsByTagName('a');

						for (var i = 0; i<allPlayers.length; ++i) {
							var re = /playerId=([0-9]+)/g;
							var player = re.exec(allPlayers[i].href)
							if (player && ids.indexOf(player[1]) >= 0) {
								allPlayers[i].setAttribute('style', 'background-color:yellow;')
							}			
						}
					}
				);
			}
		}
