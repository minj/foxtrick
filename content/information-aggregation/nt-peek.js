/**
 * nt-peek.js
 * peeks NT/U20 matches at MyHT
 * @author ryanli, convincedd, ryanli
 */

'use strict';

Foxtrick.modules.NtPeek = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['country'],
	CSS: Foxtrick.InternalPath + 'resources/css/nt-peek.css',

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		/**
		 * @param  {Date}   date
		 * @return {number}
		 */
		var getMatchEnd = function(date) {
			const MATCH_MIN = 150; // +5
			let mSecs = Foxtrick.util.time.MSECS_IN_MIN * MATCH_MIN;
			return date.getTime() + mSecs;
		};

		/**
		 * @param  {string}      team
		 * @param  {string}      id
		 * @param  {boolean}     isNt
		 * @return {HTMLElement}
		 */
		var buildContainer = function(team, id, isNt) {
			var buildTeamHeader = function() {
				let header = doc.createElement('h2');
				let link = doc.createElement('a');
				link.textContent = team;
				link.href = '/Club/NationalTeam/NationalTeam.aspx?teamId=' + id;
				header.appendChild(link);
				return header;
			};

			let container = doc.createElement('div');
			if (isNt)
				container.className = 'ft-nt-peek-nt';
			else
				container.className = 'ft-nt-peek-u20';

			let header = buildTeamHeader();
			container.appendChild(header);

			let matchesContainer = doc.createElement('div');
			Foxtrick.util.matchView.startLoad(matchesContainer);
			container.appendChild(matchesContainer);

			return container;
		};

		let leagueId = Foxtrick.Pages.All.getId(doc);

		// TODO type
		let league = Foxtrick.XMLData.League[leagueId];
		let hasCountry = league.Country.Available == 'True';
		if (!hasCountry)
			return;

		var ntId = league.NationalTeamId;
		var u20Id = league.U20TeamId;
		let ntName = Foxtrick.XMLData.getNTNameByLeagueId(leagueId);
		let u20Name = 'U-20 ' + ntName;

		let container = Foxtrick.createFeaturedElement(doc, module, 'div');
		container.className = 'ft-nt-peek';
		let insertBefore = Foxtrick.getMBElement(doc, 'ucForumSneakpeek_updSneakpeek');
		insertBefore.parentNode.insertBefore(container, insertBefore);

		// NT container
		var ntContainer = buildContainer(ntName, ntId, true);
		container.appendChild(ntContainer);

		// U20 container
		var u20Container = buildContainer(u20Name, u20Id, false);
		container.appendChild(u20Container);

		// separator
		let separator = doc.createElement('div');
		separator.className = 'separator';
		container.appendChild(separator);

		/** @type {CHPPParams} */
		let ntArgs = [
			['file', 'matches'],
			['version', '2.8'],
			['teamId', parseInt(ntId, 10)],
		];
		let ntArgStr = JSON.stringify(ntArgs);
		Foxtrick.util.api.retrieve(doc, ntArgs, { cache: 'default' }, (xml, errorText) => {
			let div = ntContainer.querySelector('div');
			let nextMatchDate =
				Foxtrick.util.matchView.fillMatches(div, xml, errorText);

			if (nextMatchDate)
				Foxtrick.util.api.setCacheLifetime(ntArgStr, getMatchEnd(nextMatchDate));
		});

		/** @type {CHPPParams} */
		let u20Args = [
			['file', 'matches'],
			['version', '2.8'],
			['teamId', parseInt(u20Id, 10)],
		];
		let u20ArgStr = JSON.stringify(u20Args);
		Foxtrick.util.api.retrieve(doc, u20Args, { cache: 'default' }, (xml, errorText) => {
			let div = u20Container.querySelector('div');
			let nextMatchDate = Foxtrick.util.matchView.fillMatches(div, xml, errorText);

			if (nextMatchDate)
				Foxtrick.util.api.setCacheLifetime(u20ArgStr, getMatchEnd(nextMatchDate));
		});
	},
};
