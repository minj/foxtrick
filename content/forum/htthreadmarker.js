/**
 * htthreadmarker.js
 * Marks threads created by HTs.
 * @author Mod-PaV
 */

 var FoxtrickHTThreadMarker = {

    MODULE_NAME : "HTThreadMarker",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forum'),
    CSS : Foxtrick.ResourcePath + "resources/css/ht-thread.css",
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Use CSS file for styling.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	run : function( page, doc ) {
		this.ColorLatest(doc, "threadContent", "folderitem");

		var myForums = doc.getElementById("content").getElementsByTagName('div')[0];
		var divs = myForums.getElementsByTagName( "div" );
		var cname;

		var i = 0, div;
		while (div = divs[++i]) {
			cname = div.getAttribute( "class" );
			if (cname == "url" ) {
				var inner =div.childNodes[0];
				var strong = div.getElementsByTagName('strong');
				if (strong != null && strong[0] != null) {
					inner=strong[0];
				}
				inner = inner.firstChild.data;
				var title = div.childNodes[0].getAttribute("title").replace(inner,'');
				var poster = title;

				if (poster.match(/ HT-\S+/)) {
					Foxtrick.addClass(div, "ft-ht-thread");
				}
			}
		}
	},

    change : function( page, doc ) {
        this.run(page, doc);
	},

	ColorLatest : function (doc,id,classname) {
		var myForums = doc.getElementById( id );
		if (myForums) {
			var links = myForums.getElementsByTagName( "table" );

			for (var j=0;j<links.length;j++) {
				var cname;

				if (links[j].rows.length==0
					|| links[j].rows[0].cells.length==0
					|| links[j].rows[0].cells[0].className.search('date')==-1) continue;

				for ( var i = 0; i < links[j].rows.length; ++i ) {
					if (links[j].rows[i].cells.length<=1) continue;
					var node = links[j].rows[i].cells[1].childNodes[1];
					var title = node.getElementsByTagName( "a" )[0].title;
					if (title.match( /.* HT-[^\s]*$/i )) {
						Foxtrick.addClass(node, "ft-ht-thread");
					}
				}
			}
		}
	}
};
