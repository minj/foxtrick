/**
 * foxtrickleaveconfbutton.js
 * Foxtrick Leave Conference module
 * @author larsw84
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickAddLeaveConfButton = {

    MODULE_NAME : "AddLeaveConfButton",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,

    init : function() {
            Foxtrick.registerPageHandler( 'forum',
                                          FoxtrickAddLeaveConfButton );
			Foxtrick.registerPageHandler( 'forumSettings',
                                          FoxtrickAddLeaveConfButton );
    },
    
    run : function( page, doc ) {
		
		switch( page ) {

            case 'forum':
                try {
                    var vValue = this.getVValue( doc );
                    if(vValue != "2") {
                        Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/"+
                                "resources/css/conference.css");
                        var elems = doc.getElementsByTagName("div");
                        var foldersCounter = 0;
                        for(var i=0; i < elems.length; i++) {
                            if(elems[i].className=="folderHeader"){
                                var divLeaveConfBtn = doc.getElementById(
                                    "ftLC-btn" + foldersCounter);
                                this.addButton ( doc, divLeaveConfBtn, elems[i],
                                    foldersCounter);
                                foldersCounter++;
                            }
                        }
                    }
                    break;
                }
                catch(e) {
                    dump( ' => AddLeaveConfButton forum' + e + '\n');
                }
                
                

			case 'forumSettings':
				var sUrl = Foxtrick.getHref( doc );
				var confPos = sUrl.search(/LeaveConf=/i);
				if (confPos > -1){
					var confName =sUrl.substr(confPos+10).replace(/\%20/g," ");
					var tdElems = doc.getElementsByTagName("td");
					for(var i=0; i < tdElems.length; i++) {
						if(tdElems[i].innerHTML == confName) {
							var aChildNodes = tdElems[i].parentNode.childNodes;
							var a=aChildNodes[aChildNodes.length-2].firstChild;
							if (a){
								var func = a.href;
								if (func){
									doc.location.href = func;
								}
							}
						}
					}
				}
				break;
		}
	},
	
	change : function( page, doc ) {
		switch( page ) {
			case 'forum':
                try {
                    var vValue = this.getVValue( doc );
                    if(vValue != "2") {
                        var elems = doc.getElementsByTagName("div");
                        var foldersCounter = 0;
                        for(var i=0; i < elems.length; i++) {
                            if(elems[i].className=="folderHeader"){
                                var divLeaveConfBtn = doc.getElementById(
                                    "ftLC-btn" + foldersCounter);
                                if(!divLeaveConfBtn) {
                                    this.addButton( doc, divLeaveConfBtn, elems[i],
                                        foldersCounter );
                                }
                                foldersCounter++;
                            }
                        }
                    }
                } 
                catch(e) {
                    dump(' => AddLeaveConfButton CHG: ' + e + '\n');
                }
				break;
			case 'forumSettings':
				break;
		}
	},
	
	getVValue : function( doc ) {
		var sUrl = Foxtrick.getHref( doc );
		var vPos = sUrl.search(/v=/i);
		var vValue = 1;
		if(vPos > -1) {
			vValue = sUrl.substr(vPos+2,1);
		}
        dump (' => vValue: ' + vValue + '\n');
		return vValue;
	},
	
	addButton : function( doc, divId, folderHeader, foldersCounter ) {
		try {
            var a = folderHeader.getElementsByTagName("a");
            var confName = Foxtrick.trim( a[0].lastChild.data );
            var leaveConf = doc.createElement("div");
            leaveConf.setAttribute("id", "ftLC-btn" + foldersCounter);
            leaveConf.setAttribute("class","foxtrick" +	"LeaveConf float_right");
            leaveConf.setAttribute( "title", Foxtrickl10n.getString('leave_conf_button'));
            leaveConf.setAttribute("onClick","alert( \"" +	Foxtrickl10n.getString(
                'leave_conf_button_alert')	+ "\" ); window.open(\"/MyHattrick/"
                + "Preferences/ForumSettings.aspx?LeaveConf=" + confName
                + "\",\"_self\");");
            var markAsReadButton = folderHeader.childNodes[0];
            folderHeader.insertBefore( leaveConf, markAsReadButton);
        } 
        catch(e) {
            dump( ' => AddLeaveConfButton addButton ' + e + '\n');
        }
	}
};