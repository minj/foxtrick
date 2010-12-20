/**
 * mark-unread.js
 * adds a link to mark hread unread until...
 * @author spambot
 */

var FoxtrickMarkUnread = {

    MODULE_NAME : "MarkUnread",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumViewThread'),

    run : function( page, doc ) {
        //return;
		var p = 0;
		var elems = doc.getElementsByTagName("div");
/*
        var tab = '';
		var thread = '';

        try {
                var forumtabs = doc.getElementsByClassName("active")[0];
                var reg = /^(.*?)\&v\=(\d+)(.*?)/;
                var ar = reg.exec(+' ' + forumtabs.href + ' ');
                if (ar[2] != null) {
                    tab = '&v=' + ar[2];
                }
                var reg = /^(.*?)\?t\=(\d+)(.*?)/;
                var ar = reg.exec(+' ' + forumtabs.href + ' ');
                if (ar[2] != null) {
                    thread = '?t=' + ar[2];
                }
        } catch(e) {}
*/
		for(var i=0; i < elems.length; i++) {
			if(elems[i].className == "message") {
				p++;
				if( !doc.getElementById( "foxtrick-ur-link"+p ) ) {
                    try {
                        var markunread = [];
                        markunread[p] = doc.createElement("a");
                        markunread[p].setAttribute("id","foxtrick-ur-link"+p);
                        markunread[p].className="foxtrick-unreadlink";
                        markunread[p].innerHTML = Foxtrickl10n.getString('foxtrick.conferences.markunread');
                        markunread[p].title = Foxtrickl10n.getString('foxtrick.conferences.markunread');
						markunread[p].href = "#";
                        var cfInnerWrapper = elems[i].parentNode.parentNode;
                        var cfFooter = cfInnerWrapper.nextSibling;
                        while( cfFooter.className != "cfFooter" ) {
                            cfFooter = cfFooter.nextSibling;
                        }
                        var divsInFooter = cfFooter.getElementsByTagName("div");
                        for(var j = 0; j < divsInFooter.length; j++) {
                            if( divsInFooter[j].className == "float_left" ) {
								var nr=1;
								var a = divsInFooter[j].getElementsByTagName("a");
								ahref = a[a.length-1].href;
								var reg = /^(.*?)\&n\=(\d+)(.*?)/;
								var ar = reg.exec(+' ' + ahref + ' ');
								if (ar[2] != null) {
									//nr = '&n=' + ar[2];
									nr = ''+ar[2]+'';
								}
								markunread[p].href = "javascript:try{document.getElementById('ctl00_ctl00_CPContent_CPMain_ucThread_ucPagerTop_ddlAction').selectedIndex=\"1\";document.getElementById('ctl00_ctl00_CPContent_CPMain_ucThread_ucPagerTop_txtMessageNumber').value=\""+nr+"\";document.getElementById('ctl00_ctl00_CPContent_CPMain_ucThread_ucPagerTop_btnGo').click();}catch(e){}";
								// Foxtrick.dump ('\n' + markunread[p].href + '\n');
                            }
                            if( divsInFooter[j].className == "float_right" ) {
                                divsInFooter[j].innerHTML+='&nbsp;';
								divsInFooter[j].appendChild(markunread[p]);
                            }
                        }
                    } catch(e) {Foxtrick.dump('MarkUnread ERROR ' + e + '\n');}
                }
            }
		}
	}
};
