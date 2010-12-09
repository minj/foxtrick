/**
 * foxtrickleaveconfbutton.js
 * Foxtrick Leave Conference module
 * @author larsw84
 */

var FoxtrickAddLeaveConfButton = {

    MODULE_NAME : "AddLeaveConfButton",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forum','forumSettings'),

    run : function( page, doc ) {
		switch( page ) {

            case 'forum':
                    var vValue = this.getVValue( doc );

                    if(vValue != "2") {
                        var elems = doc.getElementsByTagName("div");
                        var foldersCounter = 0;
                        for(var i=0; i < elems.length; i++) {
                            if(elems[i].className=="folderHeader"
							|| elems[i].className=="folderHeaderHighlight"){
								if (elems[i].getElementsByTagName('div')[0].className.search('foxtrickRemove')!=-1) continue;
                                var divLeaveConfBtn = doc.getElementById(
                                    "ftLC-btn" + foldersCounter);
                                this.addButton ( doc, divLeaveConfBtn, elems[i],
                                    foldersCounter, vValue);
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
					//Foxtrick.dump('confName: ' + confName + '\n');
					var ul = doc.getElementById("ctl00_ctl00_CPContent_CPMain_rlFolders__rbl");
					var liElems = ul.getElementsByTagName("li");
					for(var i=0; i < liElems.length; i++) {
						var subDivs = liElems[i].firstChild.getElementsByTagName("div");
						for(var k = 0; k < subDivs.length; k++) {
							if(subDivs[k].className == "float_left prioFolderName"
								&& Foxtrick.trim(subDivs[k].getElementsByTagName("a")[0].innerHTML) == confName) {
								var inputs = subDivs[k+1].getElementsByTagName("input");
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
				}
				break;
		}
	},

	change : function( page, doc ) {
		switch( page ) {
			case 'forum':
				this.run(page,doc);
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
		return vValue;
	},

	addButton : function( doc, divId, folderHeader, foldersCounter, vValue ) {
        // if (doc == null) return;
        var a = folderHeader.getElementsByTagName("a");
		var link;
		if( a != null ) {
			link = a[a.length-1];
		}
		//Foxtrick.dump('=> link: ' + link + '\n');
		if (link == null || link.lastChild == null || link.lastChild.data == null || link.innerHTML == null) return;

        var confName = Foxtrick.trim( link.lastChild.data );
        //Foxtrick.dump('=> confName: ' + confName +'\n');

        var leaveConf = doc.createElement("div");
        leaveConf.setAttribute("id", "ftLC-btn" + foldersCounter);
        // Foxtrick.dump('=>counter: ' + foldersCounter +'\n');
        leaveConf.setAttribute("class","ft_actionicon foxtrickRemove float_right");
        leaveConf.setAttribute( "title", Foxtrickl10n.getString('leave_conf_button'));
        leaveConf.setAttribute("onClick","if (confirm( \"" +	Foxtrickl10n.getString(
            'leave_conf_button_alert')	+ "\" )) {window.open(\"/MyHattrick/"
            + "Preferences/ForumSettings.aspx?LeaveConf=" + confName
            + "\",\"_self\");} else return false;");
        var markAsReadButton = folderHeader.childNodes[0];
		// Foxtrick.dump('=>markAsReadButton: ' + markAsReadButton+'\n');
        folderHeader.insertBefore( leaveConf, markAsReadButton);
	}
};
