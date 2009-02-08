/**
 * forummovelinks.js
 * Foxtrick Move Links in forum posts module
 * @author larsw84
 */

var FoxtrickMoveLinks = {
	
    MODULE_NAME : "MoveLinks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,

    init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread',
                                          FoxtrickMoveLinks );
    },

    run : function( page, doc ) { return;
	
		var allDivs = doc.getElementById('mainBody').getElementsByTagName("div");
		
		for(var i = 0; i < allDivs.length; i++) {
			if(allDivs[i].className=="cfWrapper") {
				var divsInMessage = allDivs[i].getElementsByTagName("div");
				var countryLink; 
				var leagueLink;
				var teamLink;
				var teamid='';
				var teamname='';
				var divsInMessage_length = divsInMessage.length; 
				var authorLink = allDivs[i].getElementsByTagName("a")[1];
				for(var k = 4; k < divsInMessage_length; ++k) { 
					if(divsInMessage[k].className=="cfUserInfo") { 
						var linksInMessage = 
							divsInMessage[k].getElementsByTagName("a");
						for(var j = 0; j < linksInMessage.length; j++) {
							if(linksInMessage[j].href.search(
								/LeagueID=/i)>-1) {
								countryLink = linksInMessage[j];
							} else if(linksInMessage[j].href.search(
								/LeagueLevelUnitID=/i)>-1) {
								leagueLink = linksInMessage[j];
							} else if(linksInMessage[j].href.search(
								/TeamID=/i)>-1) {
								teamlink = linksInMessage[j];
								teamid = FoxtrickHelper.getTeamIdFromUrl(linksInMessage[j].href); 
								teamname = linksInMessage[j].innerHTML; 
							}
						}
					}
				}
				var space = doc.createTextNode(" ");
				if(authorLink && countryLink && leagueLink) {
					authorLink.setAttribute('teamid',teamid);
					authorLink.setAttribute('teamname',teamname);
			
					/*if (!Foxtrick.isModuleEnabled( FoxtrickForumSingleHeaderLine)) {
						authorLink.parentNode.insertBefore(teamlink.cloneNode(true),
						authorLink.nextSibling);					 	
						authorLink.parentNode.insertBefore(doc.createTextNode(' '),
						authorLink.nextSibling);					 	
					}*/
			
					authorLink.parentNode.insertBefore(leagueLink,
						authorLink.nextSibling);
					authorLink.parentNode.insertBefore(countryLink,
						authorLink.nextSibling);							
					authorLink.parentNode.insertBefore(space,
						authorLink.nextSibling);
				}
			}
		}
		if(Foxtrick.isModuleEnabled( FoxtrickHideManagerAvatar )) {
			allDivs = doc.getElementsByTagName("div");
			for(var m=0; m < allDivs.length; m++) {
				if(allDivs[m].className=="cfUser") {
					allDivs[m].parentNode.removeChild(allDivs[m]);
				}
				if(allDivs[m].className=="cfMessage") {
					allDivs[m].className="cfMessageNoAvatar";
				}
			}
		}
	},
	
	change : function( page, doc ) {
	
	}
};