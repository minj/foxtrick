/**
 * redirmanagertoteam.js
 * Foxtrick redirect from manager to team page
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickRedirManagerToTeam = {
	
    MODULE_NAME : "RedirManagerToTeam",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,

	init : function() {
            Foxtrick.registerPageHandler( 'managerRedir',
                                          FoxtrickRedirManagerToTeam);
    },

    run : function( page, doc ) { 
		if (doc.location.href.search(/\/Club\/Manager/i)!=-1 ) { 
			if (doc.location.href.search(/redir=true/i)!=-1 ) {
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
		else if (doc.location.href.search(/\/Forum\/Read/i)!=-1 ) {	 
				var innerdivs = doc.getElementsByTagName('div');
				for (var k = 0; k < innerdivs.length; k++) {
				  if (innerdivs[k].className=="cfHeader") {
				    var linksArray = innerdivs[k].getElementsByTagName('a');
				    for (var j=0; j<linksArray.length; j++) {
					  var link = linksArray[j];
					  if (link.href.search(/userId=/i) > -1) { 
						link.href+="&redir=true";
					  }
					}
				  }
				}
			}
		else if (doc.location.href.search('\/Club')!=-1 ) {	
			var alldivs = doc.getElementsByTagName('div');
			for (var j = 0; j < alldivs.length; j++) {
				if (alldivs[j].className=="sidebarBox") { 
					var header = alldivs[j].getElementsByTagName("h2")[0];
					if (header.innerHTML == Foxtrickl10n.getString("foxtrick.tweaks.recentvisitors")) {
						var linksArray = alldivs[j].getElementsByTagName('a'); 
						for (var k=0; k<linksArray.length; k++) {
							var link = linksArray[k];
							if (link.href.search(/userId=/i) > -1) { 
								link.href+="&redir=true"; 
							}
						}
						break;
					}
				}
			}	
	    }			
    },
	
	change : function( page, doc ) {
	},
};