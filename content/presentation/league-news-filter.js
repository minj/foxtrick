/**
 * league-news-filter.js
 * filters to league news
 * @author convinced, LA-MJ
 */

'use strict';

Foxtrick.modules.LeagueNewsFilter = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['series'],
	RADIO_OPTIONS: ['all', 'friendlies', 'transfers', 'lineupChanges'],

	/** @param {document} doc */
	// eslint-disable-next-line complexity
	run: function(doc) {
		const module = this;

		var showHide = function() {
			/** @type {HTMLSelectElement} */
			let select = doc.querySelector('#ft_ownselectboxID');
			let selected = select.value;
			let newsfeed = Foxtrick.Pages.Series.getNewsFeed(doc);

			let feedCount = 0;
			let lastFeed = null;

			let items = newsfeed.querySelectorAll('div');
			for (let item of items) {
				if (!Foxtrick.hasClass(item, 'feedItem'))
					continue;

				let previousItem = item.previousElementSibling;

				// show last date if there was an entry shown for that date
				if (Foxtrick.hasClass(previousItem, 'feed')) {
					if (lastFeed) {
						if (feedCount == 0)
							Foxtrick.addClass(lastFeed, 'hidden');
						else
							Foxtrick.removeClass(lastFeed, 'hidden');
					}
					lastFeed = previousItem;
					feedCount = 0;
				}

				// show selected
				if (selected == '0' || item.getAttribute('ft_news') == selected) {
					Foxtrick.removeClass(item, 'hidden');
					++feedCount;
				}
				else {
					Foxtrick.addClass(item, 'hidden');
				}
			}

			// show very last date if there was an entry shown for that date
			if (lastFeed) {
				if (feedCount == 0)
					Foxtrick.addClass(lastFeed, 'hidden');
				else
					Foxtrick.removeClass(lastFeed, 'hidden');
			}
		};

		let newsfeed = Foxtrick.Pages.Series.getNewsFeed(doc);
		if (!newsfeed)
			return;

		let selectdiv = Foxtrick.createFeaturedElement(doc, this, 'div');
		selectdiv.textContent = Foxtrick.L10n.getString('LeagueNewsFilter.label') + ' ';

		let select = doc.createElement('select');
		select.id = 'ft_ownselectboxID';
		Foxtrick.listen(select, 'change', showHide, false);

		for (let [val, opt] of module.RADIO_OPTIONS.entries()) {
			let option = doc.createElement('option');
			option.value = String(val);
			option.textContent = Foxtrick.L10n.getString(`${module.MODULE_NAME}.${opt}`);
			select.appendChild(option);
		}

		let val = Foxtrick.Prefs.getInt('module.LeagueNewsFilter.value');
		select.value = String(val);
		selectdiv.appendChild(select);

		let h2 = newsfeed.closest('.mainBox').querySelector('h2');
		newsfeed.parentNode.insertBefore(selectdiv, h2.nextSibling);

		let items = newsfeed.querySelectorAll('div');
		for (let item of items) {
			if (item.className != 'feedItem' && item.className != 'feedItem user')
				continue;

			let as = item.querySelectorAll('a');
			if (as.length == 1 && item.className != 'feedItem user') {
				// 1 = friendlies, not above & one link
				item.setAttribute('ft_news', '1');
			}
			else if (as.length == 2) {
				// two links for transfers and lineup
				let [first, second] = as;
				let isTransfer = // isTransfer = one link is a player link
					/PlayerID=/i.test(first.href) || /PlayerID=/i.test(second.href);

				if (isTransfer) {
					item.setAttribute('ft_news', '2');
				}
				else if (second.href.indexOf('javascript') == -1) {
					// 3 = lineup changes, 2 links, second link not ShortPA link, not above
					item.setAttribute('ft_news', '3');
				}
			}
		}

		if (select.value != '0')
			showHide();
	},
};
