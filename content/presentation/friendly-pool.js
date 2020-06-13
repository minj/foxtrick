/**
 * show-friendly-booked.js
 * Show whether a team has booked friendly on series page
 * @author ryanli, LA-MJ
 */

'use strict';

Foxtrick.modules.FriendlyPool = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['challenges'],
	CSS: Foxtrick.InternalPath + 'resources/css/friendly-pool.css',
	OPTIONS: ['ExpandCountrySelection'],

	/** @param {document} doc */
	run: function(doc) {
		var countrySelect = /** @type {HTMLSelectElement} */ (
			Foxtrick.getMBElement(doc, 'ddlPoolSettingRequestLeague') ||
			Foxtrick.getMBElement(doc, 'ddlPoolCountries')
		);

		if (!countrySelect)
			return;

		if (Foxtrick.Prefs.isModuleOptionEnabled('FriendlyPool', 'ExpandCountrySelection'))
			countrySelect.size = countrySelect.options.length;

		var ownTeamId = Foxtrick.util.id.getOwnTeamId();
		var ownLeagueId = Foxtrick.util.id.getOwnLeagueId();

		// README: 0 for HTI
		var ownCountryId = Foxtrick.XMLData.getCountryIdByLeagueId(ownLeagueId);

		/** @type {CHPPParams} */
		var parameters = [
			['file', 'teamdetails'],
			['version', '2.6'],
			['teamId', ownTeamId],
			['includeFlags', 'true'],
		];
		Foxtrick.util.api.retrieve(doc, parameters, { cache: 'default' }, (xml, errorText) => {
			if (!xml || errorText) {
				Foxtrick.log(errorText);

				// destCell.textContent = Foxtrick.L10n.getString('status.error.abbr');
				// destCell.title = errorText;

				return;
			}

			let home = {};
			let homeIds = xml.node('HomeFlags').getElementsByTagName('LeagueId');
			for (let homeId of Foxtrick.toArray(homeIds)) {
				let id = Number(homeId.textContent);
				let homeCountryId = Foxtrick.XMLData.getCountryIdByLeagueId(id);
				home[homeCountryId] = true;
			}

			let away = {};
			let awayIds = xml.node('AwayFlags').getElementsByTagName('LeagueId');
			for (let awayId of Foxtrick.toArray(awayIds)) {
				let id = Number(awayId.textContent);
				let awayCountryId = Foxtrick.XMLData.getCountryIdByLeagueId(id);
				away[awayCountryId] = true;
			}

			let options = countrySelect.options;
			for (let option of Foxtrick.toArray(options)) {
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
				else if (option.value == String(ownCountryId)) {
					Foxtrick.addClass(option, 'ft-own');
				}
			}

		});

	},
};
