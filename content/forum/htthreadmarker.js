/**
 * htthreadmarker.js
 * Marks threads created by HTs.
 * @author Mod-PaV
 */

 var FoxtrickHTThreadMarker = {

    MODULE_NAME : "HTThreadMarker",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
    DEFAULT_ENABLED : true,

	init : function() {
		Foxtrick.registerPageHandler( 'forum', FoxtrickHTThreadMarker );
	},

	run : function( page, doc ) {
	
	try {
	
		this.ColorLatest (doc, "ctl00_CPMain_updLatestThreads", "folderitem");
		
		Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/"+
                                "resources/css/ht_thread.css");
                    
		var myForums = doc.getElementById( "myForums" );
		var divs = myForums.getElementsByTagName( "div" );
		var cname;

        // dump( "found " + links.length + "\n" );
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
				//dump (title+' '+poster+'\n');
				
				
				if ( poster.match(/ HT-\S+/))		//old:  (/.* HT-[^\s]*$/i ) )
				{
					var curr_class = div.getAttribute( "class" );
					if (!curr_class) curr_class='';
					div.setAttribute( "class", curr_class + " HT_thread" );
//					dump( "matched: " + title + " : "+curr_class+ "\n" );				
				}
			}	
		}
	} catch(e) {dump('HTThreadMarker: '+e+'\n');}
	},

    change : function( page, doc ) {
        this.run( page, doc );
    },
	
	ColorLatest : function (doc,id,classname) {
	
		var myForums = doc.getElementById( id );
		if (myForums) {
			var links = myForums.getElementsByTagName( "table" )[0];
			var cname;

                // dump( "found " + links.length + "\n" );
			for ( var i = 0; i < links.rows.length; ++i )
			{
				var title = links.rows[i].cells[1].childNodes[1].getElementsByTagName( "a" )[0].title;
				if ( title.match( /.* HT-[^\s]*$/i ) )
				{
					var curr_class = links.rows[i].cells[1].childNodes[1].getAttribute( "class" );
					links.rows[i].cells[1].childNodes[1].setAttribute( "class", curr_class + " HT_thread" );
					//dump( "matched: " + title + " : "+curr_class+ "\n" );
				}
			}
		}
	},
};
	 
	    
