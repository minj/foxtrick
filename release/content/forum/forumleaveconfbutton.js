/**
 * foxtrickleaveconfbutton.js
 * Foxtrick Leave Conference module
 * @author larsw84
 */

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
                    Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/"+
                                "resources/css/conference.css");
                    if(vValue != "2") {
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
					var ul = doc.getElementById("ctl00_CPMain_rlFolders__rbl");
					var liElems = ul.getElementsByTagName("li");
					for(var i=0; i < liElems.length; i++) {
						var subDivs = liElems[i].getElementsByTagName("div");
						if(Foxtrick.trim(subDivs[0].innerHTML) == confName) {
							var inputs = subDivs[1].getElementsByTagName("input");
							for(var j=0; j < inputs.length; j++) {
								if (inputs[j].className == "leave"){
									var func = "javascript:__doPostBack('";
									func += inputs[j].getAttribute("name");
									func += "','')";
									if (func){
										doc.location.href = func;
									}
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
        // dump (' => vValue: ' + vValue + '\n');
		return vValue;
	},
	
	addButton : function( doc, divId, folderHeader, foldersCounter ) {
		try {
            // if (doc == null) return;
            var a = folderHeader.getElementsByTagName("a");
            if (a == null || a[0].lastChild == null || a[0].lastChild.data == null || a[0].innerHTML == null) return;
            // dump('=> anchors: ' + a.length +'\n');
            //  dump('=> a[0]: ' + a[0].innerHTML +'\n');
            
            var confName = Foxtrick.trim( a[0].lastChild.data );
            // dump('=> confName: ' + confName +'\n');
            
            var leaveConf = doc.createElement("div");
            leaveConf.setAttribute("id", "ftLC-btn" + foldersCounter);
            //  dump('=>counter: ' + foldersCounter +'\n');
            leaveConf.setAttribute("class","foxtrick" +	"LeaveConf float_right");
            leaveConf.setAttribute( "title", Foxtrickl10n.getString('leave_conf_button'));
            leaveConf.setAttribute("onClick","if (confirm( \"" +	Foxtrickl10n.getString(
                'leave_conf_button_alert')	+ "\" )) {window.open(\"/MyHattrick/"
                + "Preferences/ForumSettings.aspx?LeaveConf=" + confName
                + "\",\"_self\");} else return false;");
            var markAsReadButton = folderHeader.childNodes[0];
            folderHeader.insertBefore( leaveConf, markAsReadButton);
        } 
        catch(e) {
            dump( ' => AddLeaveConfButton addButton ' + e + '\n');
        }
	}
};