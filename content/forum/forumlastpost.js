/**
 * forumlastpost.js
 * Foxtrick replaces the links on forum thread list to last posting of read threads
 * @author spambot
 */

var FoxtrickForumLastPost = {
	
    MODULE_NAME : "ForumLastPost",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
    PAGES : new Array("forum"),
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.9.1",
	LATEST_CHANGE: "replaces the links on forum thread list to last posting of read threads",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
    
	
    init : function() {
    },

    run : function( page, doc ) {
//        Foxtrick.dump('ForumLastpost run\n');
        this._change( doc );
	},
	
	change : function( page, doc ) {
//        Foxtrick.dump('ForumLastpost chn\n');
        this._change( doc );
	},
    
    _change : function( doc ){
        try {
//            Foxtrick.dump('ForumLastpost \n');
            var divs  = Foxtrick.getElementsByClass("threadInfo", doc );
            for (i=0; i < divs.length; i++) {
                var id = divs[i].textContent;
                if (id.search(/\//)>-1) continue;
                var url = divs[i].parentNode.parentNode.getElementsByTagName('a')[0];
                url.href = url.href.replace(/n=\d+/,'n='+id);
            }
        } catch(e) {Foxtrick.dump('ForumLastpost ' + e);}
    }
    
};
