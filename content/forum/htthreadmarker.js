/**
 * htthreadmarker.js
 * Marks threads created by HTs.
 * @author Mod-PaV
 */

 var FoxtrickHTThreadMarker = {

    MODULE_NAME : "HTThreadMarker",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forum'), 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Fix for latest forum change",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	init : function() {
	},

	run : function( page, doc ) {
	
	try {
	
		this.ColorLatest (doc, "threadContent", "folderitem");
		
		Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/"+
                                "resources/css/ht_thread.css");
                    
		var myForums = doc.getElementById("content").getElementsByTagName('div')[0];
		var divs = myForums.getElementsByTagName( "div" );
		var cname;

        // Foxtrick.dump( "found " + links.length + "\n" );
		var i = 0, div;
		while ( div = divs[++i] ) {
			cname = div.getAttribute( "class" ); 
			if ( cname ==  "url" )
			{	
				var inner =div.childNodes[0].innerHTML;
				var strong=div.getElementsByTagName('strong');
				if (strong!=null && strong[0]!=null) {inner=strong[0].innerHTML;}
				var title = div.childNodes[0].getAttribute( "title" ).replace(inner,'');
				//var title = div.childNodes[0].getAttribute( "title" );
				var poster = title;//.substring(title.lastIndexOf(' '));
				//Foxtrick.dump (title+' '+poster+'\n');
				
				
				if ( poster.match(/ HT-\S+/))		//old:  (/.* HT-[^\s]*$/i ) )
				{
					var curr_class = div.getAttribute( "class" );
					if (!curr_class) curr_class='';
					div.setAttribute( "class", curr_class + " HT_thread" );
//					Foxtrick.dump( "matched: " + title + " : "+curr_class+ "\n" );				
				}
			}	
		}
	} catch(e) {Foxtrick.dump('HTThreadMarker: '+e+'\n');}
	},

    change : function( page, doc ) {
        this.run( page, doc );
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
				
				for ( var i = 0; i < links[j].rows.length; ++i )
				{	if (links[j].rows[i].cells.length<=1) continue;
					var title = links[j].rows[i].cells[1].childNodes[1].getElementsByTagName( "a" )[0].title;					
					if ( title.match( /.* HT-[^\s]*$/i ) )
					{
						var curr_class = links[j].rows[i].cells[1].childNodes[1].getAttribute( "class" );
						links[j].rows[i].cells[1].childNodes[1].setAttribute( "class", curr_class + " HT_thread" );
//						Foxtrick.dump( "matched: " + title + " : "+curr_class+ "\n" );
					}
				}
			}
		}
	},
};
	 
	    
