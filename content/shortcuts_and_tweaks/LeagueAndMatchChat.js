/**
* LeagueAndMatchChat.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickLeagueAndMatchChat = {

	MODULE_NAME : "LeagueAndMatchChat",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('league','youthleague','matchesLive'), 
	DEFAULT_ENABLED : true,
	

	init : function() {
	},
	
	run : function( page, doc ) {  
	
		try { 
		if (page=='league' || page=='youthleague') {
			var h2 = doc.getElementById('mainWrapper').getElementsByTagName('h2')[0];
			var leagueid = FoxtrickHelper.findLeagueLeveUnitId(h2);		
			var channel = "hattrick.org/league"+leagueid;
			var nick = FoxtrickHelper.extractTeamName(doc.getElementById('teamLinks'));
			var sidebox=doc.getElementById('sidebar').getElementsByTagName('p')[0].parentNode;
			var a= doc.createElement('a');
			a.href="javascript:(function(){window.open('http://embed.yaplet.com/?nick="+nick+"&channel="+channel+"','','width=300,height=500,resizable=yes,scrollbars=no,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no')})()";
			var img = doc.createElement('img');
			img.border="0";
			img.src="http://buttons.yaplet.com/images/buttons/yaplet-chathere-b.png";
			a.appendChild(img);
			sidebox.appendChild(a);
	
		}
		/*else if (page=='matchesLive') {
			var imgs=doc.getElementById('mainBody').getElementsByTagName('img'); 
			var img=null,i=0;
			while (img=imgs[i++])  {if (img.src.search(/weather/i)!=-1) break;}
			if (img!=null) {
				var matchID=FoxtrickHelper.findMatchId(doc.getElementById('mainWrapper').getElementsByTagName('h2')[0]);								
				var a=doc.createElement('a');
				a.href="/Club/Matches/Live.aspx?actionType=addMatch&matchID="+matchID;
				a.innerHTML='<img style="position:absolute; right:10px;" class="matchHTLive" title="HT Live" alt="HT Live" src="/Img/Icons/transparent.gif"/>';
				img.parentNode.appendChild(a);
			}
		}*/
		} catch(e) {Foxtrick.dump('LeagueAndMatchChat: '+e+'\n');}
	},
	
	change : function( page, doc ) {
	},	
};