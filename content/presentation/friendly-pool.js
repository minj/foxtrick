'use strict';

/*
 * show-friendly-booked.js
 * Show whether a team has booked friendly on series page
 * @author ryanli, LA-MJ
 */

Foxtrick.modules['FriendlyPool'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['challenges'],
	CSS: Foxtrick.InternalPath + 'resources/css/friendly-pool.css',
	OPTIONS: ['ExpandCountrySelection'],

	run: function(doc) {
		var countrySelect = Foxtrick.getMBElement(doc, 'ddlPoolCountries');
		if (!countrySelect)
			return;

		if (Foxtrick.Prefs.isModuleOptionEnabled('FriendlyPool', 'ExpandCountrySelection'))
			countrySelect.size = countrySelect.querySelectorAll('option').length;

		var ownTeamId = Foxtrick.util.id.getOwnTeamId();
		var ownLeagueId = Foxtrick.util.id.getOwnLeagueId();

		// README: 0 for HTI
		var ownCountryId = Foxtrick.XMLData.getCountryIdByLeagueId(ownLeagueId);

		var parameters = [
			['file', 'teamdetails'],
			['version', '2.6'],
			['teamId', ownTeamId],
			['includeFlags', 'true'],
		];
		Foxtrick.util.api.retrieve(doc, parameters, { cache_lifetime: 'default' },
		  function(xml, errorText) {
			if (!xml || errorText) {
				Foxtrick.log(errorText);

				// destCell.textContent = Foxtrick.L10n.getString('status.error.abbr');
				// destCell.title = errorText;

				return;
			}

			var home = {};
			var homeIds = xml.node('HomeFlags').getElementsByTagName('LeagueId');
			for (var homeId of Foxtrick.toArray(homeIds)) {
				var homeCountryId = Foxtrick.XMLData.getCountryIdByLeagueId(homeId.textContent);
				home[homeCountryId] = true;
			}

			var away = {};
			var awayIds = xml.node('AwayFlags').getElementsByTagName('LeagueId');
			for (var awayId of Foxtrick.toArray(awayIds)) {
				var awayCountryId = Foxtrick.XMLData.getCountryIdByLeagueId(awayId.textContent);
				away[awayCountryId] = true;
			}

			var options = countrySelect.getElementsByTagName('option');
			for (var option of Foxtrick.toArray(options)) {
				if (home[option.getAttribute('value')] && away[option.getAttribute('value')]) {
					Foxtrick.addClass(option, 'ft-home ft-away');
					option.title = Foxtrick.L10n.getString('matches.playedHomeAway');
				}
				else if (home[option.getAttribute('value')]) {
					Foxtrick.addClass(option, 'ft-home');
					option.title = Foxtrick.L10n.getString('matches.playedHome');
				}
				else if (away[option.getAttribute('value')]) {
					Foxtrick.addClass(option, 'ft-away');
					option.title = Foxtrick.L10n.getString('matches.playedAway');
				}
				else if (option.getAttribute('value') == ownCountryId) {
					Foxtrick.addClass(option, 'ft-own');
				}
			}

		});

	},
};
