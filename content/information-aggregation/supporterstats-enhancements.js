'use strict';
/* supporterstats-enhancements.js
 * Add extra information to supporterstats
 * @author convincedd
 */

Foxtrick.modules['SupporterStatsEnhancements'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['statsSquad'],

	run: function(doc) {
		// get selected teamid
		var teamid = 0;
		var options = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ddlTeams')
			.getElementsByTagName('option');
		for (var i = 0; i < options.length; ++i) {
			if (options[i].getAttribute('selected') == 'selected') {
				teamid = Number(options[i].value);
				break;
			}
		}
		if (teamid == 0)
			return;

		var args = [];
		args.push(['teamId', teamid]);
		args.push(['file', 'players']);

		Foxtrick.util.api.retrieve(doc, args, { cache_lifetime: 'session' },
		  function(xml, errorText) {
			if (!xml || errorText) {
				Foxtrick.log(errorText);
				return;
			}
			var playerNodes = xml.getElementsByTagName('Player');

			var table = doc.getElementById('mainBody').getElementsByTagName('table')[0];
			if (!table)
				return;
			var th = Foxtrick
				.createFeaturedElement(doc, Foxtrick.modules['SupporterStatsEnhancements'], 'th');
			Foxtrick.addClass(th, 'center');
			Foxtrick.addImage(doc, th, {
				src: Foxtrick.InternalPath + 'resources/img/formation.png',
				alt: Foxtrick.L10n.getString('CurrentSquad'),
				title: Foxtrick.L10n.getString('CurrentSquad')
			});

			table.getElementsByTagName('tr')[0].appendChild(th);

			var as = doc.getElementById('mainBody').getElementsByTagName('a');
			for (var i = 0; i < as.length; ++i) {
				if (as[i].href.search(/\/Club\/Players\/Player.aspx\?playerId=\d+/i) !== -1) {
					var id =
						Number(as[i].href.match(/\/Club\/Players\/Player.aspx\?playerId=(\d+)/i)[1]);
					var inSquad = false;
					for (var j = 0; j < playerNodes.length; ++j) {
						var playerNode = playerNodes[j];
						var pid = Number(playerNode.getElementsByTagName('PlayerID')[0].textContent);
						if (pid === id) {
							inSquad = true;
							break;
						}
					}
					var td = Foxtrick
						.insertFeaturedCell(as[i].parentNode.parentNode,
						                    Foxtrick.modules['SupporterStatsEnhancements'], -1);
					td.className = 'center';
					if (inSquad) td.textContent = 'x';
				}
			}
		});
	}
};
