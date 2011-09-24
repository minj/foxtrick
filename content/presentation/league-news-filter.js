/**
 * league-news-filter.js
 * filters to league news
 * @author convinced
 */

Foxtrick.util.module.register({
	MODULE_NAME : "LeagueNewsFilter",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["series"],
	RADIO_OPTIONS : new Array('all','friendlies','transfers','lineup_changes'),

	run : function(doc) {
		var showHide = function() {
			var newsfeed = doc.getElementById('ctl00_ctl00_CPContent_CPMain_repLLUFeed');
			var selected=doc.getElementById('ft_ownselectboxID').value;

			var feed_count=0;
			var last_feed=null;
			var item=null;
			var items = newsfeed.getElementsByTagName('div');
			for (var i=0;i<items.length;++i) {
				item=items[i];
				if (!Foxtrick.hasClass(item, "feedItem"))
					continue;

				// show last date if there was an entry shown for that date
				if (Foxtrick.hasClass(item.previousSibling.previousSibling, "feed")) {
					if (last_feed) {
						if (feed_count==0) Foxtrick.addClass(last_feed,'hidden');
						else Foxtrick.removeClass(last_feed,'hidden');
					}
					last_feed=item.previousSibling.previousSibling;
					feed_count=0;
				}
				// show selected
				if (selected==0 || item.getAttribute('ft_news')==selected) {
					Foxtrick.removeClass(item,'hidden');
					++feed_count;
				}
				else Foxtrick.addClass(item,'hidden');
			}
			// show very last date if there was an entry shown for that date
			if (last_feed) {
				if (feed_count==0) Foxtrick.addClass(last_feed,'hidden');
				else Foxtrick.removeClass(last_feed,'hidden');
			}
		};

		var newsfeed = doc.getElementById("ctl00_ctl00_CPContent_CPMain_repLLUFeed");
		var selectdiv=doc.createElement('div');
		selectdiv.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.LeagueNewsFilter.Filter")));
		selectdiv.appendChild(doc.createTextNode(' '));
		var select=doc.createElement('select');
		select.setAttribute("id","ft_ownselectboxID");
		Foxtrick.listen(select, 'change', showHide, false);

		var option=doc.createElement('option');
		option.setAttribute('value','0');
		option.innerHTML=Foxtrickl10n.getString("foxtrick.LeagueNewsFilter.all");
		select.appendChild(option);
		var option=doc.createElement('option');
		option.setAttribute('value','1');
		option.innerHTML=Foxtrickl10n.getString("foxtrick.LeagueNewsFilter.friendlies");
		select.appendChild(option);
		var option=doc.createElement('option');
		option.setAttribute('value','2');
		option.innerHTML=Foxtrickl10n.getString("foxtrick.LeagueNewsFilter.transfers");
		select.appendChild(option);
		var option=doc.createElement('option');
		option.setAttribute('value','3');
		option.innerHTML=Foxtrickl10n.getString("foxtrick.LeagueNewsFilter.lineup_changes");
		select.appendChild(option);
		select.value=FoxtrickPrefs.getInt("module.LeagueNewsFilter.value");
		selectdiv.appendChild(select);

		newsfeed.parentNode.insertBefore(selectdiv,newsfeed.parentNode.firstChild);

		var lineupSet = new Array();
		var item=null;
		var items = newsfeed.getElementsByTagName('div');
		for (var i=0;i<items.length;++i) {
			item=items[i];
			if (item.className!='feedItem' && item.className!='feedItem user') continue;

			var as=item.getElementsByTagName('a');
			if (as.length==1 && item.className!='feedItem user') {	// 1 = friendlies, not above & one link
				item.setAttribute('ft_news','1');
			}
			else if (as.length==2) {		// two links for transfers and lineup
				var is_transfer= (as[0].href.search('PlayerID=')!=-1 ||		// is_transfer	= one link in a player link
									as[1].href.search('PlayerID=')!=-1 );
				if (is_transfer) {
					item.setAttribute('ft_news','2');
				}
				else if (as[1].href.search('javascript')==-1 ) {	// 3 = lineup changes, 2 links, second link not ShortPA link,not above
					item.setAttribute('ft_news','3');
				}
			}
		}

		if (select.value!=0)
			showHide(doc);
	}
});
