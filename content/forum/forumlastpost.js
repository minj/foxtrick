/**
 * forumlastpost.js
 * Foxtrick replaces the links on forum thread list to last posting of read threads
 * @author spambot
 */

var FoxtrickForumLastPost = {
    MODULE_NAME : "ForumLastPost",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
    PAGES : new Array("forum", "forumSettings"),
	NEW_AFTER_VERSION: "0.4.9.1",
	LATEST_CHANGE: "replaces the links on forum thread list to last posting of read threads",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS: new Array('lastpage'),

    run : function( page, doc ) {
        this._change( page, doc );
	},

	change : function( page, doc ) {
        this._change( page, doc );
	},

    _change : function( page, doc ){
        if (page == 'forum') {

            var perpage = FoxtrickPrefs.getInt('perpage');
            if (perpage == null) perpage = 20;
            var lastpage = (Foxtrick.isModuleFeatureEnabled( this, "lastpage" ));
            var divs  = Foxtrick.getElementsByClass("threadInfo", doc );
            for (i=0; i < divs.length; i++) {
                var id = divs[i].textContent;
                if (id.search(/\//)>-1) continue;
                if (lastpage) id = id - perpage + 1;
                if (id < 1) id = 1;
                var url = divs[i].parentNode.parentNode.getElementsByTagName('a')[0];
                url.href = url.href.replace(/n=\d+/,'n='+id);
            }

            var pager = doc.getElementById('threadContent');
            if (pager == null) return;
            var divs  = Foxtrick.getElementsByClass("fplThreadInfo", doc );
            for (i=0; i < divs.length; i++) {
                var id = Foxtrick.trim(divs[i].textContent);
                if (id.search(/\//)>-1) continue;
                if (lastpage) id = id - perpage + 1;
                if (id < 1) id = 1;
                var url = divs[i].parentNode.parentNode.getElementsByTagName('a')[0];
                url.href = url.href.replace(/n=\d+/,'n='+id);
            }
        }
        else {
            var select = doc.getElementById('ctl00_CPMain_ddlMessagesPerPage');
            if (select == null) return;
            var id = select.options[select.selectedIndex ].text;
            id = parseInt(id);
            FoxtrickPrefs.setInt("perpage", id);
        }
    }
};
