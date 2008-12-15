/**
 * forummovelinks.js
 * Foxtrick Move Links in forum posts module
 * @author larsw84
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickMoveLinks = {
	
    MODULE_NAME : "MoveLinks",
	MODULE_CATEGORY : "forum",

    init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread',
                                          FoxtrickMoveLinks );
    },

    run : function( page, doc ) {
		var elems = doc.getElementsByTagName("div");
		var posts = [];
		// Get all posts
		for(var i=0; i < elems.length; i++) {
			if(elems[i].getAttribute("class")=="cfWrapper") {
				posts.push(elems[i]);
			}
		}
		// Move the links
		for(var j=0; j < posts.length; j++) {
			var cfHeader = posts[j].childNodes[3];
			var cfUserInfo = posts[j].childNodes[4].childNodes[1];
			
			var countryLink = cfUserInfo.childNodes[4];
			var leagueLink = cfUserInfo.childNodes[6];
			var space = doc.createTextNode(" ");
			
			var supporterLink = cfHeader.childNodes[0].childNodes[6];
			cfHeader.childNodes[0].insertBefore(countryLink,supporterLink);
			cfHeader.childNodes[0].insertBefore(leagueLink,supporterLink);
			cfHeader.childNodes[0].insertBefore(space,supporterLink);
		}
		// Remove the avatar and change class of message
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
};