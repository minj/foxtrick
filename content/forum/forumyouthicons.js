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
                
                FoxtrickForumYouthIcons._DOC = doc;
                
                var newimage = doc.createElement( "img" );
                newimage.src = "chrome://foxtrick/content/resources/linkicons/format_player_y.png";
                newimage.addEventListener( "click", this._youthplayer , false );
                newimage.setAttribute( "class", "f_player");
                newimage.title = "add_youthplayer_link";
                toolbar.appendChild( newimage );

                var newimage = doc.createElement( "img" );
                newimage.src = "chrome://foxtrick/content/resources/linkicons/format_team_y.png";
                newimage.addEventListener( "click", this._youthteam , false );
                newimage.setAttribute( "class", "f_team");
                newimage.title = "add_youthplayer_team";
                toolbar.appendChild( newimage );
                
                var newimage = doc.createElement( "img" );
                newimage.src = "chrome://foxtrick/content/resources/linkicons/format_match_y.png";
                newimage.addEventListener( "click", this._youthmatch , false );
                newimage.setAttribute( "class", "f_match");
                newimage.title = "add_youthplayer_match";
                toolbar.appendChild( newimage );                
                
                var newimage = doc.createElement( "img" );
                newimage.src = "chrome://foxtrick/content/resources/linkicons/format_series_y.png";
                newimage.addEventListener( "click", this._youthseries , false );
                newimage.setAttribute( "class", "f_series");
                newimage.title = "add_youthplayer_series";
                toolbar.appendChild( newimage );                
                
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

function getElementsByClass(searchClass,node,tag) {
	var classElements = new Array();
	if ( node == null )
		node = document;
	if ( tag == null )
		tag = '*';
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
	for (i = 0, j = 0; i < elsLen; i++) {
		if ( pattern.test(els[i].className) ) {
			classElements[j] = els[i];
			j++;
		}
	}
	return classElements;
}