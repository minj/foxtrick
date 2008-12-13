/**
 * foxtrick_larsw84.js
 * Foxtrick Leave Conference module
 * @author larsw84
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickAddLeaveConfButton = {

    MODULE_NAME : "AddLeaveConfButton",

    init : function() {
            Foxtrick.registerPageHandler( 'forum',
                                          FoxtrickAddLeaveConfButton );
    },
    
    run : function( page, doc ) {
			
            Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/resources/"+
                    "css/conference.css");
            var elems = doc.getElementsByTagName("div");
            for(var i=0; i < elems.length; i++) {
                    if(elems[i].getAttribute("class")=="folderHeader") {
                            var a = elems[i].getElementsByTagName("a");
							var confName = Foxtrick.trim(a[0].lastChild.data);
							var leaveConf = doc.createElement("div");
                            leaveConf.setAttribute("class",
                                    "foxtrickLeaveConf float_right");
                            leaveConf.setAttribute("title","Leave conference");
                            leaveConf.setAttribute("onClick",
                                    "alert( \"" + Foxtrickl10n.getString( 
									'leave_conf_button_alert' ) + "\" ); " +
                                    "window.open(\"/MyHattrick/Preferences/"+
                                    "ForumSettings.aspx?LeaveConf="+confName+
									"\",\"_self\");");
                            var markAsReadButton = elems[i].childNodes[0];
                            elems[i].insertBefore(leaveConf,markAsReadButton);
                            
                    }
            }
    }

};
//////////////////////////////////////////////////////////////

var FoxtrickLeaveConf = {
	
	MODULE_NAME : "AddLeaveConfButton",
	
	init : function() {
            Foxtrick.registerPageHandler( 'forumSettings',
                                          FoxtrickLeaveConf );
    },
    
    run : function( page, doc ) {
	
		var sUrl = Foxtrick.getHref( doc );
		var confPos = sUrl.search(/LeaveConf=/i);
		if (confPos > -1){
			var confName = sUrl.substr(confPos+10).replace(/\%20/g," ");
			var tdElems = doc.getElementsByTagName("td");
			for(var i=0; i < tdElems.length; i++) {
				if(tdElems[i].innerHTML == confName) {
					var aChildNodes = tdElems[i].parentNode.childNodes;
					var a = aChildNodes[aChildNodes.length-2].firstChild;
					if (a){
						var func = a.href;
						if (func){
							doc.location.href = func;
						}
					}
				}
			}
		}
	}
};
