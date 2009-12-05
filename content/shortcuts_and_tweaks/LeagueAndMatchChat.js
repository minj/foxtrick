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
	NEW_AFTER_VERSION: "0.4.9.1",
	LATEST_CHANGE:"Added LeagueAndMatchChat",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	

	init : function() {
	},
	
	run : function( page, doc ) {  
	
	try { 
		if (page=='league') {
			var channel = "hattrick.org/league"+doc.location.href.replace(/.+leagueLevelUnitID=/i, "").match(/^\d+/)[0];
			var nick = doc.getElementById('teamLinks').getElementsByTagName('a')[0].innerHTML;
			var a= doc.createElement('a');
			a.href="javascript:(function(){window.open('http://embed.yaplet.com/?nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			var img = doc.createElement('img');
			img.border="0";
			img.src="chrome://foxtrick/content/resources/img/yaplet-chathere-b.png";
			a.appendChild(img);
			var sidebox=doc.getElementById('sidebar').getElementsByTagName('p')[0].parentNode;			
			sidebox.appendChild(a);
		}
		else if (page=='youthleague') {
			var channel = "hattrick.org/youthleague"+doc.location.href.replace(/.+YouthLeagueId=/i, "").match(/^\d+/)[0];
			var nick = doc.getElementById('teamLinks').getElementsByTagName('a')[0].innerHTML;
			var a= doc.createElement('a');
			a.href="javascript:(function(){window.open('http://embed.yaplet.com/?nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			var img = doc.createElement('img');
			img.border="0";
			img.src="chrome://foxtrick/content/resources/img/yaplet-chathere-b.png";
			a.appendChild(img);
			var sidebox=doc.getElementById('sidebar').getElementsByTagName('p')[0].parentNode;			
			sidebox.appendChild(a);
		}
		else if (page=='match') { 
			var channel = "hattrick.org/match"+doc.location.href.replace(/.+matchID=/i, "").match(/^\d+/)[0];
			var nick = doc.getElementById('teamLinks').getElementsByTagName('a')[0].innerHTML;
			var a= doc.createElement('a');
			a.href="javascript:(function(){window.open('http://embed.yaplet.com/?nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			var img = doc.createElement('img');
			img.border="0";
			img.src="chrome://foxtrick/content/resources/img/yaplet-chathere-b.png";
			a.appendChild(img);
			var h1 = doc.getElementById('mainBody').getElementsByTagName('h1')[0];			
			h1.appendChild(a);
		}
	} catch(e) {Foxtrick.dump('LeagueAndMatchChat: '+e+'\n');}
		
	},
	
	change : function( page, doc ) {
	},	
};