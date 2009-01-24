/**
 * forumredirmanagertoteam.js
 * Foxtrick redirect from manager to team page
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickForumRedirManagerToTeam = {
	
    MODULE_NAME : "ForumRedirManagerToTeam",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,

	init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread',
                                          FoxtrickForumRedirManagerToTeam);
            Foxtrick.registerPageHandler( 'teamPageGeneral',
                                          FoxtrickForumRedirManagerToTeam);
    },

    run : function( page, doc ) { 
		// manager to team in forum
		if (doc.location.href.search(/\/Forum\/Read/i)!=-1 ) {	 
				var innerdivs = doc.getElementsByTagName('div');
				for (var k = 0; k < innerdivs.length; k++) {
				  if (innerdivs[k].className=="cfHeader") {
				    var linksArray = innerdivs[k].getElementsByTagName('a');
				    for (var j=0; j<linksArray.length; j++) {
					  var link = linksArray[j];
					  if (link.href.search(/userId=/i) > -1) { 
						link.href+="&redir_to_team=true";
					  }
					}
				  }
				}
			}
		// manager to team for last visitors
		else if (doc.location.href.search('\/Club\/|\/World\/Series\/')!=-1 ) {	
			var alldivs = doc.getElementsByTagName('div');
			for (var j = 0; j < alldivs.length; j++) {
				if (alldivs[j].className=="sidebarBox") { 
					var header = alldivs[j].getElementsByTagName("h2")[0];
					if (header.innerHTML == Foxtrickl10n.getString("foxtrick.tweaks.recentvisitors")) {
						var linksArray = alldivs[j].getElementsByTagName('a'); 
						for (var k=0; k<linksArray.length; k++) {
							var link = linksArray[k];
							if (link.href.search(/userId=/i) > -1) { 
								link.href+="&redir_to_team=true"; 
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