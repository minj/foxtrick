/**
 * forumtemplates.js
 * Foxtrick forum template handling service
 * @author Mod-PaV
 */

var FoxtrickForumTemplates = {
    
    MODULE_NAME : "ForumTemplates",
    MODULE_AUTHOR : "Mod-PaV",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
    DEFAULT_ENABLED : true,

    _MAX_TEMPLATE_DISP_LENGTH : 60,
    _TEMPLATES_DIV_ID : "post_templates",
    _TEMPLATES_PREFLIST : "post_templates",
    // _TEMPLATES_ENABLED : "usePostTemplates",
    _NEW_MESSAGE_WINDOW : 'ctl00_CPMain_ucEditor_tbBody',
    
    init : function() {
        Foxtrick.registerPageHandler( 'forumWritePost',
                                      FoxtrickForumTemplates );
		Foxtrick.registerPageHandler( 'messageWritePost',
									  FoxtrickForumTemplates );
    
    },

    run : function( page, doc ) {
			Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/"+
							"resources/css/conference.css");

        // var doc = Foxtrick.current_doc;
		switch( page )
        {
            case 'forumWritePost':
				FoxtrickForumTemplates._TEMPLATES_DIV_ID = "post_templates";
				FoxtrickForumTemplates._TEMPLATES_PREFLIST = "post_templates";
				FoxtrickForumTemplates._NEW_MESSAGE_WINDOW = 'ctl00_CPMain_ucEditor_tbBody';
			break;
			case 'messageWritePost':
				FoxtrickForumTemplates._NEW_MESSAGE_WINDOW = 'ctl00_CPMain_tbBody';
				FoxtrickForumTemplates._TEMPLATES_DIV_ID = "mail_templates";
				FoxtrickForumTemplates._TEMPLATES_PREFLIST = "mail_templates";
			break;
		}
        //switch( page )
        {
          //  case 'forumWritePost':

                // if ( !FoxtrickPrefs.getBool(
                            // FoxtrickForumTemplates._TEMPLATES_ENABLED ) )
                    // break;

                var sControlsID = "foxtrick_forumtemplates_controls_div";
                if (doc.getElementById(sControlsID))
                	return;
                // display templates above the message window
                var msg_window = doc.getElementById(
                            FoxtrickForumTemplates._NEW_MESSAGE_WINDOW );
                var templates_div = doc.createElement( "div" );
                templates_div.setAttribute( "class", "folderItem" );
				templates_div.setAttribute('style','padding-top:5px;');
                templates_div.id = FoxtrickForumTemplates._TEMPLATES_DIV_ID;
                
                msg_window.parentNode.insertBefore( templates_div,
                                                    msg_window );

                var templates = FoxtrickPrefs.getList(
                            FoxtrickForumTemplates._TEMPLATES_PREFLIST );

                for ( i in templates )
                {
                    FoxtrickForumTemplates._appendTemplate( doc, templates[i], templates_div );
                }
                
                // display add new template button
                var controls_div = doc.createElement( "div" );
                controls_div.id = sControlsID;
                controls_div.style.marginTop = "1em";
                var new_button = doc.createElement( "a" );
                new_button.setAttribute( "id", 'addTemplateId');
				new_button.setAttribute( "href", "javascript:void(0)" );
                new_button.setAttribute("style", "margin-right:10px;");
				new_button.setAttribute("tabIndex", "3");
				new_button.innerHTML = Foxtrickl10n.getString( 'make_template_from_post' );
                new_button.addEventListener( "click", FoxtrickForumTemplates._addNewTitle, false );
                controls_div.appendChild( new_button );
                msg_window.parentNode.insertBefore( controls_div, msg_window ); 
 
               // break;
        }
    },
	
	change : function( page, doc ) {
	
	},

    _addNewTemplate : function( ev ) {
		var doc = ev.target.ownerDocument;
        var msg_window = doc.getElementById( FoxtrickForumTemplates._NEW_MESSAGE_WINDOW );
        var text = Foxtrick.stripHTML( msg_window.value );
		var inputTitle = doc.getElementById( "ForumTemplatesInputTitleId" );
        
        var title = Foxtrick.stripHTML( inputTitle.value );
		
        if (title.search(/\[|\]/)!=-1) Foxtrick.alert( Foxtrickl10n.getString( 'template_title_illegal' ) );
		else if ( FoxtrickPrefs.addPrefToList( FoxtrickForumTemplates._TEMPLATES_PREFLIST, '[title='+title+']'+text ) ) {
       			FoxtrickForumTemplates._appendTemplate( doc,  '[title='+title+']'+text);
		}
        else
            Foxtrick.alert( Foxtrickl10n.getString( 'template_exists' ) );
			
		var inputTitleDiv = doc.getElementById( "ForumTemplatesinputTitleDivId" );
		inputTitleDiv.parentNode.removeChild(inputTitleDiv);
		new_button.addEventListener( "click", FoxtrickForumTemplates._addNewTitle, false );
        		
	},

	 _addNewTitle : function( ev ) {
		var doc = ev.target.ownerDocument;
        var msg_window = doc.getElementById( FoxtrickForumTemplates._NEW_MESSAGE_WINDOW );
        var text = Foxtrick.stripHTML( msg_window.value );
		if (text==""){ Foxtrick.alert( Foxtrickl10n.getString( 'template_exists' ) ); return;}
		var addTemplate_link = doc.getElementById('addTemplateId' );
               
		var inputTitleDiv = doc.getElementById( "ForumTemplatesinputTitleDivId" );
        if (inputTitleDiv) {
		}
		else {
			inputTitleDiv = doc.createElement ("div");
			inputTitleDiv.setAttribute("id", "ForumTemplatesinputTitleDivId");
			inputTitleDiv.setAttribute("style", "display:inline-block;");
		
			var TitleDesc = doc.createTextNode(Foxtrickl10n.getString( 'template_title' ));
			inputTitleDiv.appendChild(TitleDesc);
		
			var inputTitle = doc.createElement ("input");
			inputTitle.setAttribute("id", "ForumTemplatesInputTitleId");
			inputTitle.setAttribute("value", text.substr(0,20));
			inputTitle.setAttribute("type", "text");
			inputTitle.setAttribute("maxlength", "20");
			inputTitle.setAttribute("size", "20");
			inputTitle.setAttribute("tabIndex", "3");
			inputTitle.setAttribute("style", "margin-left:5px;margin-right:5px;");
			inputTitleDiv.appendChild(inputTitle);
			inputTitle.focus(); 
			
			var new_button = doc.createElement( "input" );
			new_button.setAttribute( "value", Foxtrickl10n.getString( 'ok' ));
			new_button.setAttribute( "id",  "ForumTemplatesOKId" );
			new_button.setAttribute( "type",  "button" );
			new_button.setAttribute( "tabindex", "5" );
			new_button.addEventListener( "click", FoxtrickForumTemplates._addNewTemplate, false );
			inputTitleDiv.appendChild(new_button);
			
			addTemplate_link.parentNode.insertBefore(inputTitleDiv, addTemplate_link.nextSibling);				
		}
	},
	
    _removeTemplate : function( ev ) {
        if ( Foxtrick.confirmDialog( Foxtrickl10n.getString( 'delete_template_ask' ) ) )
        {
            FoxtrickPrefs.delListPref( FoxtrickForumTemplates._TEMPLATES_PREFLIST, ev.target.msg );
            // ev.target.nextSibling.parentNode.removeChild( ev.target.nextSibling );
            // ev.target.parentNode.removeChild( ev.target );
            // remove whole <tr>
            ev.target.parentNode.parentNode.parentNode.removeChild( ev.target.parentNode.parentNode );
        }
    },

    _fillMsgWindow : function( ev ) {
        var doc = ev.target.ownerDocument;
        var msg_window = doc.getElementById( FoxtrickForumTemplates._NEW_MESSAGE_WINDOW );
        Foxtrick.insertAtCursor( msg_window, ev.target.msg );
    },

    _appendTemplate : function( doc, text, where ) {
        // var doc = Foxtrick.current_doc;
        if ( arguments.length < 3 ) {
            var where = doc.getElementById( FoxtrickForumTemplates._TEMPLATES_DIV_ID );
		}
        if ( !where )
            return;
        
		var fulltext = text;
		var title = text.match(/\[title=([^\]]+)\]/);
		if (!title) title = text;
		else { title = title[1];
				text=text.replace(/\[title=[^\]]+\]/,'');
		}
		
		var tr = doc.createElement( "div" );
		tr.setAttribute('style','display:inline-block !important; width:100px;padding-top:5px;');
        var td1 = doc.createElement( "div" );
		td1.setAttribute("style","display:inline-block !important; vertical-align:middle;width:17px;");
		var td2 = doc.createElement( "div" );
        td2.setAttribute("style","width:75px; display:inline-block !important; overflow:hidden; vertical-align:middle; white-space:nowrap !important;");
		tr.appendChild( td1 );
        tr.appendChild( td2 );
        var remover = doc.createElement( "div" );
        remover.setAttribute( "class", "foxtrick" +	"LeaveConf" );
        remover.msg = fulltext;
        remover.addEventListener( "click", FoxtrickForumTemplates._removeTemplate, false );
        td1.appendChild( remover );
        where.appendChild( tr );

        var curr = doc.createElement( "a" );
        curr.setAttribute( "href", "javascript:void(0)" );
        curr.msg = text;		
        curr.innerHTML = title.substring( 0, FoxtrickForumTemplates._MAX_TEMPLATE_DISP_LENGTH );
        /*if ( title.length > FoxtrickForumTemplates._MAX_TEMPLATE_DISP_LENGTH )
            curr.innerHTML += "...";
		*/
        curr.addEventListener( "click", FoxtrickForumTemplates._fillMsgWindow, false );
        td2.appendChild( curr );
    }
};

