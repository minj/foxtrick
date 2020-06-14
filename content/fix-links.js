/**
 * fix-links.js
 * Add various parameters to standartise HT links
 * @author LA-MJ
 */

'use strict';

Foxtrick.modules.FixLinks = {
	CORE_MODULE: true,
	PAGES: [
		'match',
		'matches', 'matchesArchive', 'matchesCup',
		'playerStats',
		'matchesLatest',
		'players', 'youthPlayers',
	],
	NICE: -20, // place before all DOM mutating modules

	/**
	 * @param  {string}  originalUrl
	 * @param  {string}  param
	 * @param  {any}     value
	 * @param  {boolean} [replace]
	 * @return {string}
	 */
	addParam: function(originalUrl, param, value, replace) {
		let parts = originalUrl.split('#'), [url, anchor] = parts;

		let p = encodeURIComponent(param);
		let v = encodeURIComponent(String(value));

		let reStr = Foxtrick.strToRe(p);
		let paramRe = new RegExp('([&?])' + reStr + '=[^&]*?&?', 'i');

		if (!replace && paramRe.test(url))
			return originalUrl;

		url = url.replace(paramRe, '$1');
		url = url.replace(/\?$/, ''); // strip ? if query was emptied

		url += (/\?/.test(url) ? '&' : '?') + `${p}=${v}` + (anchor ? '#' + anchor : '');
		return url;
	},

	/**
	 * @param  {string} url
	 * @param  {string} anchor
	 * @return {string}
	 */
	addAnchor: function(url, anchor) {
		let [baseUrl] = url.split('#');
		return `${baseUrl}#${encodeURIComponent(anchor)}`;
	},

	/**
	 * @param  {string} url
	 * @param  {number} teamId
	 * @param  {number} [youthTeamId]
	 * @return {string}
	 */
	addTeamId: function(url, teamId, youthTeamId) {
		let newUrl = this.addParam(url, 'teamId', teamId);
		if (youthTeamId)
			newUrl = this.addParam(newUrl, 'youthTeamId', youthTeamId);

		return newUrl;
	},

	/**
	 * @param  {HTMLAnchorElement} link
	 * @param  {number} teamId
	 * @param  {number} [youthTeamId]
	 */
	fixLineupLink: function(link, teamId, youthTeamId) {
		let url = this.addTeamId(link.href, teamId, youthTeamId);
		url = this.addAnchor(url, 'tab2');
		link.href = url;
	},

	/**
	 * @param  {HTMLAnchorElement} link
	 * @param  {number} playerId
	 */
	addPlayerHighlight: function(link, playerId) {
		let url = this.addParam(link.href, 'HighlightPlayerID', playerId);
		link.href = url;
	},

	/**
	 * @param  {document} doc
	 * @return {number?}
	 */
	getMenuTeamId: function(doc) {
		/** @type {HTMLAnchorElement} */
		let teamLink = doc.querySelector('.subMenu a[href*="TeamID="]');
		if (teamLink)
			return Foxtrick.util.id.getTeamIdFromUrl(teamLink.href);

		return null;
	},

	/**
	 * @param  {document} doc
	 * @return {number}
	 */
	getDefaultTeamId: function(doc) {
		return Foxtrick.util.id.getTeamIdFromUrl(doc.location.href) ||
			this.getMenuTeamId(doc) ||
			Foxtrick.util.id.getOwnTeamId();
	},

	/**
	 * @param  {document} doc
	 * @return {number?}
	 */
	getYouthTeamId: function(doc) {
		let youthId = Foxtrick.util.id.getYouthTeamIdFromUrl(doc.location.href);
		if (!youthId) {
			let menu = doc.querySelector('.subMenu');
			youthId = menu ? Foxtrick.util.id.findYouthTeamId(menu) : null;
		}
		return youthId;
	},

	/** @param {document} doc */
	parseMatchPage: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc) || Foxtrick.Pages.Match.inProgress(doc))
			return;

		const module = this;
		const url = doc.location.href;
		const docAnchor = url.match(/#.*/);

		const PARAMS_TO_SAVE = {
			teamId: Foxtrick.util.id.getTeamIdFromUrl(url),
			youthTeamId: Foxtrick.util.id.getYouthTeamIdFromUrl(url),
			HighlightPlayerID: Foxtrick.getUrlParam(url, 'HighlightPlayerID'),
			BrowseIds: Foxtrick.getUrlParam(url, 'BrowseIds'),
		};

		/** @param {HTMLAnchorElement} link */
		var saveParams = function(link) {
			let url = link.href;
			for (let p in PARAMS_TO_SAVE) {
				if (PARAMS_TO_SAVE[p])
					url = module.addParam(url, p, PARAMS_TO_SAVE[p]);
			}

			link.href = url;
		};

		/** @type {NodeListOf<HTMLAnchorElement>} */
		let browseLinks = doc.querySelectorAll('.speedBrowser a');
		Foxtrick.forEach(function(link) {
			saveParams(link);
			Foxtrick.onClick(link, function() {
				// eslint-disable-next-line no-invalid-this
				let linkAnchor = this.href.match(/#.*/);
				if (!linkAnchor && docAnchor)
					link.href += docAnchor[0];
			});
		}, browseLinks);

		let id = module.getDefaultTeamId(doc);
		let isYouth = Foxtrick.Pages.Match.isYouth(doc);

		/** @type {NodeListOf<HTMLAnchorElement>} */
		let links = doc.querySelectorAll('div.boxHead a');
		Foxtrick.forEach(saveParams, links);

		/** @type {NodeListOf<HTMLAnchorElement>} */
		let matchLinks = doc.querySelectorAll('#oldMatchRatings th a');
		Foxtrick.forEach(function(link) {
			if (isYouth)
				module.fixLineupLink(link, id, Foxtrick.Pages.Match.getHomeTeamId(doc));
			else
				module.fixLineupLink(link, Foxtrick.Pages.Match.getHomeTeamId(doc));

			saveParams(link);
		}, matchLinks);
	},

	/** @param {document} doc */
	parseMatchesPage: function(doc) {
		const module = this;

		const id = module.getDefaultTeamId(doc);
		const isYouth = Foxtrick.Pages.All.isYouth(doc);
		const youthTeamId = isYouth ? module.getYouthTeamId(doc) : null;

		var table = doc.querySelector('#mainBody table');
		if (!table)
			return;

		/** @type {HTMLAnchorElement} */
		let browser = table.querySelector('a[href*="BrowseIds"]');
		let browseIds = browser ? Foxtrick.getUrlParam(browser.href, 'BrowseIds') : null;

		let lineupImgs = table.querySelectorAll('img.matchOrder');
		Foxtrick.forEach(function(lineupImg) {
			let link = lineupImg.closest('a');
			module.fixLineupLink(link, id, youthTeamId);

			if (browseIds)
				link.href = module.addParam(link.href, 'BrowseIds', browseIds);

			if (youthTeamId) {
				// add youthTeamId to report link
				let row = link.closest('tr');
				let rowLinks = row.querySelectorAll('a');
				let reportLink = Foxtrick.nth(function(a) {
					return a.href && /Match\.aspx/.test(a.href) && !/#/.test(a.href);
				}, rowLinks);

				reportLink.href = module.addParam(reportLink.href, 'youthTeamId', youthTeamId);
			}
		}, lineupImgs);
	},

	/** @param {document} doc */
	parsePlayerStats: function(doc) {
		// TODO test
		const module = this;

		const OPEN_NEW = Foxtrick.L10n.getString('button.open_new');
		const table = Foxtrick.getMBElement(doc, 'pnlAlltidMatches');

		/**
		 * @param {HTMLImageElement} icon
		 * @param {string} url
		 */
		var addLinkToMatchIcon = function(icon, url) {
			// don't modify icon className so as not to interfere with player-stats-xp
			let parent = icon.closest('span');
			Foxtrick.addClass(parent, 'ft-link');

			icon.title += '\n' + OPEN_NEW;
			icon.dataset.url = url;
			Foxtrick.onClick(icon, function() {
				// eslint-disable-next-line no-invalid-this
				Foxtrick.newTab(this.dataset.url);
			});
		};

		let id = module.getDefaultTeamId(doc);
		let pid = parseInt(Foxtrick.getUrlParam(doc.URL, 'PlayerID'), 10);

		/** @type {NodeListOf<HTMLImageElement>} */
		let icons = table.querySelectorAll('.iconMatchtype img');

		let links = table.querySelectorAll('a');
		Foxtrick.forEach(function(icon, i) {
			let link = links[i];

			module.fixLineupLink(link, id);
			module.addPlayerHighlight(link, pid);
			addLinkToMatchIcon(icon, link.href);
		}, icons);
	},

	/** @param {document} doc */
	parseH2HLatestMatches: function(doc) {
		// TODO test
		const module = this;

		const homeId = parseInt(Foxtrick.getUrlParam(doc.location.href, 'HomeTeamID'), 10);
		const awayId = parseInt(Foxtrick.getUrlParam(doc.location.href, 'AwayTeamID'), 10);

		let heads = [...doc.querySelectorAll('#mainBody th')];
		let [home, away] = heads.map(h => h.textContent.trim());
		let [homeRe, awayRe] = [home, away].map(t => new RegExp('^' + Foxtrick.strToRe(t)));

		/**
		 * add ids to lineup-links if away; we don't care about third-party teams
		 * @param {HTMLAnchorElement} lineupLink
		 * @param {number} teamId
		 * @param {HTMLAnchorElement} matchLink
		 * @param {RegExp} teamRe
		 */
		var addTeamIdForAwayGame = function(lineupLink, teamId, matchLink, teamRe) {
			if (teamRe.test(matchLink.textContent.trim()))
				return;

			// home team name does not match
			// assume away game
			lineupLink.href = module.addParam(lineupLink.href, 'teamId', teamId);
		};

		/** @type {NodeListOf<HTMLAnchorElement>} */
		let links = doc.querySelectorAll('#mainBody td.left a');

		/* eslint-disable no-magic-numbers */
		// links go in cycles of 6
		// home team match: match-link, match-home-lineup-link, match-away-lineup-link
		// away team match: match-link, match-home-lineup-link, match-away-lineup-link
		for (let i = 0; i < links.length; i += 6) {
			// add ids to match-links first
			let homeTeamMatch = links[i], awayTeamMatch = links[i + 3];
			homeTeamMatch.href = module.addParam(homeTeamMatch.href, 'teamId', homeId);
			awayTeamMatch.href = module.addParam(awayTeamMatch.href, 'teamId', awayId);

			let homeTeamLineup = links[i + 2], awayTeamLineup = links[i + 5];
			addTeamIdForAwayGame(homeTeamLineup, homeId, homeTeamMatch, homeRe);
			addTeamIdForAwayGame(awayTeamLineup, awayId, awayTeamMatch, awayRe);
		}
		/* eslint-enable no-magic-numbers */
	},

	/** @param {document} doc */
	parsePlayers: function(doc) {
		const module = this;

		const id = module.getMenuTeamId(doc);
		const isYouth = Foxtrick.isPage(doc, 'youthPlayers');
		const youthId = isYouth ? module.getYouthTeamId(doc) : null;

		let players = doc.querySelectorAll('.playerInfo');
		Foxtrick.forEach(function(p) {
			let pid = Foxtrick.util.id.findPlayerId(p);

			/** @type {HTMLAnchorElement} */
			let matchLink = p.querySelector('a[href^="/Club/Matches/Match.aspx"]');
			if (!matchLink)
				return;

			module.fixLineupLink(matchLink, id, youthId);
			module.addPlayerHighlight(matchLink, pid);
		}, players);
	},

	/** @param {document} doc */
	run: function(doc) {

		if (Foxtrick.isPage(doc, 'match')) {
			// this might be a bit annoying as it causes match page to reload
			this.parseMatchPage(doc);
		}
		else if (Foxtrick.isPage(doc, ['matches', 'matchesCup', 'matchesArchive'])) {
			this.parseMatchesPage(doc);
		}
		else if (Foxtrick.isPage(doc, 'playerStats')) {
			this.parsePlayerStats(doc);
		}
		else if (Foxtrick.isPage(doc, 'matchesLatest')) {
			this.parseH2HLatestMatches(doc);
		}
		else if (Foxtrick.isPage(doc, ['players', 'youthPlayers'])) {
			this.parsePlayers(doc);
		}
	},
};
