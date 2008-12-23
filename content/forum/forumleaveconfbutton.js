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
				var sUrl = Foxtrick.getHref( doc );
				var vPos = sUrl.search(/v=/i);
				var vValue = "";
				if(vPos > -1) {
					vValue = sUrl.substr(vPos+2);
				}
				if(vValue != "2") {
					Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/"+
							"resources/css/conference.css");
					var elems = doc.getElementsByTagName("div");
					var foldersCounter = 0;
					for(var i=0; i < elems.length; i++) {
						if(elems[i].className=="folderHeader"){
							var divLeaveConfBtn = doc.getElementById(
								"ftLC-btn" + foldersCounter);
							if(!divLeaveConfBtn) {
								// Only add if it's not already there
								var a = elems[i].getElementsByTagName("a");
								var confName = Foxtrick.trim( 
									a[0].lastChild.data );
								var leaveConf = doc.createElement("div");
								leaveConf.setAttribute("id", "ftLC-btn" + 
									foldersCounter);
								leaveConf.setAttribute("class","foxtrick" +
									"LeaveConf float_right");
								leaveConf.setAttribute( "title",
									"Leave conference" );
								leaveConf.setAttribute("onClick","alert( \"" +
									Foxtrickl10n.getString('leave_conf_button'
									+ '_alert')	+ "\" ); window.open(\"" 
									+ "/MyHattrick/Preferences/ForumSettings."
									+ "aspx?LeaveConf=" + confName
									+"\",\"_self\");");
								var markAsReadButton = elems[i].childNodes[0];
								elems[i].insertBefore( leaveConf, 
									markAsReadButton);
							}
							foldersCounter++;
						}
					}
				}
				break;
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
	}
};