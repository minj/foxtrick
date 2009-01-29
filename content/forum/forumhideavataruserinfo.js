/**
 * forumhideavataruserinfo.js
 * Foxtrick Hide Manager Avatar User Info module
 * @author larsw84/convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickHideManagerAvatarUserInfo = {
	
    MODULE_NAME : "HideManagerAvatarUserInfo",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : false,

    init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread',
                                          FoxtrickHideManagerAvatarUserInfo );
    },

    run : function( page, doc ) {
		if (Foxtrick.isModuleEnabled(FoxtrickMoveLinks)) {return;}
		var elems = doc.getElementsById('mainBody').getElementsByTagName("div");
		for(var i=0; i < elems.length; i++) {
			if(elems[i].getAttribute("class")=="cfUserInfo") {
                {               //  dump( "hiding\n" );
				elems[i].parentNode.removeChild(elems[i]);
				}
			}
		}
	},
	
	change : function( page, doc ) {
	
	}
};