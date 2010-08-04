/**
 * forumyouthicons.js
 * Foxtrick forum post youth icons
 * @author spambot
 */

 var FoxtrickForumYouthIcons = {

    MODULE_NAME : "ForumYouthIcons",
    MODULE_AUTHOR : "spambot",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumWritePost","messageWritePost","guestbook","announcements","ads","newsletter","forumModWritePost"),
    DEFAULT_ENABLED : true,
    OPTIONS :  new Array("user_id", "kit_id", "article_id", "line_br", "clock", "spoiler", "pre", "table", "youth_player", "youth_team", "youth_match", "youth_series", "enlarge_input"),

	NEW_AFTER_VERSION: "0.5.2.1",
	LATEST_CHANGE:"Added table button",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

    _NEW_MESSAGE_WINDOW : 'ctl00_CPMain_ucEditor_tbBody',
	
    run : function( page, doc ) {
    try {
        Foxtrick.dump('PAGE: ' + page + '\n');
        var show_main = false; var show_youth = false; 
        var enlarge = Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "enlarge_input");
        if ((Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "user_id")) ||
            (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "kit_id")) ||
            (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "article_id")) ||
            (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "line_br")) ||
            (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "clock")) ||
            (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "spoiler"))
            )
            show_main = true;
        if ((Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "youth_player")) ||
            (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "youth_team")) ||
            (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "youth_match")) ||
            (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "youth_series")))
            show_youth = true;

        var div = doc.getElementById( "ft_youth_icons");
        if (div != null) return;
        var textarea = doc.getElementsByTagName('textarea')[0]
		if (textarea == null ) return;
		
        Foxtrick.addJavaScript(doc, Foxtrick.ResourcePath+"resources/js/HattrickML.js");
        
		if (doc.getElementById('ctl00_CPMain_tbNewsBody') != null) page = 'mailnewsletter';
        // Foxtrick.dump('YOUTH => ' + page +'\n');
        if ( (page == 'ads' ) && (!doc.getElementById('ctl00_CPMain_txtInsert'))) return;

        if (page == 'ads' || page == 'newsletter' || page == 'mailnewsletter') {
            if (page == 'ads' ) var textbox = 'ctl00_CPMain_txtInsert';
            if (page == 'newsletter' ) var textbox = 'ctl00_CPMain_txtMessage';
            if (page == 'mailnewsletter' ) var textbox = 'ctl00_CPMain_tbNewsBody';

            var anchor = doc.getElementById(textbox);

            if (page == 'ads') {
                var count = "ctl00_CPMain_txtCharCount";
                var chars = 2000;
                if (enlarge) {
                    anchor.setAttribute('rows','20');
                    anchor.setAttribute('cols','60');
                }
            }
            if (page == 'newsletter') {
                var count = "ctl00_CPMain_txtCharsLeft";
                var chars = 1000;
                if (enlarge) {
                    anchor.setAttribute('rows','20');
                    anchor.setAttribute('cols','50');
                }
            }
            if (page == 'mailnewsletter') {
                var counter = doc.getElementsByName('remlennews')[0];
                counter.id = "ctl00_CPMain_txtCharsLeft";
                var count = "ctl00_CPMain_txtCharsLeft";
                var chars = 1000;
                {
                    anchor.setAttribute('rows','20');
                    anchor.setAttribute('cols','50');
                }
            }

            var div = doc.createElement('div');
            div.setAttribute('class','HTMLToolbar');
            div.setAttribute('style','display:block;width:300px;');
            div.innerHTML="<img style=\"margin: 2px;\" onclick=\"insertQuote(document.getElementById('" + textbox + "'), document.getElementById('" + count + "'), " + chars + ");\" src=\"/Img/Icons/transparent.gif\" class=\"f_quote2\" title=\"[q]\"><img style=\"margin: 2px;\" onclick=\"insertBold(document.getElementById('" + textbox + "'), document.getElementById('" + count + "'), " + chars + ");\" src=\"/Img/Icons/transparent.gif\" class=\"f_bold\" title=\"[b]\"><img style=\"margin: 2px;\" onclick=\"insertItalic(document.getElementById('" + textbox + "'), document.getElementById('" + count + "'), " + chars + ");\" src=\"/Img/Icons/transparent.gif\" class=\"f_italic\" title=\"[i]\"><img style=\"margin: 2px; width: 22px; height: 22px;\" onclick=\"insertUnderline(document.getElementById('" + textbox + "'), document.getElementById('" + count + "'), " + chars + ");\" src=\"/Img/Icons/transparent.gif\" class=\"f_ul\" title=\"[u]\"><img style=\"width: 22px; height: 22px;\" onclick=\"insertRuler(document.getElementById('" + textbox + "'), document.getElementById('" + count + "'), " + chars + ");\" src=\"/Img/Icons/transparent.gif\" class=\"f_hr\" title=\"[hr]\"><img onclick=\"insertPlayerID(document.getElementById('" + textbox + "'), document.getElementById('" + count + "'), " + chars + ");\" src=\"/Img/Icons/transparent.gif\" class=\"f_player\" title=\"[playerID=xxx]\"><img onclick=\"insertTeamID(document.getElementById('" + textbox + "'), document.getElementById('" + count + "'), " + chars + ");\" src=\"/Img/Icons/transparent.gif\" class=\"f_team\" title=\"[teamID=xxx]\"><img onclick=\"insertMatchID(document.getElementById('" + textbox + "'), document.getElementById('" + count + "'), " + chars + ");\" src=\"/Img/Icons/transparent.gif\" class=\"f_match\" title=\"[matchID=xxx]\"><img onclick=\"insertFederationID(document.getElementById('" + textbox + "'), document.getElementById('" + count + "'), " + chars + ");\" src=\"/Img/Icons/transparent.gif\" class=\"f_fed\" title=\"[fedID=xxx]\"><img onclick=\"insertMessage(document.getElementById('" + textbox + "'), document.getElementById('" + count + "'), " + chars + ");\" src=\"/Img/Icons/transparent.gif\" class=\"f_message\" title=\"[post=xxx.yy]\"><img onclick=\"insertLeagueID(document.getElementById('" + textbox + "'), document.getElementById('" + count + "'), " + chars + ");\" src=\"/Img/Icons/transparent.gif\" class=\"f_series\" title=\"[leagueID=xxx]\"><img onclick=\"insertLink(document.getElementById('" + textbox + "'), document.getElementById('" + count + "'), " + chars + ");\" src=\"/Img/Icons/transparent.gif\" class=\"f_www\" title=\"[link=xxx]\">";
            anchor.parentNode.insertBefore( div, anchor );
        }

        if (page == 'forumWritePost' && enlarge) {
                //var anchor = doc.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody');
                var anchor = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
                anchor.style.height = '300px';
        }
		
		if (page == 'forumModWritePost' && enlarge) {
                //var anchor = doc.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody');
                var anchor = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
                anchor.style.height = '300px';
        }

        if (page == 'announcements' && enlarge) {
                var anchor = doc.getElementById('ctl00_CPMain_ucHattrickMLEditor_txtBody');
                anchor.style.height = '300px';
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
                Foxtrick.dump('YouthIcons: mainBox not found ' + e + '\n');
            }

        toolbar.setAttribute("style","float:left; margin-right:3px;");

        if (page == 'guestbook')
            try {
                var textbox = doc.getElementById( "ctl00_CPMain_ucHattrickMLEditor_txtBody" );
                textbox.setAttribute('style' , 'height:100px; width:100%');
            }
            catch (e)
            {
                Foxtrick.dump('YouthIcons: textbox not found ' + e + '\n');
            }

        // Set styles of all buttons
        var nextElement = toolbar.firstChild;
        while (nextElement) {
            try {
                if ( nextElement.id == 'ctl00_CPMain_ucHattrickMLEditor_pnlTags' ||
                     nextElement.id == 'ctl00_CPMain_ucActionEditor_pnlTags' ||
                     nextElement.id == 'ctl00_CPMain_ucEditorMain_pnlTags' ||
                     nextElement.id.search('ctl00_ctl00_CPContent_CPMain_uc') != -1 ||
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
        //Foxtrick.dump('Document child class "f_hr": ['+toolbar_test+']\n');
        if (toolbar_test.length != null) {
            var target=toolbar.lastChild;
            var tooldivs = doc.getElementsByTagName('img');
            for (var i = 0; i < tooldivs.length; i++) {
                if (tooldivs[i].className=="f_ul") { target=tooldivs[i]; break;}
            }
            target=target.nextSibling;

			if (page == 'announcements'){
            var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._q , false );
                newimage.setAttribute( "class", "ft_q");
                newimage.setAttribute("style","margin:2px; width:22px; height:22px; cursor:pointer; background-image: url('"+Foxtrick.ResourcePath+"resources/img/ht-ml/format_q.png') !important;");
                newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.q");
                toolbar.insertBefore( newimage,target );
			}
			
            if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "line_br")) {
            var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._br , false );
                newimage.setAttribute( "class", "ft_br");
                newimage.setAttribute("style","margin:2px; width:22px; height:22px; cursor:pointer; background-image: url('"+Foxtrick.ResourcePath+"resources/img/ht-ml/format_br.png') !important;");
                newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.br");
                toolbar.insertBefore( newimage,target );
            }
            
            if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "user_id")) {
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._userid , false );
                newimage.setAttribute( "class", "ft_uid");
                newimage.setAttribute("style","margin:2px; width:22px; height:22px; cursor:pointer; background-image: url('"+Foxtrick.ResourcePath+"resources/img/ht-ml/format_user.png') !important;");
                newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.user");
                toolbar.insertBefore( newimage,target );
            }
            
            if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "kit_id")) {
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._kitid , false );
                newimage.setAttribute( "class", "ft_kit");
                newimage.setAttribute("style","margin:2px; width:22px; height:22px; cursor:pointer; background-image: url('"+Foxtrick.ResourcePath+"resources/img/ht-ml/format_kit.png') !important;");
                newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.kit");
                toolbar.insertBefore( newimage,target );
            }
            
            if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "article_id")) {
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._articleid , false );
                newimage.setAttribute( "class", "ft_aid");
                newimage.setAttribute("style","margin:2px; width:22px; height:22px; cursor:pointer; background-image: url('"+Foxtrick.ResourcePath+"resources/img/ht-ml/format_article.png') !important;");
                newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.article");
                toolbar.insertBefore( newimage,target );
            }
            
            if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "clock")) {
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._clock , false );
                newimage.setAttribute( "class", "ft_clock");
                newimage.setAttribute("style", "margin:2px; width:22px; height:22px; cursor:pointer; background-image: url('"+Foxtrick.ResourcePath+"resources/img/ht-ml/format_clock.png') !important;");
                newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.clock");
                toolbar.insertBefore( newimage,target );
            }  

            if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "spoiler")) {
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._spoiler , false );
                newimage.setAttribute( "class", "ft_spoiler");
                newimage.setAttribute("style", "margin:2px; width:22px; height:22px; cursor:pointer; background-image: url('"+Foxtrick.ResourcePath+"resources/img/ht-ml/format_spoiler.png') !important;");
                newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.spoiler");
                toolbar.insertBefore( newimage,target );
            }

            if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "pre")) {
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._pre , false );
                newimage.setAttribute( "class", "ft_pre");
                newimage.setAttribute("style", "margin:2px; width:22px; height:22px; cursor:pointer; background-image: url('"+Foxtrick.ResourcePath+"resources/img/ht-ml/format_pre.png') !important;");
                newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.pre");
                toolbar.insertBefore( newimage,target );
            }
            if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "table")) {
				var span = doc.createElement("span");
				span.className = "ft-pop-up-span-icon";

				var newimage = doc.createElement("img");
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", this._table , false );
                newimage.setAttribute('separator',FoxtrickPrefs.getString("table_separator"));
				newimage.setAttribute('id','ft_table_button_id');
				newimage.setAttribute( "class", "ft_table");
                newimage.setAttribute("style", "margin:2px; width:22px; height:22px; cursor:pointer; background-image: url('"+Foxtrick.ResourcePath+"resources/img/ht-ml/format_table.png') !important;");
                newimage.title = Foxtrickl10n.getString("ForumSpecialBBCode.table").replace(/%s/, FoxtrickPrefs.getString("table_separator"));
                span.appendChild(newimage);

				var possibleSeparetors=[' ', ',', ';', '|'];

				var list = doc.createElement("ul");
				list.className = "ft-pop";
				for (var i=0; i<possibleSeparetors.length; ++i) { 
					var item = doc.createElement("li");
					var link = doc.createElement("span");
					link.addEventListener("click", this._table, false);
					link.setAttribute('separator', possibleSeparetors[i]);
					link.textContent = Foxtrickl10n.getString('ForumSpecialBBCode.tableSeparator').replace(/%s/, possibleSeparetors[i]);
					item.appendChild(link);
					list.appendChild(item);
				}
			
				span.appendChild(list);
				toolbar.insertBefore(span,target);
            }
        }

        var toolbar_label = doc.createElement( "div" );
        toolbar_label.innerHTML = Foxtrickl10n.getString("ForumYouthIcons.labelToolbar");
        toolbar_label.setAttribute( "style" , "background-color:#D0D0D0;;margin-bottom:3px;text-align:center;");
        toolbar.insertBefore( toolbar_label, toolbar.firstChild );

        // Set styles of next siblings
        var nextElement = toolbar.nextSibling;
        while (nextElement) {
            try {
                if (nextElement.id.search('ctl00_') == -1) {
                    nextElement.setAttribute("style","clear:both;");
                }    
                nextElement = nextElement.nextSibling;
            } catch(e) { nextElement = nextElement.nextSibling; }
        }

        if (show_youth || true) {
            var youthbar = doc.createElement( "div" );
            youthbar.setAttribute( "class" , "HTMLToolbar");
            youthbar.setAttribute( "style" , "float:left;");

            var youthbar_label = doc.createElement( "div" );
            youthbar_label.id = "ft_youth_icons";
            youthbar_label.innerHTML = Foxtrickl10n.getString("ForumYouthIcons.label");
            youthbar_label.setAttribute( "style" , "background-color:#D0D0D0;;margin-bottom:3px;text-align:center;");
            if (!show_youth) youthbar_label.setAttribute( "style" , "display:none;");
            youthbar.appendChild( youthbar_label);

            if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "youth_player")) {
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", FoxtrickForumYouthIcons._youthplayer , false );
                newimage.setAttribute( "class", "f_player");
                newimage.setAttribute("style","margin:2px");
                newimage.title = Foxtrickl10n.getString("ForumYouthIcons.youthplayerid");
                youthbar.appendChild( newimage );
            }

            if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "youth_team")) {
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", FoxtrickForumYouthIcons._youthteam , false );
                newimage.setAttribute( "class", "f_team");
                newimage.setAttribute("style","margin:2px");
                newimage.title = Foxtrickl10n.getString("ForumYouthIcons.youthteamid");
                youthbar.appendChild( newimage );
            }

            if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "youth_match")) {
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", FoxtrickForumYouthIcons._youthmatch , false );
                newimage.setAttribute( "class", "f_match");
                newimage.setAttribute("style","margin:2px");
                newimage.title = Foxtrickl10n.getString("ForumYouthIcons.youthmatchid");
                youthbar.appendChild( newimage );
            }

            if (Foxtrick.isModuleFeatureEnabled(FoxtrickForumYouthIcons, "youth_series")) {
                var newimage = doc.createElement( "img" );
                newimage.src = "/Img/Icons/transparent.gif";
                newimage.addEventListener( "click", FoxtrickForumYouthIcons._youthseries , false );
                newimage.setAttribute( "class", "f_series");
                newimage.setAttribute("style","margin:2px");
                newimage.title = Foxtrickl10n.getString("ForumYouthIcons.youthseries");
                youthbar.appendChild( newimage );
            }

            var head = toolbar.parentNode;
            head.insertBefore( youthbar, toolbar.nextSibling );
        }
	} catch(e){Foxtrick.dump('FoxtrickForumYouthIcons error: '+e+'\n');}
    },

	change : function( page, doc ) {
        var div = doc.getElementById( "ft_youth_icons");
        if (div != null) return;
        else {
			this.run(page, doc);
			Foxtrick.dump(this.MODULE_NAME+' change\n')
		}
	},



    // FORUM | GB | PE : ctl00_CPMain_ucHattrickMLEditor_txtBody | ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen | 3900
    // MAIL : ctl00_CPMain_ucEditorMain_txtBody | ctl00_CPMain_ucEditorMain_txtRemLen | 1000
    // TICKET: ctl00_CPMain_ucActionEditor_txtBody | ctl00_CPMain_ucActionEditor_txtRemLen | 2950
    // HT-Press Editor: ctl00_CPMain_txtComment | ctl00_CPMain_txtCharsLeft3 | 1800
    // Fed roundmail: ctl00_CPMain_txtMessage | ctl00_CPMain_txtCharsLeft | 1000
    // Supporter massmail : ctl00_CPMain_tbNewsBody | ctl00_CPMain_txtCharsLeft | 1000

    _youthplayer : function ( ev ) {
		var doc = ev.target.ownerDocument;
        var mbox = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        if ( mbox != null ) FoxtrickForumYouthIcons.clickHandler(mbox, "[youthplayerid=xxx]", null, "xxx", null, doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen'), 3900)
        if ( doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[youthplayerid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucEditorMain_txtRemLen'), 1000)
        if ( doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[youthplayerid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucActionEditor_txtRemLen'), 2950)
        if ( doc.getElementById('ctl00_CPMain_txtInsert') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtInsert'), "[youthplayerid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft3'), 1800)
        if ( doc.getElementById('ctl00_CPMain_txtMessage') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtMessage'), "[youthplayerid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
        if ( doc.getElementById('ctl00_CPMain_tbNewsBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_tbNewsBody'), "[youthplayerid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
    },

    _youthteam : function ( ev ) {
        var doc = ev.target.ownerDocument;
        var mbox = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        if ( mbox != null ) FoxtrickForumYouthIcons.clickHandler(mbox, "[youthteamid=xxx]", null, "xxx", null, doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen'), 3900)
        if ( doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[youthteamid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucEditorMain_txtRemLen'), 1000)
        if ( doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[youthteamid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucActionEditor_txtRemLen'), 2950)
        if ( doc.getElementById('ctl00_CPMain_txtInsert') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtInsert'), "[youthteamid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft3'), 1800)
        if ( doc.getElementById('ctl00_CPMain_txtMessage') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtMessage'), "[youthteamid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
        if ( doc.getElementById('ctl00_CPMain_tbNewsBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_tbNewsBody'), "[youthteamid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
    },

    _youthmatch : function ( ev ) {
        var doc = ev.target.ownerDocument;
        var mbox = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        if ( mbox != null ) FoxtrickForumYouthIcons.clickHandler(mbox, "[youthmatchid=xxx]", null, "xxx", null, doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen'), 3900)
        if ( doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[youthmatchid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucEditorMain_txtRemLen'), 1000)
        if ( doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[youthmatchid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucActionEditor_txtRemLen'), 2950)
        if ( doc.getElementById('ctl00_CPMain_txtInsert') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtInsert'), "[youthmatchid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft3'), 1800)
        if ( doc.getElementById('ctl00_CPMain_txtMessage') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtMessage'), "[youthmatchid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
        if ( doc.getElementById('ctl00_CPMain_tbNewsBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_tbNewsBody'), "[youthmatchid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
    },

    _youthseries : function ( ev ) {
        var doc = ev.target.ownerDocument;
        var mbox = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        if ( mbox != null ) FoxtrickForumYouthIcons.clickHandler(mbox, "[youthleagueid=xxx]", null, "xxx", null, doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen'), 3900)
        if ( doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[youthleagueid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucEditorMain_txtRemLen'), 1000)
        if ( doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[youthleagueid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucActionEditor_txtRemLen'), 2950)
        if ( doc.getElementById('ctl00_CPMain_txtInsert') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtInsert'), "[youthleagueid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft3'), 1800)
        if ( doc.getElementById('ctl00_CPMain_txtMessage') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtMessage'), "[youthleagueid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
        if ( doc.getElementById('ctl00_CPMain_tbNewsBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_tbNewsBody'), "[youthleagueid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
    },

    _userid : function ( ev ) {
        var doc = ev.target.ownerDocument;
        var mbox = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        if ( mbox != null ) FoxtrickForumYouthIcons.clickHandler(mbox, "[userid=xxx]", null, "xxx", null, doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen'), 3900)
        if ( doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[userid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucEditorMain_txtRemLen'), 1000)
        if ( doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[userid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucActionEditor_txtRemLen'), 2950)
        if ( doc.getElementById('ctl00_CPMain_txtInsert') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtInsert'), "[userid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft3'), 1800)
        if ( doc.getElementById('ctl00_CPMain_txtMessage') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtMessage'), "[userid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
        if ( doc.getElementById('ctl00_CPMain_tbNewsBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_tbNewsBody'), "[userid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
    },

    _kitid : function ( ev ) {
        var doc = ev.target.ownerDocument;
        var mbox = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        if ( mbox != null ) FoxtrickForumYouthIcons.clickHandler(mbox, "[kitid=xxx]", null, "xxx", null, doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen'), 3900)
        if ( doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[kitid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucEditorMain_txtRemLen'), 1000)
        if ( doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[kitid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucActionEditor_txtRemLen'), 2950)
        if ( doc.getElementById('ctl00_CPMain_txtInsert') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtInsert'), "[kitid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft3'), 1800)
        if ( doc.getElementById('ctl00_CPMain_txtMessage') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtMessage'), "[kitid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
        if ( doc.getElementById('ctl00_CPMain_tbNewsBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_tbNewsBody'), "[kitid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
    },

    _articleid : function ( ev ) {
        var doc = ev.target.ownerDocument;
        var mbox = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        if ( mbox != null ) FoxtrickForumYouthIcons.clickHandler(mbox, "[articleid=xxx]", null, "xxx", null, doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen'), 3900)
        if ( doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[articleid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucEditorMain_txtRemLen'), 1000)
        if ( doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[articleid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_ucActionEditor_txtRemLen'), 2950)
        if ( doc.getElementById('ctl00_CPMain_txtInsert') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtInsert'), "[articleid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft3'), 1800)
        if ( doc.getElementById('ctl00_CPMain_txtMessage') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtMessage'), "[articleid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
        if ( doc.getElementById('ctl00_CPMain_tbNewsBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_tbNewsBody'), "[articleid=xxx]", null, "xxx", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
    },

    _br : function ( ev ) {
        var doc = ev.target.ownerDocument;
        var mbox = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        if ( mbox != null ) FoxtrickForumYouthIcons.clickHandler(mbox, "[br]", null, null, null, doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen'), 3900)
        if ( doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[br]", null, null, null, doc.getElementById('ctl00_CPMain_ucEditorMain_txtRemLen'), 1000)
        if ( doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[br]", null, null, null, doc.getElementById('ctl00_CPMain_ucActionEditor_txtRemLen'), 2950)
        if ( doc.getElementById('ctl00_CPMain_txtInsert') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtInsert'), "[br]", null, null, null, doc.getElementById('ctl00_CPMain_txtCharsLeft3'), 1800)
        if ( doc.getElementById('ctl00_CPMain_txtMessage') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtMessage'), "[br]", null, null, null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
        if ( doc.getElementById('ctl00_CPMain_tbNewsBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_tbNewsBody'), "[br]", null, null, null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
    },
    
    _clock : function ( ev ) {
        var doc = ev.target.ownerDocument;
        var mbox = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        if ( mbox != null ) FoxtrickForumYouthIcons.clickHandler(mbox, doc.getElementById('time').textContent, null, null, null, doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen'), 3900)
        if ( doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), doc.getElementById('time').textContent, null, null, null, doc.getElementById('ctl00_CPMain_ucEditorMain_txtRemLen'), 1000)
        if ( doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), doc.getElementById('time').textContent, null, null, null, doc.getElementById('ctl00_CPMain_ucActionEditor_txtRemLen'), 2950)
        if ( doc.getElementById('ctl00_CPMain_txtInsert') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtInsert'), doc.getElementById('time').textContent, null, null, null, doc.getElementById('ctl00_CPMain_txtCharsLeft3'), 1800)
        if ( doc.getElementById('ctl00_CPMain_txtMessage') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtMessage'), doc.getElementById('time').textContent, null, null, null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
        if ( doc.getElementById('ctl00_CPMain_tbNewsBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_tbNewsBody'), doc.getElementById('time').textContent, null, null, null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
    },
    
    _spoiler : function ( ev ) {
        var doc = ev.target.ownerDocument;
        var mbox = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        if ( mbox != null ) FoxtrickForumYouthIcons.clickHandler(mbox, "[spoiler]yyy[/spoiler]", null, "yyy", null, doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen'), 3900)
        if ( doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[spoiler]yyy[/spoiler]", null, "yyy", null,doc.getElementById('ctl00_CPMain_ucEditorMain_txtRemLen'), 1000)
        if ( doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[spoiler]yyy[/spoiler]", null, "yyy", null,doc.getElementById('ctl00_CPMain_ucActionEditor_txtRemLen'), 2950)
        if ( doc.getElementById('ctl00_CPMain_txtInsert') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtInsert'), "[spoiler]yyy[/spoiler]", null, "yyy", null,doc.getElementById('ctl00_CPMain_txtCharsLeft3'), 1800)
        if ( doc.getElementById('ctl00_CPMain_txtMessage') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtMessage'), "[spoiler]yyy[/spoiler]", null, "yyy", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
        if ( doc.getElementById('ctl00_CPMain_tbNewsBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_tbNewsBody'), "[spoiler]yyy[/spoiler]", null, "yyy", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
    },    

    _pre : function ( ev ) {
        var doc = ev.target.ownerDocument;
        var mbox = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        if ( mbox != null )FoxtrickForumYouthIcons.clickHandler(mbox, "[pre]zzz[/pre]", null, "zzz", null, doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen'), 3900)
        if ( doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[pre]zzz[/pre]", null, "zzz", null,doc.getElementById('ctl00_CPMain_ucEditorMain_txtRemLen'), 1000)
        if ( doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[pre]zzz[/pre]", null, "zzz", null,doc.getElementById('ctl00_CPMain_ucActionEditor_txtRemLen'), 2950)
        if ( doc.getElementById('ctl00_CPMain_txtInsert') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtInsert'), "[pre]zzz[/pre]", null, "zzz", null,doc.getElementById('ctl00_CPMain_txtCharsLeft3'), 1800)
        if ( doc.getElementById('ctl00_CPMain_txtMessage') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtMessage'), "[pre]zzz[/pre]", null, "zzz", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
        if ( doc.getElementById('ctl00_CPMain_tbNewsBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_tbNewsBody'), "[pre]zzz[/pre]", null, "zzz", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
    },

    _table : function ( ev ) {
		var doc = ev.target.ownerDocument;
		FoxtrickPrefs.setString("table_separator", ev.target.getAttribute('separator'));
        doc.getElementById('ft_table_button_id').setAttribute('separator',ev.target.getAttribute('separator'));
		doc.getElementById('ft_table_button_id').title = Foxtrickl10n.getString("ForumSpecialBBCode.table")+'"'+FoxtrickPrefs.getString("table_separator")+'"';
                 		
        var mbox = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        if ( mbox != null )FoxtrickForumYouthIcons.clickHandler(mbox, "[table][tr][td]ttt[/td][/tr][/table]", null, "ttt", null, doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen'), 3900)
        if ( doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucEditorMain_txtBody'), "[table][tr][td]ttt[/td][/tr][/table]", null, "ttt", null,doc.getElementById('ctl00_CPMain_ucEditorMain_txtRemLen'), 1000)
        if ( doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_ucActionEditor_txtBody'), "[table][tr][td]ttt[/td][/tr][/table]", null, "ttt", null,doc.getElementById('ctl00_CPMain_ucActionEditor_txtRemLen'), 2950)
        if ( doc.getElementById('ctl00_CPMain_txtInsert') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtInsert'), "[table][tr][td]ttt[/td][/tr][/table]", null, "ttt", null,doc.getElementById('ctl00_CPMain_txtCharsLeft3'), 1800)
        if ( doc.getElementById('ctl00_CPMain_txtMessage') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_txtMessage'), "[table][tr][td]ttt[/td][/tr][/table]", null, "ttt", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
        if ( doc.getElementById('ctl00_CPMain_tbNewsBody') != null ) FoxtrickForumYouthIcons.clickHandler(doc.getElementById('ctl00_CPMain_tbNewsBody'), "[table][tr][td]ttt[/td][/tr][/table]", null, "ttt", null, doc.getElementById('ctl00_CPMain_txtCharsLeft'), 1000)
    },

    _q : function ( ev ) {
        var doc = ev.target.ownerDocument;
        var mbox = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        if ( mbox != null )FoxtrickForumYouthIcons.clickHandler(mbox, "[q]qqq[/q]", null, "qqq", null, doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtRemLen'), 1000)
    },
    

clickHandler : function (ta, openingTag, closingTag, replaceText, counter, fieldCounter, maxLength) {
  try {
	if (ta) {
        // link tags
        if (replaceText) {
            var s = this.getSelection(ta);
            var newText = (s.selectionLength > 0) ? openingTag.replace(replaceText, s.selectedText) : openingTag;
			
			// table
			if (replaceText == 'ttt'){
						var seperator = FoxtrickPrefs.getString("table_separator");
						if (seperator=='|') seperator='\\|';
						if (seperator==' ') seperator=' +';
						
						// deal with some nested tags
						var myReg = new RegExp('\\[i\\](.+)('+seperator+')(.+)\\[\\/i\\]','g');
             			newText = newText.replace(myReg,'[i]$1[/i]$2[i]$3[/i]');
						var myReg = new RegExp('\\[u\\](.+)('+seperator+')(.+)\\[\\/u\\]','g');
             			newText = newText.replace(myReg,'[u]$1[/u]$2[u]$3[/u]');
						var myReg = new RegExp('\\[b\\](.+)('+seperator+')(.+)\\[\\/b\\]','g');
             			newText = newText.replace(myReg,'[b]$1[/b]$2[b]$3[/b]');
						
						// make the table
						var myReg = new RegExp( seperator,'g');
             			newText = newText.replace(myReg,'[/td][td]');
						newText = newText.replace(/\n/g,'[/td][/tr][tr][td]');
						
						// add some colspan for too short rows
						var rows = newText.split('[/tr]');
						var max_cells = 0;
						for (var i=0; i<rows.length-1; ++i) {
							max_cells =  Math.max(max_cells, rows[i].split('[/td]').length-1);
						}
						for (var i=0; i<rows.length-1; ++i) {
							var missing_col = max_cells - (rows[i].split('[/td]').length-1);
							if ( missing_col !==0 ) {
								var last_td = rows[i].lastIndexOf('[td');
								rows[i] = rows[i].substring(0,last_td+3)+' colspan='+String(missing_col+1)+rows[i].substr(last_td+3);
							}
						}
						// add header if first row is bold to some part
						if (rows[0].search(/\[b\].+\[\/b\]/)!=-1) {
							rows[0] = rows[0].replace(/\[b\]/g,'').replace(/\[\/b\]/g,'').replace(/td\]/g,'th]');
						}
						newText='';
						for (var i=0; i<rows.length-1; ++i) {
							newText += rows[i]+'[/tr]'
						}
						newText += '[/table]';
						if (s.selectionLength===0) newText='[table][tr][td]cell1[/td][td]cell2[/td][/tr][tr][td]cell3[/td][td]cell4[/td][/tr][/table]';
						
						// some formating
						newText = newText.replace(/table\]/g,'table]\n')
										.replace(/\/tr\]/g,'/tr]\n')
										.replace(/\[td/g,' [td')
										.replace(/\[\/td\]/g,'[/td] ')
										.replace(/\[th/g,' [th')
										.replace(/\[\/th\]/g,'[/th] ');
			}

            // Opera, Mozilla
            if (ta.selectionStart || ta.selectionStart == '0') {
                var st = ta.scrollTop;
                ta.value = s.textBeforeSelection + newText + s.textAfterSelection;
                ta.scrollTop = st;

                if ((openingTag.indexOf(' ') > 0) && (openingTag.indexOf(' ') < openingTag.length - 1)) {
                    ta.selectionStart = s.selectionStart + openingTag.indexOf('=') + 1;
                    ta.selectionEnd = ta.selectionStart + openingTag.indexOf(' ') - openingTag.indexOf('=') - 1;
                }

                // MessageID
                else {
                    if (s.selectionLength === 0) {
                        ta.selectionStart = s.selectionStart + openingTag.indexOf('=') + 1;
                        ta.selectionEnd = ta.selectionStart + openingTag.indexOf(']') - openingTag.indexOf('=') - 1;
                    }
                    else {
                        ta.selectionStart = s.selectionStart + newText.length;
                        ta.selectionEnd = ta.selectionStart;
                    }
                    if (replaceText == 'yyy' && s.selectionLength === 0){
                        ta.selectionStart = s.selectionStart + 9;
                        ta.selectionEnd = ta.selectionStart + 3;
                    }
                    if (replaceText == 'zzz' && s.selectionLength === 0){
                        ta.selectionStart = s.selectionStart + 5;
                        ta.selectionEnd = ta.selectionStart + 3;
                    }
					if (replaceText == 'qqq' && s.selectionLength === 0){
                        ta.selectionStart = s.selectionStart + 3;
                        ta.selectionEnd = ta.selectionStart + 3;
                    } 
					if (replaceText == 'ttt' && s.selectionLength === 0){
                        ta.selectionStart = s.selectionStart + 17;
                        ta.selectionEnd = ta.selectionStart + 5;
                    } 
                }

            }

            // Others
            else {
                ta.value += newText;
            }
        }

        // start/end tags
        else if ((closingTag) && (counter >= 0)) {
            var s = this.getSelection(ta);
            var newText = (s.selectionLength > 0) ? openingTag + s.selectedText + closingTag : (counter % 2 == 1) ? openingTag : closingTag;

            // Opera, Mozilla
            if (ta.selectionStart || ta.selectionStart == '0') {
                var st = ta.scrollTop;
                ta.value = s.textBeforeSelection + newText + s.textAfterSelection;
                ta.scrollTop = st;

                ta.selectionStart = s.selectionStart + newText.length;
                ta.selectionEnd = ta.selectionStart;
            }

            // IE
            else if (document.selection) {
                var IESel = document.selection.createRange();
                IESel.text = newText;
                IESel.select();
            }

            // Others
            else {
                ta.value += newText;
            }
        }

        // Quote
        else if ((closingTag) && !(counter)) {
            ta.value = quoteText + '\n' + ta.value;
        }

        // HR
        else {
            var s = this.getSelection(ta);

            // Opera, Mozilla
            if (ta.selectionStart || ta.selectionStart == '0') {
                var st = ta.scrollTop;
                ta.value = s.textBeforeSelection + s.selectedText + openingTag + s.textAfterSelection;
                ta.scrollTop = st;

                ta.selectionStart = s.selectionEnd + openingTag.length;
                ta.selectionEnd = ta.selectionStart;
            }

            // IE
            else if (document.selection) {
                var IESel = document.selection.createRange();
                IESel.text = s.selectedText + openingTag;
                IESel.select();
            }

            // Others
            else {
                ta.value += newText;
            }
        }
    }
    this.textCounter(ta, fieldCounter, maxLength);
  } catch(e) { Foxtrick.dumpError(e);}
},

getSelection : function(ta) {
    if (ta) {
        ta.focus();

        var textAreaContents = {
            completeText: '',
            selectionStart: 0,
            selectionEnd: 0,
            selectionLength: 0,
            textBeforeSelection: '',
            selectedText: '',
            textAfterSelection: ''
        };

        if (ta.selectionStart || ta.selectionStart == '0') {
            textAreaContents.completeText = ta.value;
            textAreaContents.selectionStart = ta.selectionStart;

            if ((ta.selectionEnd - ta.selectionStart) !== 0) {
                while (ta.value.charAt(ta.selectionEnd - 1) == ' ') {
                    ta.selectionEnd--;
                }
            }

            textAreaContents.selectionEnd = ta.selectionEnd;
            textAreaContents.selectionLength = ta.selectionEnd - ta.selectionStart;
            textAreaContents.textBeforeSelection = ta.value.substring(0, ta.selectionStart);

            var st = ta.value.substring(ta.selectionStart, ta.selectionEnd);

            textAreaContents.selectedText = st;
            textAreaContents.textAfterSelection = ta.value.substring(ta.selectionEnd, ta.value.length);
            return textAreaContents;
        }
    }
},

textCounter : function (field, countfield, maxlimit) {
    var text = field.value.replace(/[\r]/g, '').length;
    var text2 = field.value.replace(/[\r\n]/g, '').length; // Count without \n\r
    var diff = text - text2;
    countfield.value = maxlimit - (text2 + diff * 2);
}

};
