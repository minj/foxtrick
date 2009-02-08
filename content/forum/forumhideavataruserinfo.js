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

    run : function( page, doc ) { return;
	try {

		/*var elems = doc.getElementById('mainBody').getElementsByTagName('div');
		for(var i=0; i < elems.length; i++) {
			if(elems[i].getAttribute("class")=="cfUserInfo") {
				var userinfo = elems[i]; dump(userinfo.id+'\n');
				var userinfo2 = doc.getElementById('cfUserInfo0'); 
			dump(userinfo2+'\n');*/
		var i = -1; 
		var userinfo; 
		while (userinfo = doc.getElementById('cfUserInfo'+(++i))) { {
				
				/*var teamid='';
				var teamname='';
				var linksInMessage = userinfo.getElementsByTagName("a");
				for(var j = 0; j < linksInMessage.length; j++) {
						if(linksInMessage[j].href.search(/TeamID=/i)>-1) {
								teamid = FoxtrickHelper.getTeamIdFromUrl(linksInMessage[j].href); 
								teamname = linksInMessage[j].innerHTML; 
								break;
						}
				}
				*/			
                var user = userinfo.parentNode;
				/*var uhlink = user.parentNode.getElementsByTagName("a")[1];
				uhlink.setAttribute('teamid',teamid);
				uhlink.setAttribute('teamname',teamname);
				*/
				user.removeChild(userinfo);
				if (user.firstChild==null) {
					user.nextSibling.setAttribute('style','width:90%'),
					user.parentNode.removeChild(user);				
				}
			}
		}
	}catch(e){dump('HideUserInfo: '+e+'\n');}
	},
	
	change : function( page, doc ) {
	
	}
};