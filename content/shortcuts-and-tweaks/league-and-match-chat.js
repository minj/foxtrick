/**
* league-and-match-chat.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickLeagueAndMatchChat = {
	MODULE_NAME : "LeagueAndMatchChat",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ['league','youthleague','match','cupoverview','cupmatches','federation'],
	OPTIONS : ['OpenYapletPopup','OpenGabblyPopup','ChatNick'],
	OPTION_TEXTS : true,
	OPTION_TEXTS_DISABLED_LIST : [true,true,true,false],
	server:null,

	run : function(doc) {
		var icon="http://hattrick.org/App_Themes/Simple/logo_green.png";
		var icon2 = "http://hattrick.org/favicon.ico";

		var nick = FoxtrickCore.getSelfTeamInfo().teamName; 
		if (!nick) nick='Guest';
		if (FoxtrickPrefs.isModuleOptionEnabled("LeagueAndMatchChat",'ChatNick')
			&& FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "ChatNick_text")
			&& FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "ChatNick_text")!='')
			nick = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "ChatNick_text");

		if (Foxtrick.isPage("league", doc)) {
			var id=doc.location.href.replace(/.+leagueLevelUnitID=/i, "").match(/^\d+/)[0];
			var channel = "hattrick.org/league"+id;
			var popupid =  "hattrick_org_league_"+id;
			var a = doc.createElement('a');
			if (FoxtrickPrefs.isModuleOptionEnabled("LeagueAndMatchChat",'OpenYapletPopup'))
					a.href = "javascript:(function(){window.open('http://embed.yaplet.com/?title="+channel+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			else {
				a.href="http://cw.gabbly.com/gabbly/cw.jsp?e=1&t="+channel+"&nick="+nick;
				a.setAttribute('target',popupid);
				a.setAttribute('onclick',"window.open('http://cw.gabbly.com/gabbly/cw.jsp?e=1&t="+channel+"&nick="+nick+"', '"+popupid+"', 'width=400,height=500'); return false");
			}
			a.innerHTML = Foxtrickl10n.getString('foxtrick.LeagueAndMatchChat.LeagueChat');
			// add after forum <p>
			var sidebox_p = doc.getElementById('sidebar').getElementsByTagName('p')[0].parentNode;
			sidebox_p.appendChild(a);
		}
		else if (Foxtrick.isPage("youthleague", doc)) {
			var id = doc.location.href.replace(/.+YouthLeagueId=/i, "").match(/^\d+/)[0];
			var channel = "hattrick.org/youthleague"+id;
			var popupid =  "hattrick_org_youthleague_"+id;
			var a = doc.createElement('a');
			if (FoxtrickPrefs.isModuleOptionEnabled("LeagueAndMatchChat",'OpenYapletPopup'))
					a.href = "javascript:(function(){window.open('http://embed.yaplet.com/?title="+channel+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			else {
				a.href="http://cw.gabbly.com/gabbly/cw.jsp?e=1&t="+channel+"&nick="+nick;
				a.setAttribute('target',popupid);
				a.setAttribute('onclick',"window.open('http://cw.gabbly.com/gabbly/cw.jsp?e=1&t="+channel+"&nick="+nick+"', '"+popupid+"', 'width=400,height=500'); return false");
			}
			a.innerHTML = Foxtrickl10n.getString('foxtrick.LeagueAndMatchChat.LeagueChat');
			// add after forum <p>
			var sidebox_p = doc.getElementById('sidebar').getElementsByTagName('p')[0].parentNode;
			sidebox_p.appendChild(a);
		}
		else if (Foxtrick.isPage("match", doc)) {
			var id = doc.location.href.replace(/.+matchID=/i, "").match(/^\d+/)[0];
			var channel = "hattrick.org/match" + id;
			var popupid =  "hattrick_org_match_"+id;
			var a = doc.createElement('a');
			if (FoxtrickPrefs.isModuleOptionEnabled("LeagueAndMatchChat",'OpenYapletPopup'))
					a.href = "javascript:(function(){window.open('http://embed.yaplet.com/?title="+channel+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			else {
				a.href="http://cw.gabbly.com/gabbly/cw.jsp?e=1&t="+channel+"&nick="+nick;
				a.setAttribute('target',popupid);
				a.setAttribute('onclick',"window.open('http://cw.gabbly.com/gabbly/cw.jsp?e=1&t="+channel+"&nick="+nick+"', '"+popupid+"', 'width=400,height=500'); return false");
			}
			a.innerHTML = Foxtrickl10n.getString('foxtrick.LeagueAndMatchChat.MatchChat');
			// add to date
			var date = doc.getElementById('mainBody').getElementsByTagName('h1')[0].nextSibling.nextSibling;
			date.appendChild(doc.createTextNode(' '));
			date.appendChild(a);
		}
		else if (Foxtrick.isPage("cupoverview", doc)
			|| Foxtrick.isPage("cupmatches", doc)) {
			var id = doc.location.href.replace(/.+CupID=/i, "").match(/^\d+/)[0];
			var channel = "hattrick.org/nationalcup" + id;
			var popupid =  "hattrick_org_nationalcup_"+id;
			var a = doc.createElement('a');
			if (FoxtrickPrefs.isModuleOptionEnabled("LeagueAndMatchChat",'OpenYapletPopup'))
					a.href = "javascript:(function(){window.open('http://embed.yaplet.com/?title="+channel+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			else {
				a.href="http://cw.gabbly.com/gabbly/cw.jsp?e=1&t="+channel+"&nick="+nick;
				a.setAttribute('target',popupid);
				a.setAttribute('onclick',"window.open('http://cw.gabbly.com/gabbly/cw.jsp?e=1&t="+channel+"&nick="+nick+"', '"+popupid+"', 'width=400,height=500'); return false");
			}
			a.innerHTML = Foxtrickl10n.getString('foxtrick.LeagueAndMatchChat.CupChat');
			var p = doc.createElement('p');
			p.appendChild(a);
			// add after header
			var h1 = doc.getElementById('mainBody').getElementsByTagName('h1')[0];
			h1.parentNode.insertBefore(p,h1.nextSibling);
		}
		else if (Foxtrick.isPage("federation", doc)) {
			var id = doc.location.href.replace(/.+AllianceID=/i, "").match(/^\d+/)[0];
			var channel = "hattrick.org/federation" + id;
			var popupid =  "hattrick_org_federation_"+id;
			var a = doc.createElement('a');
			if (FoxtrickPrefs.isModuleOptionEnabled("LeagueAndMatchChat",'OpenYapletPopup'))
					a.href = "javascript:(function(){window.open('http://embed.yaplet.com/?title="+channel+"&yapletlogo="+icon+ "&nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			else {
				a.href="http://cw.gabbly.com/gabbly/cw.jsp?e=1&t="+channel+"&nick="+nick;
				a.setAttribute('target',popupid);
				a.setAttribute('onclick',"window.open('http://cw.gabbly.com/gabbly/cw.jsp?e=1&t="+channel+"&nick="+nick+"', '"+popupid+"', 'width=400,height=500'); return false");
			}
			a.innerHTML = Foxtrickl10n.getString('foxtrick.LeagueAndMatchChat.FederationChat');
			// add to first sidebox
			var sidebox1_a = doc.getElementById('sidebar').getElementsByTagName('div')[0].getElementsByTagName('a');
			var lasta = sidebox1_a[sidebox1_a.length-1];
			lasta.parentNode.insertBefore(a,lasta.nextSibling);
		}
	}
};
Foxtrick.util.module.register(FoxtrickLeagueAndMatchChat);
