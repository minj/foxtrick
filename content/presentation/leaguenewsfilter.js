/**
 * leaguenewsfilter.js
 * filters to league news
 * @author convinced 
 */

var FoxtrickLeagueNewsFilter = {
	
    MODULE_NAME : "LeagueNewsFilter",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('league'), 
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.5.0.3",
	LATEST_CHANGE:"Highlight teams with lineups in next matches table. Highlight wins. Gray bots",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	RADIO_OPTIONS:new Array('all','friendlies','transfers','lineup_changes','PAs'),
	
    init : function() {
    },

    run : function( page, doc ) { 
	try{
	var newsfeed = doc.getElementById('ctl00_CPMain_repLLUFeed');
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
	
	var has_lineup = new Array();
	var item=null;
	var items = newsfeed.getElementsByTagName('div');
	for (var i=0;i<items.length;++i) {
		item=items[i];
		if (item.className!='feedItem' && item.className!='feedItem user') continue;

		var as=item.getElementsByTagName('a');
		if (item.className=='feedItem user') { // 4 = PAs, className = 'feedItem user'
			item.setAttribute('ft_news','4');
		}
		else if (as.length==1 && item.className!='feedItem user') {  // 1 = friendlies, not above & one link
			item.setAttribute('ft_news','1');
		}
		else if (as.length==2) {		// two links for transfers and lineup	
		
			var is_transfer= (as[0].href.search('PlayerID=')!=-1 ||		// is_transfer	= one link in a player link 
								as[1].href.search('PlayerID=')!=-1 );
			
			if (is_transfer ) {
				item.setAttribute('ft_news','2');
			}
			else if (as[1].href.search('javascript')==-1 ) {	// 3 = lineup changes, 2 links, second link not ShortPA link,not above
				item.setAttribute('ft_news','3');
				var namelength = (as[0].innerHTML.length<11)?as[0].innerHTML.length:11;
				has_lineup.push(as[0].innerHTML.substr(0,namelength));
			}
		}
	}

	if (select.value!=0) this.ShowHide(doc);

	// highlight teams with lineup
	var tables = doc.getElementById('mainBody').getElementsByTagName('table');
	// get bots/ownerless
	var is_bot = new Array();
	var teams = tables[0].getElementsByTagName('a'); 
	for (var i=0; i<teams.length; ++i) {
			if (teams[i].className && teams[i].className.search('shy')!=-1) {
				var namelength = (teams[i].innerHTML.length<11)?teams[i].innerHTML.length:11;
				is_bot.push(teams[i].innerHTML.substr(0,namelength));			
			}
	}		

    for (var k=1; k<tables.length; ++k) {
		for (var i=1; i<5; ++i) {
			var link = tables[k].rows[i].cells[0].getElementsByTagName('a')[0]; 

			link.innerHTML = link.innerHTML.replace(/ /g,'#');
			// lineup set
			if (tables[k].className.search('right')!=-1)  {		
			  for (var j=0; j<has_lineup.length; ++j) {
				var pos = link.innerHTML.search(has_lineup[j].replace(/ /g,'#'));
				//Foxtrick.dump(has_lineup[j]+' '+link.innerHTML+' '+pos+'\n');
				if (pos==0) {
					var reg = new RegExp(/(.+)\&nbsp;/); 
					link.innerHTML = link.innerHTML.replace(reg,'<b>$1</b>&nbsp;');
				}
				else if (pos>0) {
					var reg = new RegExp(/\-&nbsp;(.+)/); 					
					link.innerHTML = link.innerHTML.replace(reg,'-&nbsp;<b>$1</b>');
				}
			  }
			}
			// bots
			for (var j=0; j<is_bot.length; ++j) {
				var pos = link.innerHTML.search(is_bot[j].replace(/ /g,'#'));
				//Foxtrick.dump(is_bot[j]+' '+link.innerHTML+' '+pos+'\n');
				if (pos==0) {
					var reg = new RegExp(/(.+)\&nbsp;-/); 
					link.innerHTML = link.innerHTML.replace(reg,'<shy class="shy">$1</shy>&nbsp;-');
				}
				else if (pos>0) {
					var reg = new RegExp(/\-&nbsp;(.+)/); 					
					link.innerHTML = link.innerHTML.replace(reg,'-&nbsp;<shy class="shy">$1</shy>');
				}
			}
			if (tables[k].className.search('left')!=-1)  {		
				var goals = tables[k].rows[i].cells[1].innerHTML.replace(/&nbsp;/g,'').split('-');
				//Foxtrick.dump(parseInt(goals[0])+' '+parseInt(goals[1])+' '+(parseInt(goals[0])>parseInt(goals[1]))+'\n');
				if (parseInt(goals[0]) > parseInt(goals[1])) {
					var reg = new RegExp(/(.+)\&nbsp;-/); 
					link.innerHTML = link.innerHTML.replace(reg,'<b>$1</b>&nbsp;-');
				} else if (parseInt(goals[0]) < parseInt(goals[1])) {
					var reg = new RegExp(/\-&nbsp;(.+)/); 					
					link.innerHTML = link.innerHTML.replace(reg,'-&nbsp;<b>$1</b>');
				}				
			}
			
			link.innerHTML = link.innerHTML.replace(/#/g,'&nbsp;').replace(/&nbsp;-&nbsp;/g,' - ');
		} 		  		
	}
	
	} catch(e){Foxtrick.dump('leaguenewfilter: +'+e+'\n');}
	},
	
	ShowHide:function(doc) {
	try {
	var newsfeed = doc.getElementById('ctl00_CPMain_repLLUFeed');
	var selected=doc.getElementById('ft_ownselectboxID').value;

	var feed_count=0;
	var last_feed=null;
	var item=null;
	var items = newsfeed.getElementsByTagName('div');
	for (var i=0;i<items.length;++i) {
		item=items[i];
		if (item.className!='feedItem' && item.className!='feedItem user') continue;
		
		// show last date if there was an entry shown for that date
		if (item.previousSibling.previousSibling.className=='feed') {
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
	
	}catch(e){Foxtrick.dump('FoxtrickLeagueNewsFilter: '+e+'\n');} 
	},
	
	change : function( page, doc ) {	
	},
	
	SelectClick : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			FoxtrickLeagueNewsFilter.ShowHide(doc);		
		} catch (e) {Foxtrick.dump("FoxtrickLeagueNewsFilter_Select: "+e+'\n');}
	},
};




/**
 * leaguenewsfilter.js
 * short press anouncements
 * @author convinced 
 */

var FoxtrickShortPAs = {
	
    MODULE_NAME : "ShortPAs",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('league'), 
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.8.1",
	LATEST_CHANGE:"Fix for PAs with horizontal lines",
	
    init : function() {
    },
		
	run : function( page, doc ) {	
	var newsfeed = doc.getElementById('ctl00_CPMain_repLLUFeed');
	
	var items = newsfeed.getElementsByTagName('div');
	for (var i=0;i<items.length;++i) {
		var item=items[i];
		if (item.className!='feedItem user') continue;
		var body=item.innerHTML.replace(/.+<\/b>/,'');  //Foxtrick.dump(body+'\n');
		item.innerHTML=item.innerHTML.match(/.+<\/b>/); //Foxtrick.dump(item.innerHTML+'\n');
		var newdiv=doc.createElement('div');		
		newdiv.innerHTML=body;
		newdiv.style.display='none';
		item.appendChild(newdiv);
		var morediv=doc.createElement('div');
		var margin=10;
		if (Foxtrick.isStandardLayout(doc)) margin=27;
		var dir='right';
		if (Foxtrick.isRTLLayout(doc)) dir='left';		
		morediv.setAttribute('style',"position:absolute; display:inline; background-color:inherit;  padding-left:5px; "+dir+": "+margin+"px;");
		var a=doc.createElement('a');
		a.innerHTML=Foxtrickl10n.getString("foxtrick.ShortPAs.more");
		a.href='javascript:void(0);';
		Foxtrick.addEventListenerChangeSave(a, 'click',this.showfull,true);		
		morediv.appendChild(a);
		var b=item.getElementsByTagName('b')[0];
		b.parentNode.insertBefore(morediv,b.nextSibling);
		
	}
	},
	
	change : function( page, doc ) {	
	},

	showfull : function(ev) {
		ev.target.parentNode.nextSibling.style.display='block';
		ev.target.parentNode.style.display='none';	
	}
};

