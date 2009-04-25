/**
 * leaguenewsfilter.js
 * filters to league news
 * @author convinced 
 */

var FoxtrickLeagueNewsFilter = {
	
    MODULE_NAME : "LeagueNewsFilter",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.7",
	LASTEST_CHANGE:"Added filter for league news (default off)",
	RADIO_OPTIONS:new Array('all','friendlies','transfers','lineup_changes','PAs'),
	
    init : function() {
	Foxtrick.registerPageHandler( 'league', this);
    },

    run : function( page, doc ) { 
	var newsfeed = doc.getElementById('ctl00_CPMain_repLLUFeed');
	
	var selectdiv=doc.createElement('div');
	selectdiv.setAttribute('style','display:block');
	selectdiv.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.LeagueNewsFilter.Filter")));
	selectdiv.appendChild(doc.createTextNode(' '));
	var select=doc.createElement('select');
	select.setAttribute("id","ft_ownselectboxID");
	select.addEventListener('change',FoxtrickLeagueNewsFilter_Select,false);
	FoxtrickLeagueNewsFilter.ShowHide.doc=doc;
		
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
	newsfeed.insertBefore(selectdiv,newsfeed.firstChild);
	select.value=FoxtrickPrefs.getInt("module." + this.MODULE_NAME + ".value"); 
	selectdiv.appendChild(select);
	
	this.ShowHide();
	},
	
	ShowHide:function() {
	try {
	var doc=FoxtrickLeagueNewsFilter.ShowHide.doc;
	var newsfeed = doc.getElementById('ctl00_CPMain_repLLUFeed');
	var selected=doc.getElementById('ft_ownselectboxID').value;

	var feed_count=0;
	var last_feed=null;
	var item=null;
	var items = newsfeed.getElementsByTagName('div');
	for (var i=0;i<items.length;++i) {
		item=items[i];
		if (item.className!='feedItem' && item.className!='feedItem user') continue;
		if (item.previousSibling.previousSibling.className=='feed') {
			if (last_feed) {
				if (feed_count==0) last_feed.style.display='none';
				else last_feed.style.display='block';
			}
			last_feed=item.previousSibling.previousSibling;
			feed_count=0;
		}
		var as=item.getElementsByTagName('a');
		if (selected==0) {
			item.style.display='block';
			++feed_count;
		}
		else if (item.className=='feedItem user' && selected==4) {
			item.style.display='block';
			++feed_count;
		}
		else if (as.length==1 && selected==1 && item.className!='feedItem user') {
			item.style.display='block';
			++feed_count;
		}
		else if (as.length==2 && (selected==2 || selected==3)) {
			var is_transfer= (as[0].href.search('PlayerID=')!=-1 ||
								as[1].href.search('PlayerID=')!=-1 );
			
			if ( selected==2)  {
				if (is_transfer ) {
					item.style.display='block';
					++feed_count;
				}
				else item.style.display='none';
			}
			else if (!is_transfer ) {
					item.style.display='block';
					++feed_count;
				}
				else item.style.display='none';
			
		}
		else item.style.display='none';
		
	}
	if (last_feed) {
		if (feed_count==0) last_feed.style.display='none';
		else last_feed.style.display='block';
	}
	
	}catch(e){dump('FoxtrickLeagueNewsFilter: '+e+'\n');} 
	},
	
	change : function( page, doc ) {	
	}
};

function FoxtrickLeagueNewsFilter_Select(evt) {
	try {
		FoxtrickLeagueNewsFilter.ShowHide();		
	} catch (e) {dump("FoxtrickLeagueNewsFilter_Select: "+e+'\n');}
};



/**
 * leaguenewsfilter.js
 * short press anouncements
 * @author convinced 
 */

var FoxtrickShortPAs = {
	
    MODULE_NAME : "ShortPAs",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.7",
	LASTEST_CHANGE:"Added option to show expandable PA headers only",
	
    init : function() {
	Foxtrick.registerPageHandler( 'league', this);
    },
		
	run : function( page, doc ) {	
	var newsfeed = doc.getElementById('ctl00_CPMain_repLLUFeed');
	
	var items = newsfeed.getElementsByTagName('div');
	for (var i=0;i<items.length;++i) {
		item=items[i];
		if (item.className!='feedItem user') continue;
		var p=item.getElementsByTagName('p')[0];
		p.style.display='none';
		var morediv=doc.createElement('div');
		morediv.setAttribute('style',"position:absolute; display:inline; right: 10px;");
		var a=doc.createElement('a');
		a.innerHTML=Foxtrickl10n.getString("foxtrick.ShortPAs.more");
		a.href='javascript:void(0);';
		a.addEventListener('click',FoxtrickShortPAs_click,true);		
		morediv.appendChild(a);
		var b=item.getElementsByTagName('b')[0];
		b.parentNode.insertBefore(morediv,b.nextSibling);
		
	}
	},
	
	change : function( page, doc ) {	
	}
};

function FoxtrickShortPAs_click(ev) {
	ev.target.parentNode.nextSibling.style.display='block';
}