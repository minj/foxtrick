/**
* LeagueAndMatchChat.js 
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickLeagueAndMatchChat = {

	MODULE_NAME : "LeagueAndMatchChat",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('league','youthleague','match','cupoverview','cupmatches','federation'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.0.1",
	LATEST_CHANGE : "Added LeagueAndMatchChat. Some Fixing",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS : new Array('OpenAsFrame','ChatNick'),
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("","Guest"),        
	OPTION_TEXTS_DISABLED_LIST : new Array(true,false),
	server:null,
	
	init : function() {},
	
	onclick : function(ev) { 
	try{ 
		var link = ev.target.parentNode; 
		if (link.id=='yapCloseLink') { 
			if (ev.target.ownerDocument.location.href.match(/nobalance=(\d+)/)[1]=='1') ev.target.parentNode.href='javascript:window.top.location="'+FoxtrickLeagueAndMatchChat.server+'"';
		}
		else if (link.id=='yapPopLink') { 
			if (ev.target.ownerDocument.location.href.match(/nobalance=(\d+)/)[1]=='1') ev.target.parentNode.href='javascript:page="'+FoxtrickLeagueAndMatchChat.server+'";'+ev.target.parentNode.href.replace(/javascript:/g,'');
		}
		
	} catch(e){Foxtrick.dump(e+'\n')}
	},
	
	
	run : function( page, doc ) {  
	try { 

		// fixing yaplet close link
		this.server = doc.location.href; 		
		if (Foxtrick.BuildFor=='Chrome') {
			portchatoldserver.postMessage({reqtype: "set_last_server", lastserver: FoxtrickLeagueAndMatchChat.server});
		}
		else {
			window.removeEventListener('click',FoxtrickLeagueAndMatchChat.onclick,false);
			window.addEventListener('click',FoxtrickLeagueAndMatchChat.onclick,false);
		}
		
		var icon="http://hattrick.org/App_Themes/Simple/logo_green.png";
		var icon2 = "http://hattrick.org/favicon.ico";

		var teamlinks = doc.getElementById('teamLinks').getElementsByTagName('a');
		if (teamlinks.length) var nick = teamlinks[0].innerHTML;
		else var nick='Guest';
		if (Foxtrick.isModuleFeatureEnabled(this,'ChatNick') && FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "ChatNick_text") && FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "ChatNick_text")!='')
					nick = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "ChatNick_text");
		
		if (page=='league') {
			var id=doc.location.href.replace(/.+leagueLevelUnitID=/i, "").match(/^\d+/)[0];
			var channel = "hattrick.org/league"+id;
			var a = doc.createElement('a');
			if (Foxtrick.isModuleFeatureEnabled(FoxtrickLeagueAndMatchChat,'OpenAsFrame')) 
					a.href = "javascript:void(location.href='http://go.yaplet.com/?b=3&url='+location.href+'&title="+channel+"&yapletlogo="+icon2+ "&nick="+nick+"&channel="+channel+"')";
			else  	a.href = "javascript:(function(){window.open('http://embed.yaplet.com/?title="+channel+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			a.innerHTML = Foxtrickl10n.getString('foxtrick.LeagueAndMatchChat.LeagueChat');
			// add after forum <p> 
			var sidebox_p = doc.getElementById('sidebar').getElementsByTagName('p')[0].parentNode;			
			sidebox_p.appendChild(a);
		}
		else if (page=='youthleague') {
			var id = doc.location.href.replace(/.+YouthLeagueId=/i, "").match(/^\d+/)[0];
			var channel = "hattrick.org/youthleague"+id;
			var a = doc.createElement('a');
			if (Foxtrick.isModuleFeatureEnabled(FoxtrickLeagueAndMatchChat,'OpenAsFrame')) 
					a.href = "javascript:void(location.href='http://go.yaplet.com/?b=3&url='+location.href+'&title="+channel+"&yapletlogo="+icon2+ "&nick="+nick+"&channel="+channel+"')";
			else  	a.href = "javascript:(function(){window.open('http://embed.yaplet.com/?title="+channel+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			a.innerHTML = Foxtrickl10n.getString('foxtrick.LeagueAndMatchChat.LeagueChat');
			// add after forum <p> 
			var sidebox_p = doc.getElementById('sidebar').getElementsByTagName('p')[0].parentNode;			
			sidebox_p.appendChild(a);
		}
		else if (page=='match') { 
			var id = doc.location.href.replace(/.+matchID=/i, "").match(/^\d+/)[0];
			var channel = "hattrick.org/match" + id;
			var a = doc.createElement('a');
			if (Foxtrick.isModuleFeatureEnabled(FoxtrickLeagueAndMatchChat,'OpenAsFrame')) 
					a.href = "javascript:void(location.href='http://go.yaplet.com/?b=3&url='+location.href+'&title="+channel+"&yapletlogo="+icon2+ "&nick="+nick+"&channel="+channel+"')";
			else  	a.href = "javascript:(function(){window.open('http://embed.yaplet.com/?title="+channel+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			a.innerHTML = Foxtrickl10n.getString('foxtrick.LeagueAndMatchChat.MatchChat');
			// add to date
			var date = doc.getElementById('mainBody').getElementsByTagName('h1')[0].nextSibling.nextSibling;
			date.appendChild(doc.createTextNode(' '));
			date.appendChild(a);
		}
		else if (page=='cupoverview' || page=='cupmatches') { 
			var id = doc.location.href.replace(/.+CupID=/i, "").match(/^\d+/)[0];
			var channel = "hattrick.org/nationalcup" + id;
			var a = doc.createElement('a');
			if (Foxtrick.isModuleFeatureEnabled(FoxtrickLeagueAndMatchChat,'OpenAsFrame')) 
					a.href = "javascript:void(location.href='http://go.yaplet.com/?b=3&url='+location.href+'&title="+channel+"&yapletlogo="+icon2+ "&nick="+nick+"&channel="+channel+"')";
			else  	a.href = "javascript:(function(){window.open('http://embed.yaplet.com/?title="+channel+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			a.innerHTML = Foxtrickl10n.getString('foxtrick.LeagueAndMatchChat.CupChat');
			var p = doc.createElement('p');
			p.appendChild(a);
			// add after header
			var h1 = doc.getElementById('mainBody').getElementsByTagName('h1')[0];
			h1.parentNode.insertBefore(p,h1.nextSibling);
		}
		else if (page=='federation') { 
			var id = doc.location.href.replace(/.+AllianceID=/i, "").match(/^\d+/)[0];
			var channel = "hattrick.org/federation" + id;
			var a = doc.createElement('a');
			if (Foxtrick.isModuleFeatureEnabled(FoxtrickLeagueAndMatchChat,'OpenAsFrame')) 
					a.href = "javascript:void(location.href='http://go.yaplet.com/?b=3&url='+location.href+'&title="+channel+"&yapletlogo="+icon2+ "&nick="+nick+"&channel="+channel+"')";
			else  	a.href = "javascript:(function(){window.open('http://embed.yaplet.com/?title="+channel+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			a.innerHTML = Foxtrickl10n.getString('foxtrick.LeagueAndMatchChat.FederationChat');
			// add to first sidebox
			var sidebox1_a = doc.getElementById('sidebar').getElementsByTagName('div')[0].getElementsByTagName('a');
			var lasta = sidebox1_a[sidebox1_a.length-1];			
			lasta.parentNode.insertBefore(a,lasta.nextSibling);		
		}
		
		
	} catch(e) {Foxtrick.dump('LeagueAndMatchChat: '+e+'\n');}
		
	},
	
	change : function( page, doc ) {
	},	
};


if (Foxtrick.BuildFor=='Chrome') {
var portchatoldserver = chrome.extension.connect({name: "chatoldserver"});

portchatoldserver.onMessage.addListener(function(msg) { 
	if (msg.response=='lastserver') {   
		FoxtrickLeagueAndMatchChat.server = msg.lastserver;
		window.addEventListener('click',FoxtrickLeagueAndMatchChat.onclick,false);
	} 
});

if (document.location.href.search(/.+\.yaplet.com/)!=-1) {
	portchatoldserver.postMessage({reqtype: "get_last_server"});
}

}

