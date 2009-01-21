/**
 * forumanchors.js
 * Foxtrick Sets anchors to the top of a page
 * @author spambot
 */

var FoxtrickForumAnchors = {
	
    MODULE_NAME : "ForumAnchors",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : false,

    init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread', this );
    },

    run : function( page, doc ) {
        var body = doc.getElementById("mainBody");
        if (body != null) {
            var elems = getElementsByClass("float_right", body);
            for (var i = 0; i < elems.length; i++) {
                try {
                    var time = elems[i].innerHTML.match(/(\d{2})\:(\d{2})/);
                    if ( time[1] != null && time[2] != null ) {
                        var anchor = doc.createElement( "a" );
                        anchor.href = "#logo";
                        anchor.title = "TOP";
                        
                        var img = doc.createElement("img");
                        img.style.padding = "0px 2px 2px 2px;";
                        img.className = "actionIcon";
                        img.alt = "anchor_top";
                        img.title = "Goto Top";
                        img.src = "chrome://foxtrick/content/resources/linkicons/anchor_top.png";
                        anchor.appendChild(img);                        
                            
                        elems[i].appendChild( anchor );
                    }
                }
                catch(e) {
                    // dump(e);
                }
            }
        }
	},
	
	change : function( page, doc ) {
	
	}
};
