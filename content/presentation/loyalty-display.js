'use strict';
/*
 * loyalty-display.js
 * Extends the skill bar representation with a version
 * that reflects the Homegrown/loyalty bonus
 * @author CatzHoek
 */

Foxtrick.modules['LoyaltyDisplay'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['players', 'playerDetails'],
	CSS: Foxtrick.InternalPath + 'resources/css/loyalty-display.css',

	replacePercentageImage: function(player, node) {

		var replaceBars = function(node, skillUp, appendix) {
			var str_mcb = Foxtrick.L10n.getString('LoyaltyDisplay.motherClubBonus');
			var str_lo = Foxtrick.L10n.getString('LoyaltyDisplay.loyaltyBonus');
			var str = (skillUp == 1.5) ? str_mcb : str_lo;
			var count = 0;
			var bars = node.getElementsByTagName('img');
			var className = 'ft-percentImage ft-percentImage-loyalty-' + appendix;
			while (count < bars.length && count < 100) {
				if (bars[count].parentNode.className != 'ratingInnerBox') {
					if (Foxtrick.hasClass(bars[count], 'percentImage')) {
						var title = bars[count].title;
						if (title) {
							title = title.match(/\S+/)[0] + '\u00a0+' +
								skillUp.toString().substring(0, 4) + '\u00a0' + str;
							bars[count].title = title;
						}
						Foxtrick.addClass(bars[count], className);
						Foxtrick.removeClass(bars[count], 'percentImage');
					}
				}
				++count;
			}
		};

		var loyalty = player.loyalty;

		var mcb = player.motherClubBonus;

		var skillUp = Foxtrick.Predict.loyaltyBonus(loyalty, mcb);

		var appendix;
		//find correct style for this loyalty level
		if (skillUp == 1.5)
			appendix = 'homegrown';
		else if (skillUp == 1)
			appendix = '1000';
		else if (skillUp >= 0.875)
			appendix = '875';
		else if (skillUp >= 0.75)
			appendix = '750';
		else if (skillUp >= 0.625)
			appendix = '625';
		else if (skillUp >= 0.50)
			appendix = '500';
		else if (skillUp >= 0.375)
			appendix = '375';
		else if (skillUp >= 0.25)
			appendix = '250';
		else if (skillUp >= 0.125)
			appendix = '125';
		else
			return;

		replaceBars(node, skillUp, appendix);
	},
	run: function(doc) {
		var module = this;

		if (Foxtrick.isPage(doc, 'ownPlayers')) {
			var playersNode = doc.getElementsByClassName('playerInfo');
			Foxtrick.Pages.Players.getPlayerList(doc,
			  function(playerInfo) {
				if (!playerInfo || !playerInfo.length)
					return;
				for (var p = 0; p < playersNode.length; ++p) {
					var playerid = Foxtrick.Pages.Players.getPlayerId(playersNode[p]);
					if (playerid) {
						var thisPlayerInfo =
							Foxtrick.Pages.Players.getPlayerFromListById(playerInfo, playerid);
						if (thisPlayerInfo)
							module.replacePercentageImage(thisPlayerInfo, playersNode[p]);
					}
				}
			});

		}
		else if (Foxtrick.isPage(doc, 'playerDetails')) {
			if (Foxtrick.Pages.Player.wasFired(doc))
				return;

			var id = Foxtrick.Pages.Player.getId(doc);
			Foxtrick.Pages.Player.getPlayer(doc, id, function(player) {
				if (!player)
					return;
				module.replacePercentageImage(player, doc.getElementById('mainBody'));
			});
		}
	}
};
