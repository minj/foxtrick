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
		var myForums = doc.getElementById( "myForums" );
		var links = myForums.getElementsByTagName( "td" );
		var cname;

                // dump( "found " + links.length + "\n" );
		for ( var i = 0; i < links.length; ++i )
		{
			cname = links[i].getAttribute( "class" );
			if ( cname == "url" )
			{
				var title = links[i].childNodes[0].childNodes[0].getAttribute( "title" );

				if ( title.match( /.* HT-[^\s]*$/i ) )
				{
					// dump( "matched: " + title + "\n" );
					var curr_class = links[i].childNodes[0].getAttribute( "class" );
					links[i].childNodes[0].setAttribute( "class", curr_class + " HT_thread" );
				}
			}	
		}
	},

    change : function( page, doc ) {
        this.run( page, doc );
    }
};
	 
	    
