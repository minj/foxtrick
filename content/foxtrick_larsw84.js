/**
 * foxtrick_larsw84.js
 * Foxtrick forum hide manager avatar service
 * @author larsw84
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickHideManagerAvatar = {
	
    MODULE_NAME : "HideManagerAvatar",

    init : function() {
            // if ( FoxtrickPrefs.getBool( "hideManagerAvatar" ) ) {
            Foxtrick.registerPageHandler( 'forumViewThread',
                                          FoxtrickHideManagerAvatar );
            // }
    },

    run : function( page, doc ) {
		// var doc = Foxtrick.current_doc;
		var elems = doc.getElementsByTagName("div");
		for(var i=0; i < elems.length; i++) {
			if(elems[i].getAttribute("class")=="faceCard") {
                                dump( "hiding\n" );
				elems[i].parentNode.removeChild(elems[i]);
			}
		}
	}
};

////////////////////////////////////////////////////////////////////////////////
var FoxtrickAddLeaveConfButton = {

    MODULE_NAME : "AddLeaveConfButton",

    init : function() {
            // if ( FoxtrickPrefs.getBool( "addLeaveConfButton" ) ) {
            Foxtrick.registerPageHandler( 'forum',
                                          FoxtrickAddLeaveConfButton );
            // }
    },
    
    run : function( page, doc ) {
            // var doc = Foxtrick.current_doc;
            Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/resources/"+
                    "css/conference.css");
            var elems = doc.getElementsByTagName("div");
            for(var i=0; i < elems.length; i++) {
                    if(elems[i].getAttribute("class")=="folderHeader") {
                            
                            var leaveConf = doc.createElement("div");
                            leaveConf.setAttribute("class",
                                    "foxtrickLeaveConf float_right");
                            leaveConf.setAttribute("title","Leave conference");
                            leaveConf.setAttribute("onClick","alert(\"Leave this "+
                                    "conference by clicking the `Leave' link"+
                                    " next to the conference name on the next page,"+
                                    "and then clicking `Save'.\"); "+
                                    "window.open(\"/MyHattrick/Preferences/"+
                                    "ForumSettings.aspx\",\"_self\");");
                            var markAsReadButton = elems[i].childNodes[0];
                            elems[i].insertBefore(leaveConf,markAsReadButton);
                            
                    }
            }
    }

};
