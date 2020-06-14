/**
 * extra-player-info.js
 * Add extra information for players in players page
 * @author convincedd, ryanli, LA-MJ
 */

'use strict';

Foxtrick.modules['ExtraPlayerInfo'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['allPlayers'],
	OPTIONS: ['CoachInfo', 'Flag', 'Language'],

	addCoachWrapper: function(playerNode, { skill, type }) {
		let doc = playerNode.ownerDocument;
		let targetNode = playerNode.querySelector('p'); // insert after the second break

		let skillStr = Foxtrick.L10n.getLevelByTypeAndValue('levels', skill);

		let typeStr = '';
		switch (type) {
			case 0:
				typeStr = Foxtrick.L10n.getString('ExtraPlayerInfo.defensiveTrainer');
				break;
			case 1:
				typeStr = Foxtrick.L10n.getString('ExtraPlayerInfo.offensiveTrainer');
				break;
			default:
				typeStr = Foxtrick.L10n.getString('ExtraPlayerInfo.balancedTrainer');
				break;
		}
		let [pre, post] = typeStr.split('%s');

		let skillLink = doc.createElement('a');
		skillLink.href = `/Help/Rules/AppDenominations.aspx?lt=skill&ll=${skill}#skill`;
		skillLink.className = 'skill';
		skillLink.textContent = skillStr;

		let wrapper = Foxtrick.createFeaturedElement(doc, this, 'div');
		wrapper.appendChild(doc.createTextNode(pre));
		wrapper.appendChild(skillLink);
		wrapper.appendChild(doc.createTextNode(post));

		targetNode.appendChild(wrapper);
	},

	addNTFlag: function(playerNode, countryId) {
		// used for coloring NT players when AddFlags is enabled
		const NT_COLOR = '#ffcc00';

		let doc = playerNode.ownerDocument;

		let [first, second] = [...playerNode.querySelectorAll('a')];
		let isNtPlayer = /NationalTeam/i.test(first.href);
		let nameLink = isNtPlayer ? second : first;

		if (isNtPlayer) {
			nameLink.setAttribute('style', `background-color:${NT_COLOR};`);
		}
		else {
			// NT players have flags by default, so only need
			// to add flags for non-NT players
			let flag = Foxtrick.util.id.createFlagFromCountryId(doc, countryId);
			if (flag) {
				Foxtrick.makeFeaturedElement(flag, this);
				let parent = nameLink.parentNode;
				parent.insertBefore(flag, parent.firstChild);
			}
		}
	},

	addLanguage: function(playerNode, playerId) {
		let doc = playerNode.ownerDocument;
		let targetNode = playerNode.querySelector('b, h3');
		if (!targetNode)
			return;

		Foxtrick.Pages.Player.getPlayer(doc, playerId, (player) => {
			if (!player || !player.playerLanguage)
				return;

			let language = Foxtrick.createFeaturedElement(doc, this, 'em');
			Foxtrick.addClass(language, 'shy');
			language.setAttribute('style', 'font-weight:normal; margin-left:5px;');
			language.textContent = player.playerLanguage;
			if (player.PlayerLanguageID)
				language.setAttribute('PlayerLanguageID', player.playerLanguageID);

			targetNode.appendChild(language);
		});
	},

	run: function(doc) {
		var module = this;

		var enableCoach = Foxtrick.Prefs.isModuleOptionEnabled(module, 'CoachInfo');
		var enableNTFlag = Foxtrick.Prefs.isModuleOptionEnabled(module, 'Flag');
		var enableLanguage = Foxtrick.Prefs.isModuleOptionEnabled(module, 'Language') &&
			Foxtrick.isPage(doc, 'ownPlayers');

		Foxtrick.Pages.Players.getPlayerList(doc, (playerList) => {
			if (!playerList || !playerList.length) {
				Foxtrick.log('ExtraPlayerInfo: unable to retrieve player list.');
				return;
			}

			var allPlayers = Foxtrick.Pages.Players.getPlayerNodes(doc);
			for (let pNode of allPlayers) {
				var id = Foxtrick.Pages.Players.getPlayerId(pNode);
				var player = Foxtrick.Pages.Players.getPlayerFromListById(playerList, id);
				if (!player)
					return;

				if (enableCoach && typeof player.trainerData !== 'undefined')
					module.addCoachWrapper(pNode, player.trainerData);

				if (enableNTFlag && typeof player.countryId !== 'undefined')
					module.addNTFlag(pNode, player.countryId);

				if (enableLanguage)
					module.addLanguage(pNode, player.id);

			}
		});
	},
};
