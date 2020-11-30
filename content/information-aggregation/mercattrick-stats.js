'use strict';

Foxtrick.modules['MercattrickStats'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['transferSearchResult'],
	OPTIONS: ['enableTLPage'],

	CSS: Foxtrick.InternalPath + 'resources/css/mercattrick-stats.css',
	IMAGES: {
		LOGO_SMALL: Foxtrick.InternalPath + 'resources/img/mercattrick/logo_small.png',
		LOGO_XSMALL: Foxtrick.InternalPath + 'resources/img/mercattrick/logo_xsmall.png',
		FILTERS: Foxtrick.InternalPath + 'resources/img/mercattrick/filters_count.png',
		BOOKMARKS: Foxtrick.InternalPath + 'resources/img/mercattrick/bookmarks_count.png',
	},
	title: 'Mercattrick Transfer Stats',
	skills: [],

	/**
	 * @param	{document}	doc
	 */
	run: function(doc) {
		if (Foxtrick.isPage(doc, 'transferSearchResult') &&
			Foxtrick.Prefs.isModuleOptionEnabled('MercattrickStats', 'enableTLPage')) {
			// no other pages for now
			this.runTL(doc);
		}
	},

	/**
	 * @param {document} doc
	 */
	runTL: async function(doc) {
		const module = this;

		var playerNodes = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);

		let ids = playerNodes.map(playerNode => playerNode.id);

		// get mercattrick stats
		var data = null;
		try {
			data = await Foxtrick.api.mercattrick.getPlayersStats(ids);
		}
		catch (err) {
			return;
		}

		if (!data)
			return;

		Foxtrick.forEach((p) => {
			const statObj = data.find(obj => obj.id === p.id);
			const filters = statObj ? statObj.filters_count : 0;
			const bookmarks = statObj ? statObj.bookmarks_count : 0;

			// creating element
			const container = Foxtrick.createFeaturedElement(doc, module, 'div');

			Foxtrick.addClass(container, 'ft-mercattrick-stats');

			let alt = Foxtrick.L10n.getString('MercattrickStats.title');
			Foxtrick.addImage(doc, container, {
				width: 21,
				height: 16,
				alt,
				title: alt,
				ariaLabel: alt,
				src: module.IMAGES.LOGO_XSMALL,
			});

			let link = doc.createElement('a');
			link.textContent = Foxtrick.L10n.getString('MercattrickStats.transfers');
			link.href = 'https://mercattrick.com';
			link.target = '_blank';
			link.rel = 'noopener';
			container.appendChild(link);
			container.appendChild(doc.createTextNode(' '));

			let statsSpan = doc.createElement('span');
			let stats = Foxtrick.L10n.getString('MercattrickStats.filtersAndBookmarks');
			stats = stats.replace(/%1/, filters).replace(/%2/, bookmarks);
			statsSpan.textContent = stats;
			container.appendChild(statsSpan);

			container.dataset.filters = filters;
			container.dataset.bookmarks = bookmarks;

			let entity = p.playerNode.querySelector('.transferPlayerInfo');
			entity.appendChild(container);
		}, playerNodes);
	},
};
