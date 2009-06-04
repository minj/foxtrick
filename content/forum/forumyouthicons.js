/**
 * forumyouthicons.js
 * Foxtrick forum post youth icons 
 * @author spambot
 */

 var FoxtrickForumYouthIcons = {
    
    _DOC : {},
    MODULE_NAME : "ForumYouthIcons",
    MODULE_AUTHOR : "spambot",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8",	
	SCREENSHOT:"",
	PREF_SCREENSHOT:"",
	LASTEST_CHANGE:"Added to PAs, ticket system and guestbooks",
    
    _NEW_MESSAGE_WINDOW : 'ctl00_CPMain_ucEditor_tbBody',

    init : function() {
        Foxtrick.registerPageHandler( 'forumWritePost', this );
        Foxtrick.registerPageHandler( 'messageWritePost', this );
        Foxtrick.registerPageHandler( 'guestbook', this );
        Foxtrick.registerPageHandler( 'announcements', this );
        Foxtrick.registerPageHandler( 'ads', this );        
    },

    run : function( page, doc ) {
    
        Foxtrick.addJavaScript(doc, "chrome://foxtrick/content/resources/js/HattrickML.js");
         
        var div = doc.getElementById( "ft_youth_icons");
        if (div != null) return;

        if ( (page == 'ads' ) && (!doc.getElementById('ctl00_CPMain_txtInsert'))) return;
        if (page == 'ads' ) {
            anchor = doc.getElementById('ctl00_CPMain_txtInsert');
            anchor.setAttribute('rows','20');
            anchor.setAttribute('cols','60');
            
            var div = doc.createElement('div');
            div.setAttribute('class','HTMLToolbar');
            div.setAttribute('style','display:block;width:300px;');
            div.innerHTML="<img style=\"margin: 2px;\" onclick=\"insertQuote(document.getElementById('ctl00_CPMain_txtInsert'), document.getElementById('ctl00_CPMain_txtInsert'), 3900);\" src=\"/Img/Icons/transparent.gif\" class=\"f_quote2\" title=\"[q]\"><img style=\"margin: 2px;\" onclick=\"insertBold(document.getElementById('ctl00_CPMain_txtInsert'), document.getElementById('ctl00_CPMain_txtInsert'), 3900);\" src=\"/Img/Icons/transparent.gif\" class=\"f_bold\" title=\"[b]\"><img style=\"margin: 2px;\" onclick=\"insertItalic(document.getElementById('ctl00_CPMain_txtInsert'), document.getElementById('ctl00_CPMain_txtInsert'), 3900);\" src=\"/Img/Icons/transparent.gif\" class=\"f_italic\" title=\"[i]\"><img style=\"margin: 2px; width: 22px; height: 22px;\" onclick=\"insertUnderline(document.getElementById('ctl00_CPMain_txtInsert'), document.getElementById('ctl00_CPMain_txtInsert'), 3900);\" src=\"/Img/Icons/transparent.gif\" class=\"f_ul\" title=\"[u]\"><img style=\"width: 22px; height: 22px;\" onclick=\"insertRuler(document.getElementById('ctl00_CPMain_txtInsert'), document.getElementById('ctl00_CPMain_txtInsert'), 3900);\" src=\"/Img/Icons/transparent.gif\" class=\"f_hr\" title=\"[hr]\"><img onclick=\"insertPlayerID(document.getElementById('ctl00_CPMain_txtInsert'), document.getElementById('ctl00_CPMain_txtInsert'), 3900);\" src=\"/Img/Icons/transparent.gif\" class=\"f_player\" title=\"[playerID=xxx]\"><img onclick=\"insertTeamID(document.getElementById('ctl00_CPMain_txtInsert'), document.getElementById('ctl00_CPMain_txtInsert'), 3900);\" src=\"/Img/Icons/transparent.gif\" class=\"f_team\" title=\"[teamID=xxx]\"><img onclick=\"insertMatchID(document.getElementById('ctl00_CPMain_txtInsert'), document.getElementById('ctl00_CPMain_txtInsert'), 3900);\" src=\"/Img/Icons/transparent.gif\" class=\"f_match\" title=\"[matchID=xxx]\"><img onclick=\"insertFederationID(document.getElementById('ctl00_CPMain_txtInsert'), document.getElementById('ctl00_CPMain_txtInsert'), 3900);\" src=\"/Img/Icons/transparent.gif\" class=\"f_fed\" title=\"[fedID=xxx]\"><img onclick=\"insertMessage(document.getElementById('ctl00_CPMain_txtInsert'), document.getElementById('ctl00_CPMain_txtInsert'), 3900);\" src=\"/Img/Icons/transparent.gif\" class=\"f_message\" title=\"[post=xxx.yy]\"><img onclick=\"insertLeagueID(document.getElementById('ctl00_CPMain_txtInsert'), document.getElementById('ctl00_CPMain_txtInsert'), 3900);\" src=\"/Img/Icons/transparent.gif\" class=\"f_series\" title=\"[leagueID=xxx]\"><img onclick=\"insertLink(document.getElementById('ctl00_CPMain_txtInsert'), document.getElementById('ctl00_CPMain_txtInsert'), 3900);\" src=\"/Img/Icons/transparent.gif\" class=\"f_www\" title=\"[link=xxx]\">";
            anchor.parentNode.insertBefore( div, anchor );
        }
        
        var toolbar = Foxtrick.getElementsByClass( "HTMLToolbar", doc );
        toolbar = toolbar[0];
        if  (( toolbar == null ) && (!page == 'ads' )) return;
        var toolbar_main = toolbar;
        
        
        
        if ( (page == 'messageWritePost' ) && ( !Foxtrick.isStandardLayout( doc ) ) ) 
            try {
                var mainbbox = Foxtrick.getElementsByClass( "mainBox", doc )[0];
                mainbbox.setAttribute( "style", "padding-bottom:25px;");
            }
            catch (e)
            {
                dump('YouthIcons: mainBox not found ' + e + '\n');
            }
            
        toolbar.setAttribute("style","float:left; margin-right:3px;");
        
        if (page == 'guestbook') 
            try {
                var textbox = doc.getElementById( "ctl00_CPMain_ucHattrickMLEditor_txtBody" );
                textbox.setAttribute( "style", "height:100px;");
            }
            catch (e)
            {
                dump('YouthIcons: textbox not found ' + e + '\n');
            }        
        
        // Set styles of all buttons
        var nextElement = toolbar.firstChild;
        while (nextElement) {
            try {
                if ( nextElement.id == 'ctl00_CPMain_ucHattrickMLEditor_pnlTags' || 
                     nextElement.id == 'ctl00_CPMain_ucActionEditor_pnlTags' || 
                     nextElement.id == 'ctl00_CPMain_ucEditorMain_pnlTags' || 
                     nextElement.href != null 
                   ) {
                        nextElement.setAttribute("style","display:none") 
                }
                else {
                    nextElement.setAttribute("style","margin:2px");
                }
                nextElement = nextElement.nextSibling;
            } catch(e) { nextElement = nextElement.nextSibling; }
        }
        
        
        //simple test if new icons are set up by HTs
        var toolbar_test = Foxtrick.getElementsByClass( "f_hr", doc );
        //dump('Document child class "f_hr": ['+toolbar_test+']\n');
        if (toolbar_test.length != null) {
            var target=toolbar.lastChild;
            var tooldivs = doc.getElementsByTagName('img');
            for (var i = 0; i < tooldivs.length; i++) {
                if (tooldivs[i].className=="f_ul") { target=tooldivs[i]; break;}
            }
            target=target.nextSibling;
            var newimage = doc.createElement( "img" );
            newimage.src = "/Img/Icons/transparent.gif";
            newimage.addEventListener( "click", this._br , false );
            newimage.setAttribute( "class", "ft_br");
            newimage.setAttribute("style","margin:2px; width:22px; height:22px; cursor:pointer; background-image: url('chrome://foxtrick/content/resources/linkicons/format_br.png') !important;");
            newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.br");
            toolbar.insertBefore( newimage,target );

            /*
            if ( page != 'messageWritePost' ) {
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", FoxtrickForumYouthIcons._hr , false );
                newimage.setAttribute( "class", "f_hr");
                newimage.setAttribute("style","margin:2px; width:22px; height:22px;");
                newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.hr");
                toolbar.insertBefore( newimage,target );                                        
            }
            */

          
            var newimage = doc.createElement( "img" );
            newimage.src = "/Img/Icons/transparent.gif";
            newimage.addEventListener( "click", this._userid , false );
            newimage.setAttribute( "class", "ft_uid");
            newimage.setAttribute("style","margin:2px; width:22px; height:22px; cursor:pointer; background-image: url('chrome://foxtrick/content/resources/linkicons/format_user.png') !important;");
            newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.user");
            toolbar.insertBefore( newimage,target );                                                        
            
            var newimage = doc.createElement( "img" );
            newimage.src = "/Img/Icons/transparent.gif";
            newimage.addEventListener( "click", this._kitid , false );
            newimage.setAttribute( "class", "ft_kit");
            newimage.setAttribute("style","margin:2px; width:22px; height:22px; cursor:pointer; background-image: url('chrome://foxtrick/content/resources/linkicons/format_kit.png') !important;");
            newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.kit");
            toolbar.insertBefore( newimage,target );                                                        

            var newimage = doc.createElement( "img" );
            newimage.src = "/Img/Icons/transparent.gif";
            newimage.addEventListener( "click", this._articleid , false );
            newimage.setAttribute( "class", "ft_aid");
            newimage.setAttribute("style","margin:2px; width:22px; height:22px; cursor:pointer; background-image: url('chrome://foxtrick/content/resources/linkicons/format_article.png') !important;");
            newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.article");
            toolbar.insertBefore( newimage,target );                                                        
            
        }                
        
        var toolbar_label = doc.createElement( "div" );
        toolbar_label.innerHTML = Foxtrickl10n.getString("ForumYouthIcons.labelToolbar");
        toolbar_label.setAttribute( "style" , "background-color:#D0D0D0;;margin-bottom:3px;text-align:center;");
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
        youthbar_label.id = "ft_youth_icons";
        youthbar_label.innerHTML = Foxtrickl10n.getString("ForumYouthIcons.label");
        youthbar_label.setAttribute( "style" , "background-color:#D0D0D0;;margin-bottom:3px;text-align:center;");
        youthbar.appendChild( youthbar_label);                
        
        var newimage = doc.createElement( "img" );
        newimage.src = "/Img/Icons/transparent.gif";
        newimage.addEventListener( "click", FoxtrickForumYouthIcons._youthplayer , false );
        newimage.setAttribute( "class", "f_player");
        newimage.setAttribute("style","margin:2px");
        newimage.title = Foxtrickl10n.getString("ForumYouthIcons.youthplayerid");
        youthbar.appendChild( newimage );

        var newimage = doc.createElement( "img" );
        newimage.src = "/Img/Icons/transparent.gif";
        newimage.addEventListener( "click", FoxtrickForumYouthIcons._youthteam , false );
        newimage.setAttribute( "class", "f_team");
        newimage.setAttribute("style","margin:2px");
        newimage.title = Foxtrickl10n.getString("ForumYouthIcons.youthteamid");
        youthbar.appendChild( newimage );
        
        var newimage = doc.createElement( "img" );
        newimage.src = "/Img/Icons/transparent.gif";
        newimage.addEventListener( "click", FoxtrickForumYouthIcons._youthmatch , false );
        newimage.setAttribute( "class", "f_match");
        newimage.setAttribute("style","margin:2px");
        newimage.title = Foxtrickl10n.getString("ForumYouthIcons.youthmatchid");
        youthbar.appendChild( newimage );                
        
        var newimage = doc.createElement( "img" );
        newimage.src = "/Img/Icons/transparent.gif";
        newimage.addEventListener( "click", FoxtrickForumYouthIcons._youthseries , false );
        newimage.setAttribute( "class", "f_series");
        newimage.setAttribute("style","margin:2px");
        newimage.title = Foxtrickl10n.getString("ForumYouthIcons.youthseries");
        youthbar.appendChild( newimage );
        
        var head = toolbar.parentNode;
        head.insertBefore( youthbar, toolbar.nextSibling );
    },
	
	change : function( page, doc ) {
        var div = doc.getElementById( "ft_youth_icons");
        if (div != null) return;
	},
        
    _youthplayer : function (  ) {
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody'), "[youthplayerid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[youthplayerid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[youthplayerid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert'), "[youthplayerid=xxx]", null, "xxx", null)
    }, 

    _youthteam : function (  ) { 
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody'), "[youthteamid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[youthteamid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[youthteamid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert'), "[youthteamid=xxx]", null, "xxx", null)
    }, 

    _youthmatch : function (  ) { 
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody'), "[youthmatchid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[youthmatchid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[youthmatchid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert'), "[youthmatchid=xxx]", null, "xxx", null)
    }, 

    _youthseries : function (  ) { 
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody'), "[youthleagueid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[youthleagueid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[youthleagueid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert'), "[youthleagueid=xxx]", null, "xxx", null)
    }, 
    
    _userid : function (  ) { 
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody'), "[userid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[userid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[userid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert'), "[userid=xxx]", null, "xxx", null)
    },         
        
    _kitid : function (  ) { 
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody'), "[kitid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[kitid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[kitid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert'), "[kitid=xxx]", null, "xxx", null)
    },         

    _articleid : function (  ) { 
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody'), "[articleid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[articleid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[articleid=xxx]", null, "xxx", null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert'), "[articleid=xxx]", null, "xxx", null)
    }, 
        
    _br : function (  ) {
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody'), "[br]", null, null, null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[br]", null, null, null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[br]", null, null, null)
        if ( FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert') != null ) clickHandler(FoxtrickForumYouthIcons._DOC.getElementById('ctl00_CPMain_txtInsert'), "[br]", null, null, null)
    },         
        
    _fillMsgWindow : function( string ) {
        try {
            var msg_window = FoxtrickForumYouthIcons._DOC.getElementById( FoxtrickForumYouthIcons._NEW_MESSAGE_WINDOW );
            msg_window.value += string;
            msg_window.focus();        
        } catch(e) {
            dump('FoxtrickForumYouthIcons'+e);
        }
    },
    
    
};

