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
	NEW_AFTER_VERSION: "0.5.0.5",
	LATEST_CHANGE:"Fix for threads with masked chars",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	init : function() {
	},

	run : function( page, doc ) {
	
	try {
		
		this.ColorLatest (doc, "threadContent", "folderitem");
		
//		if (doc.getElementById( 'HT_thread0' )) return;
//		Foxtrick.dump(this.MODULE_NAME+' change\n')
    
		var myForums = doc.getElementById("content").getElementsByTagName('div')[0];
		var divs = myForums.getElementsByTagName( "div" );
		var cname;
		//var htthreadnum=0;
		
        // Foxtrick.dump( "found " + links.length + "\n" );
		var i = 0, div;
		while ( div = divs[++i] ) {
			cname = div.getAttribute( "class" ); 
			if ( cname ==  "url" )
			{	
				//if (htthreadnum==0) div.setAttribute( "id", "HT_thread"+htthreadnum );
				//htthreadnum++;

				var inner =div.childNodes[0];
				var strong=div.getElementsByTagName('strong');
				if (strong!=null && strong[0]!=null) {inner=strong[0];}
				inner=inner.firstChild.data;
				//Foxtrick.dump (inner+' '+div.childNodes[0].getAttribute( "title" )+'\n');
				var title = div.childNodes[0].getAttribute( "title" ).replace(inner,'');
								//var title = div.childNodes[0].getAttribute( "title" );
				var poster = title;//.substring(title.lastIndexOf(' '));
				//Foxtrick.dump (title+' '+poster+'\n');
				
				
				if ( poster.match(/ HT-\S+/))		//old:  (/.* HT-[^\s]*$/i ) )
				{
					//Foxtrick.dump (inner.nodeType+' : '+ inner.nodeValue+' : '+inner.data+' : '+inner.innerHTML+' : '+div.childNodes[0].getAttribute( "title" )+'\n');
					var curr_class = div.getAttribute( "class" );
					if (!curr_class) curr_class='';
					if (curr_class.search('HT_thread')==-1) {
						div.setAttribute( "class", curr_class + " HT_thread" );
						//Foxtrick.dump( "matched: " + title + " : "+curr_class+ "\n" );
					}
				}
			}	
		}
	} catch(e) {Foxtrick.dump('HTThreadMarker: '+e+'\n');}
	},

    change : function( page, doc ) {        
        this.run( page, doc );
	},
	
	ColorLatest : function (doc,id,classname) {
		//if (doc.getElementById( 'HT_threadLatest0' )) return;
    
		var myForums = doc.getElementById( id );
		if (myForums) {
			//Foxtrick.dump('ColorLatest change\n')
			//var htthreadnum=0;
			var links = myForums.getElementsByTagName( "table" );

			for (var j=0;j<links.length;j++) {
				var cname;

				if (links[j].rows.length==0 
					|| links[j].rows[0].cells.length==0 
					|| links[j].rows[0].cells[0].className.search('date')==-1) continue;
				
				for ( var i = 0; i < links[j].rows.length; ++i )
				{	if (links[j].rows[i].cells.length<=1) continue;
					var node = links[j].rows[i].cells[1].childNodes[1];
					var title = node.getElementsByTagName( "a" )[0].title;					
					if ( title.match( /.* HT-[^\s]*$/i ) )
					{
						var curr_class = node.getAttribute( "class" );
						if (curr_class.search('HT_thread')==-1) {
							node.setAttribute( "class", curr_class + " HT_thread" );
							//node.setAttribute( "id", "HT_threadLatest"+htthreadnum );
							//htthreadnum++;
							//Foxtrick.dump( "matched: " + title + " : "+curr_class+ "\n" );
						}
					}
				}
			}
		}
	},
};
	 
	    
