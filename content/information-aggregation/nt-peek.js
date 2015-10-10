'use strict';
/**
 * nt-peek.js
 * peeks NT/U20 matches at MyHT
 * @author ryanli
 */

Foxtrick.modules['NtPeek'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['country'],
	CSS: Foxtrick.InternalPath + 'resources/css/nt-peek.css',

	run: function(doc) {
		var buildContainer = function(team, id, isNt) {
			var buildTeamHeader = function() {
				var header = doc.createElement('h2');
				var link = doc.createElement('a');
				link.textContent = team;
				link.href = '/Club/NationalTeam/NationalTeam.aspx?teamId=' + id;
				header.appendChild(link);
				return header;
			};

			var container = doc.createElement('div');
			if (isNt)
				container.className = 'ft-nt-peek-nt';
			else
				container.className = 'ft-nt-peek-u20';

			var header = buildTeamHeader();
			container.appendChild(header);

			var matchesContainer = doc.createElement('div');
			Foxtrick.util.matchView.startLoad(matchesContainer);
			container.appendChild(matchesContainer);

			return container;
		};

		var leagueId = Foxtrick.Pages.All.getId(doc);

		var league = Foxtrick.XMLData.League[leagueId];
		var ntId = league.NationalTeamId;
		var u20Id = league.U20TeamId;
		var ntName = Foxtrick.XMLData.getNTNameByLeagueId(leagueId);
		var u20Name = 'U-20 ' + ntName;

		var insertBefore = Foxtrick.getMBElement(doc, 'ucForumSneakpeek_updSneakpeek');

		var container = Foxtrick.createFeaturedElement(doc, this, 'div');
		container.className = 'ft-nt-peek';
		insertBefore.parentNode.insertBefore(container, insertBefore);

		// NT container
		var ntContainer = buildContainer(ntName, ntId, true);
		container.appendChild(ntContainer);
		// U20 container
		var u20Container = buildContainer(u20Name, u20Id, false);
		container.appendChild(u20Container);
		// separator
		var separator = doc.createElement('div');
		separator.className = 'separator';
		container.appendChild(separator);

		var ntArgs = [
			['file', 'matches'],
			['version', '2.8'],
			['teamId', parseInt(ntId, 10)]
		];
		var parameters_nt_str = JSON.stringify(ntArgs);
		Foxtrick.util.api.retrieve(doc, ntArgs, { cache_lifetime: 'default' },
		  function(xml, errorText) {
			var nextmatchdate = Foxtrick.util.matchView.fillMatches(
									ntContainer.getElementsByTagName('div')[0],
									xml,
									errorText);
			if (nextmatchdate) {
				Foxtrick.util.api.setCacheLifetime(parameters_nt_str, nextmatchdate.getTime());
			}
		});

		var u20Args = [
			['file', 'matches'],
			['version', '2.8'],
			['teamId', parseInt(u20Id, 10)]
		];
		var parameters_u20_str = JSON.stringify(u20Args);
		Foxtrick.util.api.retrieve(doc, u20Args, { cache_lifetime: 'default' },
		  function(xml, errorText) {
			var nextmatchdate = Foxtrick.util.matchView.fillMatches(
									u20Container.getElementsByTagName('div')[0],
									xml,
									errorText);
			if (nextmatchdate) {
				Foxtrick.util.api.setCacheLifetime(parameters_u20_str, nextmatchdate.getTime());
			}
		});
	}
};
