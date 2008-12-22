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
			if(elems[i].className == "disabled first") {
				elems[i].parentNode.removeChild(elems[i]);
			}
         
			if(elems[i].className == "disabled prev") {
				elems[i].parentNode.removeChild(elems[i]);
			}
         
			if(elems[i].className == "disabled next") {
				elems[i].parentNode.removeChild(elems[i]);
			}
         
			if(elems[i].className == "disabled last") {
				elems[i].parentNode.removeChild(elems[i]);
			}       
        } 
	}
};
