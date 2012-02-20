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
			
		var replaceBars = function(bars, skillUp, appendix){
			while(bars.length){
			//	Foxtrick.makeFeaturedElement(bars[0], this);
				bars[0].setAttribute("title", bars[0].getAttribute("title") + ' +' + String(skillUp).substring(0, 4));
				//bars[0].setAttribute("alt", bars[0].getAttribute("alt") + ' +' + String(skillUp).substring(0, 4));
				Foxtrick.addClass(bars[0], "ft-percentImage-loyalty-" + appendix);
				Foxtrick.addClass(bars[0], "ft-percentImage");
				Foxtrick.removeClass(bars[0], "percentImage");
			}
		}
		
		var replacePercentageImage = function(player, bars){
			
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

					replaceBars(bars, skillUp, appendix);
				}
			} else {
				//homegrown, skillUp should be 1.5
				replaceBars(bars, 1.5, 'homegrown');
			}
		}
		
		if( Foxtrick.Pages.Players.isOwnPlayersPage(doc) && Foxtrick.isPage('players', doc) ){		
			var playersHTML = doc.getElementsByClassName("playerInfo");
			Foxtrick.Pages.Players.getPlayerList(doc, function(playerInfo){
				for (var p=0;p<playerInfo.length;p++) {
					replacePercentageImage(playerInfo[p], playersHTML[p].getElementsByClassName("percentImage"));
				}	
			});
				
		} else {
			Foxtrick.Pages.Player.getPlayer(doc, Foxtrick.Pages.Player.getId(doc), function(player){
				var bars = doc.getElementsByClassName("percentImage");
				replacePercentageImage(player, bars);
			});
		}
	}
};
