/**
 * current-transfers.js
 * Lists information for players on the transfer overview page.
 * @author LA-MJ
 */

'use strict';
Foxtrick.modules['CurrentTransfers'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['transfer'],
	// CSS: Foxtrick.InternalPath + 'resources/css/current-transfers.css',
	run: function(doc) {
		var module = this;

		// time to add to player deadline for caching
		// players are delayed if a game is being played
		var CACHE_BONUS = 1000 * 60 * 60 * 4; // 4 hours

		this.OPENING_PRICE = Foxtrick.L10n.getString('CurrentTransfers.openingPrice');

		var players = module.getPlayers(doc);
		if (!players.length)
			return;

		var argsPlayers = [], optsPlayers = [];
		Foxtrick.forEach(function(player) {
			var args = [
				['file', 'playerdetails'],
				['version', '2.5'],
				['playerId', parseInt(player.id, 10)],
			];
			argsPlayers.push(args);
			var cache = player.ddl + CACHE_BONUS;
			optsPlayers.push({ cache_lifetime: cache });
		}, players);

		Foxtrick.util.currency.establish(doc, function(currencyRate, symbol) {
			Foxtrick.util.api.batchRetrieve(doc, argsPlayers, optsPlayers,
			  function(xmls, errors) {
				if (!xmls)
					return;

				for (var i = 0; i < xmls.length; ++i) {
					if (!xmls[i] || errors[i]) {
						Foxtrick.log('No XML in batchRetrieve', argsPlayers[i], errors[i]);
						continue;
					}
					module.processXML(doc, xmls[i], { rate: currencyRate, symbol: symbol });
				}
			});
		});
	},
	getPlayers: function(doc) {
		var NOW = Foxtrick.util.time.getHtTimeStamp(doc);

		var table = doc.querySelector('#mainBody table.naked');
		if (!table)
			return [];

		// transfers table is the worst DOM ever created
		// some rows include <h2> for player grouping
		// other rows .even .odd are for players:
		// two rows per player: 1) player & price; 2) deadline
		var playerRows = Foxtrick.filter(function(row, i) {
			return i % 2 === 0;
		}, table.querySelectorAll('.odd, .even'));

		var players = [];

		Foxtrick.forEach(function(row) {
			var playerCell = row.cells[0];
			var playerLink = playerCell.querySelector('a');
			var playerId = Foxtrick.getParameterFromUrl(playerLink.href, 'playerId');
			Foxtrick.addClass(row, 'ft-transfer-' + playerId);

			if (Foxtrick.any(function(p) { return p.id === playerId; }, players)) {
				// same player on different lists
				return;
			}

			var deadline = NOW;
			var deadlineCell = row.nextElementSibling.cells[0];
			var date = deadlineCell.querySelector('.date');
			if (date) {
				var ddl = Foxtrick.util.time.getDateFromText(date.firstChild.textContent);
				deadline = ddl.valueOf();
			}

			var bidCell = row.cells[1];
			var bidLink = bidCell.querySelector('a');
			if (!bidLink) {
				// no current bid, adding for CHPP
				players.push({ id: playerId, ddl: deadline });
			}
		}, playerRows);

		return players;
	},
	processXML: function(doc, xml, opts) {
		var module = this;

		var id = xml.num('PlayerID');
		var price = xml.money('AskingPrice', opts.rate);
		var result = Foxtrick.formatNumber(price, '\u00a0') + ' ' + opts.symbol;

		var rows = doc.getElementsByClassName('ft-transfer-' + id);
		Foxtrick.forEach(function(row) {
			var bidCell = row.cells[1];
			var resultDiv = bidCell.querySelector('.float_right');

			Foxtrick.makeFeaturedElement(resultDiv, module);
			Foxtrick.addClass(resultDiv, 'ft-transfers-price');
			resultDiv.textContent = module.OPENING_PRICE + ': ' + result;
			bidCell.appendChild(resultDiv);
		}, rows);
	},
};
