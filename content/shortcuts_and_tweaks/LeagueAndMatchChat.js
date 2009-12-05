/**
* LeagueAndMatchChat.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickLeagueAndMatchChat = {

	MODULE_NAME : "LeagueAndMatchChat",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('league','youthleague','match'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.4.9.1",
	LATEST_CHANGE : "Added LeagueAndMatchChat",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS : new Array('OpenAsFrame'),

	init : function() {},
	
	run : function( page, doc ) {  
	
	try { 
		var icon="http://hattrick.org/favicon.ico";
		var wellcome="HTCHAT";
		
		if (page=='league') {
			var id=doc.location.href.replace(/.+leagueLevelUnitID=/i, "").match(/^\d+/)[0];
			var channel = "hattrick.org/league"+id;
			var nick = doc.getElementById('teamLinks').getElementsByTagName('a')[0].innerHTML;
			var a = doc.createElement('a');
			if (Foxtrick.isModuleFeatureEnabled(FoxtrickLeagueAndMatchChat,'OpenAsFrame')) 
					a.href = "javascript:void(location.href='http://go.yaplet.com/?b=3&url='+location.href+'&title="+wellcome+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"')";
			else  	a.href = "javascript:(function(){window.open('http://embed.yaplet.com/?title="+wellcome+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			a.title = "Open league chat " + id;
			var img = doc.createElement('img');
			img.border = "0";
			img.src = "chrome://foxtrick/content/resources/img/yaplet-chathere-b.png";
			a.appendChild(img);
			var sidebox_p = doc.getElementById('sidebar').getElementsByTagName('p')[0].parentNode;			
			sidebox_p.appendChild(a);
		}
		else if (page=='youthleague') {
			var id = doc.location.href.replace(/.+YouthLeagueId=/i, "").match(/^\d+/)[0];
			var channel = "hattrick.org/youthleague"+id;
			var nick = doc.getElementById('teamLinks').getElementsByTagName('a')[0].innerHTML;
			var a = doc.createElement('a');
			if (Foxtrick.isModuleFeatureEnabled(FoxtrickLeagueAndMatchChat,'OpenAsFrame')) 
					a.href = "javascript:void(location.href='http://go.yaplet.com/?b=3&url='+location.href+'&title="+wellcome+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"')";
			else  	a.href = "javascript:(function(){window.open('http://embed.yaplet.com/?title="+wellcome+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			a.title = "Open youthLeague chat " + id;
			var img = doc.createElement('img');
			img.border = "0";
			img.src = "chrome://foxtrick/content/resources/img/yaplet-chathere-b.png";
			a.appendChild(img);
			var sidebox_p = doc.getElementById('sidebar').getElementsByTagName('p')[0].parentNode;			
			sidebox_p.appendChild(a);
		}
		else if (page=='match') { 
			var id = doc.location.href.replace(/.+matchID=/i, "").match(/^\d+/)[0];
			var channel = "hattrick.org/match" + id;
			var nick = doc.getElementById('teamLinks').getElementsByTagName('a')[0].innerHTML;
			var a = doc.createElement('a');
			if (Foxtrick.isModuleFeatureEnabled(FoxtrickLeagueAndMatchChat,'OpenAsFrame')) 
					a.href = "javascript:void(location.href='http://go.yaplet.com/?b=3&url='+location.href+'&title="+wellcome+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"')";
			else  	a.href = "javascript:(function(){window.open('http://embed.yaplet.com/?title="+wellcome+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			a.title = "Open match chat " + id;
			var img = doc.createElement('img');
			img.border = "0";
			img.src = "chrome://foxtrick/content/resources/img/yaplet-chathere-b.png";
			a.appendChild(img);
			var h1 = doc.getElementById('mainBody').getElementsByTagName('h1')[0];			
			h1.appendChild(a);
		}
	} catch(e) {Foxtrick.dump('LeagueAndMatchChat: '+e+'\n');}
		
	},
	
	change : function( page, doc ) {
	},	
};