/**
 * forumanchors.js
 * Foxtrick Sets anchors to the top of a page
 * @author spambot
 */

var FoxtrickForumAnchors = {
	
    MODULE_NAME : "ForumAnchors",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : false,

    init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread', this );
    },

    run : function( page, doc ) { return;
        var docopyi = Foxtrick.isModuleEnabled(FoxtrickCopyPostID);
		
		
		var anchor = doc.createElement( "a" );
        anchor.href = "#logo";
        anchor.title = "TOP";
        var img = doc.createElement("img");
        img.style.padding = "0px 2px 2px 2px;";
        img.className = "actionIcon";
        img.alt = "anchor_top";
        img.title = "Goto Top";
        img.src = "chrome://foxtrick/content/resources/linkicons/anchor_top.png";
        anchor.appendChild(img);                        
        
		var body = doc.getElementById("mainBody");
        if (body != null) {
			var elems = getElementsByClass("float_right", body);
			var i = elems.length-1;
			if (i>=0) do {
                    var time = elems[i].innerHTML.match(/(\d{2})\:(\d{2})/);
                    if ( time!=null && time.length>1 && time[1] != null && time[2] != null ) {                                                    
                        elems[i].appendChild( anchor.cloneNode(true) );
                    }                
				} while (--i)  
        }
	},
	
	_copy_postid_to_clipboard : function(ev) { 
		var PostID = ev.target.getAttribute("name");		
		Foxtrick.copyStringToClipboard(PostID);
        ev.target.innerHTML=PostID; 

		var HeaderDiv = ev.target.parentNode.parentNode; 
		if (Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine , "SingleHeaderLine")
			&& HeaderDiv.className=="cfHeader singleLine") {
			
			if (HeaderDiv.firstChild.offsetWidth > HeaderDiv.offsetWidth - HeaderDiv.lastChild.offsetWidth - 30 ) {
					HeaderDiv.className = "cfHeader doubleLine";	
			}
		}
			
		ev.target.addEventListener( "click", FoxtrickForumAnchors._to_top, false );	
		ev.target.RemoveEventListener( "click", FoxtrickForumAnchors._copy_postid_to_clipboard, false );	
	},	
	
	_to_top : function(ev) {
		var PostID = ev.target.getAttribute("name");
		ev.target.href='/Forum/Read.aspx?t='+PostID.replace(/\.\d+/,'')+'&n='+PostID.replace(/\d+\./,'');	
	},	
	
	change : function( page, doc ) {
	
	}
};
