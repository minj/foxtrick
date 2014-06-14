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

		var leagueId = Foxtrick.Pages.Country.getId(doc);

		var league = Foxtrick.XMLData.League[leagueId];
		var ntName = league.LeagueName;
		var ntId = league.NationalTeamId;
		var u20Name = 'U-20 ' + ntName;
		var u20Id = league.U20TeamId;

		var insertBefore = doc.getElementById('ctl00_ctl00_CPContent_CPMain_' +
		                                      'ucForumSneakpeek_updSneakpeek');

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
			['teamID', ntId]
		];
		var parameters_nt_str = JSON.stringify(ntArgs);
		Foxtrick.util.api.retrieve(doc, ntArgs, { cache_lifetime: 'default' },
		  function(xml, errorText) {
			var nextmatchdate = Foxtrick.util.matchView.fillMatches(
									ntContainer.getElementsByTagName('div')[0],
									xml,
									errorText);
			if (nextmatchdate) {
				var expire = Foxtrick.util.time.getDateFromText(nextmatchdate, 'yyyymmdd');
				Foxtrick.util.api.setCacheLifetime(parameters_nt_str, expire.getTime());
			}
		});

		var u20Args = [
			['file', 'matches'],
			['teamID', u20Id]
		];
		var parameters_u20_str = JSON.stringify(u20Args);
		Foxtrick.util.api.retrieve(doc, u20Args, { cache_lifetime: 'default' },
		  function(xml, errorText) {
			var nextmatchdate = Foxtrick.util.matchView.fillMatches(
									u20Container.getElementsByTagName('div')[0],
									xml,
									errorText);
			if (nextmatchdate) {
				var expire = Foxtrick.util.time.getDateFromText(nextmatchdate, 'yyyymmdd');
				Foxtrick.util.api.setCacheLifetime(parameters_u20_str, expire.getTime());
			}
		});
	}
};
