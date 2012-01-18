"use strict";
/*
 * loyality-display.js
 * @author CatzHoek
 */

Foxtrick.modules["LoyalityDisplay"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ['players'],
	CSS : Foxtrick.InternalPath + "resources/css/loyalityDisplay.css",
	
	run : function(doc) {
	
		if(!Foxtrick.Pages.Players.isOwnPlayersPage(doc))
			return;
		
		var playersHtml = doc.getElementsByClassName("playerInfo");
		var players = Foxtrick.Pages.Players.getPlayerList(doc);
		
		var simpleSkin = !Foxtrick.util.layout.isStandard(doc);
		
		for (var p=0;p<players.length;p++) {
			
			//FIXME: Delete next season
			var halfEffect = true;
			//FIXME: end
			
			if (players[p].motherClubBonus === undefined || halfEffect){
				if (players[p].loyality !== undefined){
					
					//formula
					// loyality = 1 + sqrt(days/336)*19
					// bonus = sqrt(days/336)
					// -> bonus = (loyality - 1) / 19
					var skillUp = ( players[p].loyality - 1 ) / 19.0;
					
					//FIXME: Delete next season
					if(halfEffect)
						skillUp *= 0.5;

					if(players[p].motherClubBonus !== undefined)
						skillUp += 0.25;
					//FIXME: end
					
					var appendix;
					//find correct style for this loyality level
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
						
					var bars = playersHtml[p].getElementsByClassName("percentImage");
					for(var i = 0; i < bars.length; i++){
						if(simpleSkin)
							Foxtrick.addClass(bars[i], "ft-percentImage-loyality-" + appendix + "-simple");
						else
							Foxtrick.addClass(bars[i], "ft-percentImage-loyality-" + appendix);
					}
				}
			} else {
				//replace original image by hg with 1,5 addon style
				var bars = playersHtml[p].getElementsByClassName("percentImage");
				for(var i = 0; i < bars.length; i++){
					Foxtrick.addClass(bars[i], "ft-percentImage-homegrown");
				}
			}
		}		
	}
};
