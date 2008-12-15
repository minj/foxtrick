/**
 * forumstaffmarker.js
 * Foxtrick forum staff (HT, GM, Mod, CHPP, LA) marker
 * @author bummerland
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickForumStaffMarker = {
    
    MODULE_NAME : "ForumStaffMarker",
	MODULE_CATEGORY : "forum",

    _MARK_STAFF : "mark_staff",


    init : function() {
        Foxtrick.registerPageHandler( 'forumViewThread',
                                      FoxtrickForumStaffMarker );
    },

    run : function( page, doc ) {
		
        // var doc = Foxtrick.current_doc;

        switch( page )
        {
            case 'forumViewThread':
            
                // if ( !FoxtrickPrefs.getBool(
                            // FoxtrickForumStaffMarker._MARK_STAFF ) )
                    // break;
                 
                var userDivs = doc.evaluate(
		    	    "//div[@class='cfHeader']",
		    	    doc,
		    	    null,
		    	    Components.interfaces.nsIDOMXPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
		    	    null);
		    	
		    	for (i=0; i< userDivs.snapshotLength; i++){
		    		var user = userDivs.snapshotItem(i);
					var as = user.getElementsByTagName('a');
					for (var j=0; j<as.length; j++) {
						var a = as[j];
						if (a.getAttribute("href").search(/\/Club\/Manager\/\?userId\=/i) == -1) continue;
						var uname = Foxtrick.trim(a.textContent);
						htreg = /^HT-/i;
						gmreg = /^GM-/i;
						modreg = /^MOD-/i;
						chppreg = /^CHPP-/i;
						lareg = /^LA-/i;
						if (htreg.test(uname)) {
							a.innerHTML = "<SPAN style=\"background: red\"><B>" + uname + "</B></SPAN>";
						} else if (gmreg.test(uname)) {
							a.innerHTML = "<SPAN style=\"color: black; background: orange\"><B>" + uname + "</B></SPAN>";
						} else if (modreg.test(uname)) {
							a.innerHTML = "<SPAN style=\"color: black; background: yellow\"><B>" + uname + "</B></SPAN>";
						} else if (chppreg.test(uname)) {
							a.innerHTML = "<SPAN style=\"background: blue\"><B>" + uname + "</B></SPAN>";
						} else if (lareg.test(uname)) {
							a.innerHTML = "<SPAN style=\"color: green; background: white\"><B>" + uname + "</B></SPAN>";
						}
					}
				}
    	
       			break;
        }
    }
};

