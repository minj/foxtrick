/**
 * forumyouthicons.js
 * Foxtrick forum post youth icons 
 * @author spambot
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickForumYouthIcons = {
    
    _DOC : {},
    MODULE_NAME : "ForumYouthIcons",
    MODULE_AUTHOR : "spambot",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
    DEFAULT_ENABLED : true,
    
    _NEW_MESSAGE_WINDOW : 'ctl00_CPMain_ucEditor_tbBody',

    init : function() {
        Foxtrick.registerPageHandler( 'forumWritePost',
                                      FoxtrickForumYouthIcons );
    },

    run : function( page, doc ) {

        switch( page )
        {
            case 'forumWritePost':
                
                var toolbar = getElementsByClass( "HTMLToolbar", doc );
                toolbar = toolbar[0];
				toolbar.setAttribute("style","float:left; margin-right:3px;");
				
				// Set styles of all buttons
				var nextElement = toolbar.firstChild;
				while (nextElement) {
					try {
						nextElement.setAttribute("style","margin:2px");
						nextElement = nextElement.nextSibling;
					} catch(e) { nextElement = nextElement.nextSibling; }
				}
				
				var toolbar_label = doc.createElement( "div" );
                toolbar_label.innerHTML = Foxtrickl10n.getString("ForumYouthIcons.labelToolbar");
                toolbar_label.setAttribute( "style" , "background-color:#FEDCBA;margin-bottom:3px;text-align:center;");
                toolbar.insertBefore( toolbar_label, toolbar.firstChild );
							
				// Set styles of next siblings
				var nextElement = toolbar.nextSibling;
				while (nextElement) {
					try {
						nextElement.setAttribute("style","clear:both;");
						nextElement = nextElement.nextSibling;
					} catch(e) { nextElement = nextElement.nextSibling; }
				}
                
                FoxtrickForumYouthIcons._DOC = doc;
                
                var youthbar = doc.createElement( "div" );
                youthbar.setAttribute( "class" , "HTMLToolbar");
                youthbar.setAttribute( "style" , "float:left;");

                var youthbar_label = doc.createElement( "div" );
                youthbar_label.innerHTML = Foxtrickl10n.getString("ForumYouthIcons.label");
                youthbar_label.setAttribute( "style" , "background-color:#FEDCBA;margin-bottom:3px;text-align:center;");
                youthbar.appendChild( youthbar_label);                
                
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._youthplayer , false );
                newimage.setAttribute( "class", "f_player");
				newimage.setAttribute("style","margin:2px");
                newimage.title = Foxtrickl10n.getString("ForumYouthIcons.youthplayerid");
                youthbar.appendChild( newimage );

                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._youthteam , false );
                newimage.setAttribute( "class", "f_team");
				newimage.setAttribute("style","margin:2px");
                newimage.title = Foxtrickl10n.getString("ForumYouthIcons.youthteamid");
                youthbar.appendChild( newimage );
                
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._youthmatch , false );
                newimage.setAttribute( "class", "f_match");
				newimage.setAttribute("style","margin:2px");
                newimage.title = Foxtrickl10n.getString("ForumYouthIcons.youthmatchid");
                youthbar.appendChild( newimage );                
                
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._youthseries , false );
                newimage.setAttribute( "class", "f_series");
				newimage.setAttribute("style","margin:2px");
                newimage.title = Foxtrickl10n.getString("ForumYouthIcons.youthseries");
                youthbar.appendChild( newimage );

                var head = toolbar.parentNode;
                head.insertBefore( youthbar, toolbar.nextSibling );

                break;
        }
    },
	
	change : function( page, doc ) {
	
	},
        

    _youthplayer : function (  ) {
        FoxtrickForumYouthIcons._fillMsgWindow( "[youthplayerid=xxx]" ); 
    }, 

    _youthteam : function (  ) { 
        FoxtrickForumYouthIcons._fillMsgWindow( "[youthteamid=xxx]"); 
    }, 

    _youthmatch : function (  ) { 
        FoxtrickForumYouthIcons._fillMsgWindow( "[link=/Club/Matches/Match.aspx?matchID=xxx&isYouth=True]"); 
    }, 

    _youthseries : function (  ) { 
        FoxtrickForumYouthIcons._fillMsgWindow( "[link=/World/Series/YouthSeries.aspx?YouthLeagueId=xxx]"); 
    }, 
    _fillMsgWindow : function( string ) {
        try {
            var msg_window = FoxtrickForumYouthIcons._DOC.getElementById( FoxtrickForumYouthIcons._NEW_MESSAGE_WINDOW );
            msg_window.value += string;
            msg_window.focus();        
        } catch(e) {
            dump(e);
        }
    },        
};