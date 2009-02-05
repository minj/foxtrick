/**
 * forumhideavataruserinfo.js
 * Foxtrick Hide Manager Avatar User Info module
 * @author larsw84/convinced
 */

var FoxtrickHideManagerAvatarUserInfo = {
	
    MODULE_NAME : "HideManagerAvatarUserInfo",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : false,

    init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread',
                                          FoxtrickHideManagerAvatarUserInfo );
    },

    run : function( page, doc ) {
		var elems = doc.getElementsByTagName("div");
		for(var i=0; i < elems.length; i++) {
			if(elems[i].getAttribute("class")=="cfUserInfo") {
				var teamid='';
				var teamname='';
				var linksInMessage = elems[i].getElementsByTagName("a");
				for(var j = 0; j < linksInMessage.length; j++) {
						if(linksInMessage[j].href.search(/TeamID=/i)>-1) {
								teamid = FoxtrickHelper.getTeamIdFromUrl(linksInMessage[j].href); 
								teamname = linksInMessage[j].innerHTML; 
								break;
						}
				}
							
                var user = elems[i].parentNode;
				var uhlink = user.parentNode.getElementsByTagName("a")[1];
				dump(uhlink.href+'\n');
				uhlink.setAttribute('teamid',teamid);
				uhlink.setAttribute('teamname',teamname);
				
				user.removeChild(elems[i]);
				if (user.firstChild==null) {
					user.nextSibling.setAttribute('style','width:90%'),
					user.parentNode.removeChild(user);				
				}
			}
		}
	},
	
	change : function( page, doc ) {
	
	}
};