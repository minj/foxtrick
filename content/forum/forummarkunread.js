/**
 * forummarkunread.js
 * adds a link to mark hread unread until...
 * @author spambot
 */

var FoxtrickMarkUnread = {
	
    MODULE_NAME : "MarkUnread",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumViewThread'),
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.5.0.3",
	LATEST_CHANGE:"adds a link to mark hread unread until",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
    init : function() {
    },

    run : function( page, doc ) {
        //return;
		var p = 0;
		var elems = doc.getElementsByTagName("div");
        var tab = '';
		var thread = '';
        try {
                var forumtabs = Foxtrick.getElementsByClass( 'active', doc )[0];
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
		
		for(var i=0; i < elems.length; i++) {
			if(elems[i].className == "message") {
				p++;
				if( !doc.getElementById( "foxtrick-ur-link"+p ) ) {
                    try {
						Foxtrick.dump(p + '\n');
                        var markunread = [];
                        markunread[p] = doc.createElement("a");
                        markunread[p].setAttribute("id","foxtrick-ur-link"+p);
                        markunread[p].className="foxtrick-unreadlink";
                        markunread[p].innerHTML = Foxtrickl10n.getString('foxtrick.conferences.markunread');
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
									nr = '&n=' + ar[2];
								}
								//alert(nr);
								markunread[p].href = "/Forum/Read.aspx" + thread + nr+"&mr=0"+tab+"&um=1";
                            }						
                            if( divsInFooter[j].className == "float_right" ) {
                                divsInFooter[j].appendChild(markunread[p]);
                            }
                        }
                    } catch(e) {Foxtrick.dump('MarkUnread ERROR ' + e + '\n');}
                } 
            }
		}
	},
	
	change : function( page, doc ) {
	
	}
};