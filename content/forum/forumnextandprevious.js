/**
 * forumnextandprevious.js
 * Foxtrick Remove Disabled Next and Previous buttons
 * @author smates
 */

var FoxtrickForumNextAndPrevious = {
	
    MODULE_NAME : "ForumNextAndPrevious",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,

    init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread',
                                          FoxtrickForumNextAndPrevious );
    },

    run : function( page, doc ) {
		var elems = doc.getElementsByTagName("img");
		for(var i=0; i < elems.length; i++) {
			if(elems[i].className == "disabledFirst") {
				elems[i].parentNode.removeChild(elems[i]);
			}
         
			if(elems[i].className == "disabledPrev") {
				elems[i].parentNode.removeChild(elems[i]);
			}
         
			if(elems[i].className == "disabledNext") {
				elems[i].parentNode.removeChild(elems[i]);
			}
         
			if(elems[i].className == "disabledLast") {
				elems[i].parentNode.removeChild(elems[i]);
			}       
        } 
	},
	
	change : function( page, doc ) {
	
	}
};
