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
				if(authorLink) {
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
				if(allDivs[m].getAttribute("class")=="cfUser") {
					allDivs[m].parentNode.removeChild(allDivs[m]);
				}
				if(elems[k].getAttribute("class")=="cfMessage") {
					elems[k].setAttribute("class","cfMessageNoAvatar");
				}
			}
		}
		
		/*
		var elems = doc.getElementsByTagName("div");
		var posts = [];
		var noAvatar = false;
		// Get all posts
		for(var i=0; i < elems.length; i++) {
			if(elems[i].getAttribute("class")=="cfWrapper") {
				posts.push(elems[i]);
			}
			if(elems[i].getAttribute("class")=="cfMessageNoAvatar") {
				noAvatar = true;
			}
		}
		// Move the links
		if(!noAvatar) {
			for(var j=0; j < posts.length; j++) {
				var cfHeader;
				var cfUser;
				var cfUserInfo;
				var countryLink;
				var leagueLink;
			
				if(posts[j].childNodes[3].className=="cfHeader") {
					cfHeader = posts[j].childNodes[3];
					cfUser = posts[j].childNodes[4];
				} else if (posts[j].childNodes[3].className=="cfDeleted") {
					continue;
				} else {
					// posting user is bookmarked
					cfHeader = posts[j].childNodes[4];
					cfUser = posts[j].childNodes[5];
				}
			
				if(cfUser.id) {
					// posting user is ignored
					cfUser = cfUser.childNodes[0];
				}
			
				if(cfUser.childNodes[0].className=="cfUserInfo") {
					// posting user has no avatar
					cfUserInfo = cfUser.childNodes[0];
				} else {
					cfUserInfo = cfUser.childNodes[1];
				}
			
				if(cfUserInfo.childNodes[2].href.search("\/Help\/Supporter\/")
					>-1) {
					// posting user is supporter
					countryLink = cfUserInfo.childNodes[4];
					leagueLink = cfUserInfo.childNodes[6];
				} else {
					countryLink = cfUserInfo.childNodes[2];
					leagueLink = cfUserInfo.childNodes[4];
				}
			
				var space = doc.createTextNode(" ");
				var authorLink = cfHeader.childNodes[0].childNodes[4];
				if(!authorLink) {
					// viewing user has no supporter and message is replied to all
					authorLink = cfHeader.childNodes[0].childNodes[2];
				}
				if(!authorLink.href) {
					// viewing user has no supporter and neither does posting user
					authorLink = cfHeader.childNodes[0].childNodes[2];
				} else {
					// viewing user has no supporter but posting user does
					if(authorLink.href.search(/\/Club\/Manager\/\?userId=/i)==-1) {
						authorLink = cfHeader.childNodes[0].childNodes[2];
					}
				}
				cfHeader.childNodes[0].insertBefore(leagueLink,authorLink.nextSibling);
				cfHeader.childNodes[0].insertBefore(countryLink,authorLink.nextSibling);
				cfHeader.childNodes[0].insertBefore(space,authorLink.nextSibling);
			}
			// If avatar is also hidden, change class of message
			if(Foxtrick.isModuleEnabled( FoxtrickHideManagerAvatar )) {
				elems = doc.getElementsByTagName("div");
				for(var k=0; k < elems.length; k++) {
					if(elems[k].getAttribute("class")=="cfUser") {
						elems[k].parentNode.removeChild(elems[k]);
					}
					if(elems[k].getAttribute("class")=="cfMessage") {
						elems[k].setAttribute("class","cfMessageNoAvatar");
					}
				}
			}
		}*/
	}
};