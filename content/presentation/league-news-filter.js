'use strict';
/**
 * league-news-filter.js
 * filters to league news
 * @author convinced
 */

Foxtrick.modules['LeagueNewsFilter'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['series'],
	RADIO_OPTIONS: ['all', 'friendlies', 'transfers', 'lineup_changes'],

	run: function(doc) {
		var showHide = function() {
			var newsfeed = Foxtrick.Pages.Series.getNewsFeed(doc);
			var selected = doc.getElementById('ft_ownselectboxID').value;

			var feed_count = 0;
			var last_feed = null;
			var item = null;
			var items = newsfeed.getElementsByTagName('div');
			for (var i = 0; i < items.length; ++i) {
				item = items[i];
				if (!Foxtrick.hasClass(item, 'feedItem'))
					continue;

				// show last date if there was an entry shown for that date
				if (Foxtrick.hasClass(item.previousSibling.previousSibling, 'feed')) {
					if (last_feed) {
						if (feed_count == 0) Foxtrick.addClass(last_feed, 'hidden');
						else Foxtrick.removeClass(last_feed, 'hidden');
					}
					last_feed = item.previousSibling.previousSibling;
					feed_count = 0;
				}
				// show selected
				if (selected == 0 || item.getAttribute('ft_news') == selected) {
					Foxtrick.removeClass(item, 'hidden');
					++feed_count;
				}
				else Foxtrick.addClass(item, 'hidden');
			}
			// show very last date if there was an entry shown for that date
			if (last_feed) {
				if (feed_count == 0) Foxtrick.addClass(last_feed, 'hidden');
				else Foxtrick.removeClass(last_feed, 'hidden');
			}
		};

		var newsfeed = Foxtrick.Pages.Series.getNewsFeed(doc);
		var selectdiv = Foxtrick.createFeaturedElement(doc, this, 'div');
		selectdiv.appendChild(doc.createTextNode(Foxtrick.L10n.getString('LeagueNewsFilter.label')));
		selectdiv.appendChild(doc.createTextNode(' '));
		var select = doc.createElement('select');
		select.setAttribute('id', 'ft_ownselectboxID');
		Foxtrick.listen(select, 'change', showHide, false);

		var option = doc.createElement('option');
		option.setAttribute('value', '0');
		option.textContent = Foxtrick.L10n.getString('LeagueNewsFilter.all');
		select.appendChild(option);
		var option = doc.createElement('option');
		option.setAttribute('value', '1');
		option.textContent = Foxtrick.L10n.getString('LeagueNewsFilter.friendlies');
		select.appendChild(option);
		var option = doc.createElement('option');
		option.setAttribute('value', '2');
		option.textContent = Foxtrick.L10n.getString('LeagueNewsFilter.transfers');
		select.appendChild(option);
		var option = doc.createElement('option');
		option.setAttribute('value', '3');
		option.textContent = Foxtrick.L10n.getString('LeagueNewsFilter.lineupChanges');
		select.appendChild(option);
		select.value = Foxtrick.Prefs.getInt('module.LeagueNewsFilter.value');
		selectdiv.appendChild(select);

		var h2 = newsfeed.parentNode.getElementsByTagName('h2')[0];
		newsfeed.parentNode.insertBefore(selectdiv, h2.nextSibling);

		var lineupSet = [];
		var item = null;
		var items = newsfeed.getElementsByTagName('div');
		for (var i = 0; i < items.length; ++i) {
			item = items[i];
			if (item.className != 'feedItem' && item.className != 'feedItem user')
				continue;

			var as = item.getElementsByTagName('a');
			if (as.length == 1 && item.className != 'feedItem user') {
				// 1 = friendlies, not above & one link
				item.setAttribute('ft_news', '1');
			}
			else if (as.length == 2) {		// two links for transfers and lineup
				var is_transfer = (as[0].href.search(/PlayerID=/i) != -1
					// is_transfer = one link in a player link
					|| as[1].href.search(/PlayerID=/i) != -1);
				if (is_transfer) {
					item.setAttribute('ft_news', '2');
				}
				else if (as[1].href.search('javascript') == -1) {
					// 3 = lineup changes, 2 links, second link not ShortPA link,not above
					item.setAttribute('ft_news', '3');
				}
			}
		}

		if (select.value != 0)
			showHide(doc);
	}
};
