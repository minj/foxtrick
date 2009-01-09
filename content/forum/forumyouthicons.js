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
                
                var youthbar = doc.createElement( "div" );
                youthbar.setAttribute( "class" , "HTMLToolbar");
                youthbar.setAttribute( "style" , "width:130px;height:auto;background-color:#ABCDEF;margin-top:6px;text-align:center;");

                var youthbar_label = doc.createElement( "div" );
                youthbar_label.innerHTML = "Youth Links (Beta)";
                youthbar_label.setAttribute( "style" , "width:130px;height:auto;background-color:#FEDCBA;margin-top:6px;text-align:center;");
                youthbar.appendChild( youthbar_label);                
                
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._youthplayer , false );
                newimage.setAttribute( "class", "f_player");
                newimage.title = "add_youthplayer_link";
                youthbar.appendChild( newimage );

                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._youthteam , false );
                newimage.setAttribute( "class", "f_team");
                newimage.title = "add_youthplayer_team";
                youthbar.appendChild( newimage );
                
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._youthmatch , false );
                newimage.setAttribute( "class", "f_match");
                newimage.title = "add_youthplayer_match";
                youthbar.appendChild( newimage );                
                
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._youthseries , false );
                newimage.setAttribute( "class", "f_series");
                newimage.title = "add_youthplayer_series";
                youthbar.appendChild( newimage );
                var head = toolbar.parentNode;
                				
                head.insertBefore( youthbar, toolbar );                

                
                
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