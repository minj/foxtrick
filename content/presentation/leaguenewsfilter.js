/**
 * leaguenewsfilter.js
 * filters to league news
 * @author convinced
 */

var FoxtrickLeagueNewsFilter = {
	MODULE_NAME : "LeagueNewsFilter",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('league'),
	RADIO_OPTIONS : new Array('all','friendlies','transfers','lineup_changes','PAs'),
	OPTIONS : new Array('highlight_set_lineup','highlight_wins','gray_bots'),

	run : function( page, doc ) {
		var newsfeed = doc.getElementById("ctl00_ctl00_CPContent_CPMain_repLLUFeed");
		var selectdiv=doc.createElement('div');
		selectdiv.setAttribute('style','display:block');
		selectdiv.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.LeagueNewsFilter.Filter")));
		selectdiv.appendChild(doc.createTextNode(' '));
		var select=doc.createElement('select');
		select.setAttribute("id","ft_ownselectboxID");
		Foxtrick.addEventListenerChangeSave(select, 'change',this.SelectClick,false);

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
		var option=doc.createElement('option');
		option.setAttribute('value','4');
		option.innerHTML=Foxtrickl10n.getString("foxtrick.LeagueNewsFilter.PAs");
		select.appendChild(option);
		select.value=FoxtrickPrefs.getInt("module." + this.MODULE_NAME + ".value");
		selectdiv.appendChild(select);

		newsfeed.parentNode.insertBefore(selectdiv,newsfeed.parentNode.firstChild);

		var lineupSet = new Array();
		var item=null;
		var items = newsfeed.getElementsByTagName('div');
		for (var i=0;i<items.length;++i) {
			item=items[i];
			if (item.className!='feedItem' && item.className!='feedItem user') continue;

			var as=item.getElementsByTagName('a');
			if (item.className=='feedItem user') { // 4 = PAs, className = 'feedItem user'
				item.setAttribute('ft_news','4');
			}
			else if (as.length==1 && item.className!='feedItem user') {	// 1 = friendlies, not above & one link
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
					// the title of match links contain full team name, no need to crop
					lineupSet.push(as[0].textContent);
				}
			}
		}

		if (select.value!=0) this.ShowHide(doc);

		// highlight teams with lineup
		var tables = doc.getElementById('mainBody').getElementsByTagName('table');
		// get bots/ownerless
		var bots = new Array();
		var teams = tables[0].getElementsByTagName('a');
		for (var i=0; i<teams.length; ++i) {
			if (teams[i].className && teams[i].className.search('shy')!=-1) {
				// the title of match links contain full team name, no need to crop
				bots.push(teams[i].textContent);
			}
		}

		for (var k=1; k<tables.length; ++k) {
			for (var i=1; i<5; ++i) {
				var link = tables[k].rows[i].cells[0].getElementsByTagName('a')[0];
				// lineup set
				if (Foxtrick.isModuleFeatureEnabled(this, 'highlight_set_lineup') && tables[k].rows[i].cells.length>=3 && tables[k].rows[i].cells[2].innerHTML.search(/\/Club\/Matches\/Live\.aspx\?actionType=addMatch/i)!=-1) {
					for (var j = 0; j < lineupSet.length; ++j) {
						var pos = link.title.search(Foxtrick.stringToRegExp(lineupSet[j]));
						if (pos == 0) {
							// home team has set lineup
							var reg = new RegExp(/(.+)&nbsp;-/);
							link.innerHTML = link.innerHTML.replace(reg, '<strong>$1</strong>&nbsp;-');
						}
						else if (pos > 0) {
							// away team has set lineup
							var reg = new RegExp(/-&nbsp;(.+)/);
							link.innerHTML = link.innerHTML.replace(reg, '-&nbsp;<strong>$1</strong>');
						}
					}
				}
				// bots
				if (Foxtrick.isModuleFeatureEnabled(this, 'gray_bots')) {
					for (var j = 0; j < bots.length; ++j) {
						var pos = link.title.search(Foxtrick.stringToRegExp(bots[j]));
						if (pos == 0) {
							// home team is bot
							var reg = new RegExp(/(.+)&nbsp;-/);
							link.innerHTML = link.innerHTML.replace(reg, '<span class="shy">$1</span>&nbsp;-');
						}
						else if (pos > 0) {
							// away team is bot
							var reg = new RegExp(/-&nbsp;(.+)/);
							link.innerHTML = link.innerHTML.replace(reg, '-&nbsp;<span class="shy">$1</span>');
						}
					}
				}
				if (Foxtrick.isModuleFeatureEnabled(this, 'highlight_wins') && tables[k].className.search('left')!=-1) {
					var goals = tables[k].rows[i].cells[1].innerHTML.replace(/&nbsp;/g,'').split('-');
					if (parseInt(goals[0]) > parseInt(goals[1])) {
						var reg = new RegExp(/(.+)\&nbsp;-/);
						link.innerHTML = link.innerHTML.replace(reg,'<strong>$1</strong>&nbsp;-');
					} else if (parseInt(goals[0]) < parseInt(goals[1])) {
						var reg = new RegExp(/\-&nbsp;(.+)/);
						link.innerHTML = link.innerHTML.replace(reg,'-&nbsp;<strong>$1</strong>');
					}
				}
			}
		}
	},

	ShowHide:function(doc) {
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
					if (feed_count==0) last_feed.style.display='none';
					else last_feed.style.display='block';
				}
				last_feed=item.previousSibling.previousSibling;
				feed_count=0;
			}
			// show selected
			if (selected==0 || item.getAttribute('ft_news')==selected) {
				item.style.display='block';
				++feed_count;
			}
			else item.style.display='none';
		}
		// show very last date if there was an entry shown for that date
		if (last_feed) {
			if (feed_count==0) last_feed.style.display='none';
			else last_feed.style.display='block';
		}
	},

	SelectClick : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			FoxtrickLeagueNewsFilter.ShowHide(doc);
		} catch (e) {Foxtrick.dump("FoxtrickLeagueNewsFilter_Select: "+e+'\n');}
	}
};
