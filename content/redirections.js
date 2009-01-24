/**
 * redirections.js
 * Foxtrick redirections
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickRedirections = {
	
    MODULE_NAME : "Redirections",
	DEFAULT_ENABLED : true,
	
    init : function() {
            Foxtrick.registerAllPagesHandler(FoxtrickRedirections );
   },

    run : function( doc ) { 
		
	// redirect manager to team
	if (doc.location.href.search(/redir_to_team=true/i)!=-1 ) {
		if (doc.location.href.search(/\/Club\/Manager/i)!=-1 ) { 
				var alldivs = doc.getElementsByTagName('div');
				for (var j = 0; j < alldivs.length; j++) {
					if (alldivs[j].className=="playerInfo") {
						var teamid=FoxtrickHelper.findTeamId(alldivs[j]);
						var serv = doc.location.href.match(/(\S+)Club/i)[0]; 
						var tar=serv+"\/\?TeamID="+teamid;
						doc.location.replace(tar);
						break;
					}
				}
			}
		}
			
	// redirect to coach		
	if (doc.location.href.search(/redir_to_coach=true/i)!=-1 ) { 		
		if (doc.location.href.search(/\/Club\/Players\//i)!=-1 ) {  dump("redirect to coach\n");
			// redirect to coach
			try {
				var alldivs = doc.getElementsByTagName('div');
				for (var j = 0; j < alldivs.length; j++) {
					if (alldivs[j].className=="sidebarBox") { 
						var CoachId = FoxtrickHelper.findPlayerId(alldivs[j]);
						var serv = doc.location.href.match(/(\S+)Club/i)[0]; 
						var tar = serv+"/Players/Player.aspx?playerId="+CoachId;
						doc.location.replace(tar);
						break;					
					}
				}
			}
			catch (e) {dump("teamlinks->"+e);}
		}
		if (doc.location.href.search(/\/Club\/NationalTeam\/NationalTeam/i)!=-1 ){  dump("redirect to coach\n");
			// redirect to coach
			try {
				var ntinfo=doc.getElementById('teamInfo');
				var CoachId = FoxtrickHelper.findPlayerId(ntinfo);
				var serv = doc.location.href.match(/(\S+)Club/i)[0]; 
				var tar = serv+'/Players/Player.aspx?playerId='+CoachId;
				doc.location.replace(tar);
				}
			
			catch (e) {dump("teamlinks->"+e);}
		}
		if (doc.location.href.search(/\/Club\/Training\//i)!=-1) {   dump("redirect to own coach\n");
			try {
			// redirect to coach
				var CoachId = FoxtrickHelper.findPlayerId(doc.getElementById("mainBody"));
				var serv = doc.location.href.match(/(\S+)Club/i)[0]; 
				var tar = serv+"/Players/Player.aspx?playerId="+CoachId;
				doc.location.replace(tar);
			}
			catch (e) {dump("ateamshortcuts->"+e);}
		}
	  }
	},
	
	change : function( doc ) {
	},
		
};