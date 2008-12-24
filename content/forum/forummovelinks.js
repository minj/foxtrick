/**
 * forummovelinks.js
 * Foxtrick Move Links in forum posts module
 * @author larsw84
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickMoveLinks = {
	
    MODULE_NAME : "MoveLinks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,

    init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread',
                                          FoxtrickMoveLinks );
    },

    run : function( page, doc ) {
	
		var allDivs = doc.getElementsByTagName("div");
		
		for(var i = 0; i < allDivs.length; i++) {
			if(allDivs[i].className=="cfWrapper") {
				var divsInMessage = allDivs[i].getElementsByTagName("div");
				var authorLink = false;
				var countryLink;
				var leagueLink;
				for(var k = 0; k < divsInMessage.length; k++) {
					var linksInMessage = 
							divsInMessage[k].getElementsByTagName("a");
					if(divsInMessage[k].className=="float_left") {
						for(var j = 0; j < linksInMessage.length; j++) {
							if(!authorLink && linksInMessage[j].href.search(
								/userId=/i)	> -1) {
								authorLink = linksInMessage[j];
							}
						}
					} else if(divsInMessage[k].className=="cfUserInfo") {
						for(var j = 0; j < linksInMessage.length; j++) {
							if(linksInMessage[j].href.search(
								/LeagueID=/i)>-1) {
								countryLink = linksInMessage[j];
							} else if(linksInMessage[j].href.search(
								/LeagueLevelUnitID=/i)>-1) {
								leagueLink = linksInMessage[j];
							}
						}
					}
				}
				var space = doc.createTextNode(" ");
				if(authorLink && countryLink && leagueLink) {
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