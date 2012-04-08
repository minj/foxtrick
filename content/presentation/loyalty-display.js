"use strict";
/*
 * loyalty-display.js
 * Extends the skill bar representation with a version that reflects the Homegrown/loyalty bonus
 * @author CatzHoek
 */

Foxtrick.modules["LoyaltyDisplay"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ['players', 'playerdetail'],
	CSS : Foxtrick.InternalPath + "resources/css/loyalty-display.css",
	
	run : function(doc) {
	
		//on players page, just run for the own team
		if(Foxtrick.isPage('players', doc) && !Foxtrick.Pages.Players.isOwnPlayersPage(doc))
			return;

		var str_mcb = Foxtrickl10n.getString('LoyaltyDisplay.motherClubBonus')
		var str_lo = Foxtrickl10n.getString('LoyaltyDisplay.loyaltyBonus')
			
		var replaceBars = function(node, skillUp, appendix){
			var str = skillUp == 1.5?str_mcb:str_lo;
			var count = 0;
			var bars = node.getElementsByTagName("img");
			while(count < bars.length && count < 100){
				if (Foxtrick.hasClass(bars[count], "percentImage")) {
					bars[count].setAttribute("title", bars[count].getAttribute("title") + ' +' + String(skillUp).substring(0, 4) + " " + str);
					//bars[0].setAttribute("alt", bars[0].getAttribute("alt") + ' +' + String(skillUp).substring(0, 4));
					Foxtrick.addClass(bars[count], "ft-percentImage-loyalty-" + appendix);
					Foxtrick.addClass(bars[count], "ft-percentImage");
					Foxtrick.removeClass(bars[count], "percentImage");
				}
				++count;
			}
		}
		
		var replacePercentageImage = function(player, node){
			
			var loyalty = player.Loyalty;
			if(loyalty === undefined)
				loyalty  = player.loyalty;
					
			var mcb = player.MotherClubBonus;
			if(mcb === undefined)
				mcb  = player.motherClubBonus;

			if (mcb === undefined || mcb == 'False'){
				if (loyalty !== undefined){
					//formula
					// loyalty = 1 + sqrt(days/336)*19
					// bonus = sqrt(days/336)
					// -> bonus = (loyalty - 1) / 19
					var skillUp = ( loyalty - 1 ) / 19.0;
					
					var appendix;
					//find correct style for this loyalty level
					if(skillUp == 1)
						appendix = "1000";
					else if(skillUp >= 0.875)
						appendix = "875";
					else if(skillUp >= 0.75)
						appendix = "750";
					else if(skillUp >= 0.625)
						appendix = "625";
					else if(skillUp >= 0.50)
						appendix = "500";
					else if(skillUp >= 0.375)
						appendix = "375";
					else if(skillUp >= 0.25)
						appendix = "250";
					else if(skillUp >= 0.125)
						appendix = "125";
					else 
						return;

					replaceBars(node, skillUp, appendix);
				}
			} else {
				//homegrown, skillUp should be 1.5
				replaceBars(node, 1.5, 'homegrown');
			}
		}
		
		if( Foxtrick.Pages.Players.isOwnPlayersPage(doc) && Foxtrick.isPage('players', doc) ){		
			var playersNode = doc.getElementsByClassName("playerInfo");
			Foxtrick.Pages.Players.getPlayerList(doc, function(playerInfo){
				if (!playerInfo)
					return;
				for (var p=0; p<playersNode.length; ++p) {
					var playerid = Foxtrick.Pages.Players.getPlayerId(playersNode[p]);
					if (playerid) {
						var thisPlayerInfo = Foxtrick.Pages.Players.getPlayerFromListById(playerInfo, playerid);
						if (thisPlayerInfo) 
							replacePercentageImage(thisPlayerInfo, playersNode[p]);
					}
				}	
			});
				
		} else {
			Foxtrick.Pages.Player.getPlayer(doc, Foxtrick.Pages.Player.getId(doc), function(player){
				replacePercentageImage(player, doc.getElementById('mainBody'));
			});
		}
	}
};
