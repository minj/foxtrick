/**
 * forumtemplates.js
 * Foxtrick forum template handling service
 * @author Mod-PaV, convincedd
 */

var FoxtrickForumTemplates = {
    MODULE_NAME : "ForumTemplates",
    MODULE_AUTHOR : "Mod-PaV",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumWritePost','messageWritePost','htpress','forumModWritePost'),
	OPTIONS : new Array("DefaultShow","CustomWidth"),
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("","125"),
	OPTION_TEXTS_DISABLED_LIST : new Array(true,false),

	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Fix for latest forum change",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

    _MAX_TEMPLATE_DISP_LENGTH : 60,
	_DISPLAY_WIDTH:125,
    _TEMPLATES_DIV_ID : "post_templates",
    _TEMPLATES_PREFLIST : "post_templates",
    // _TEMPLATES_ENABLED : "usePostTemplates",
    _NEW_MESSAGE_WINDOW : 'ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtBody',

    run : function( page, doc ) {
		switch( page )
        {
            case 'forumWritePost':
				FoxtrickForumTemplates._TEMPLATES_DIV_ID = "post_templates";
				FoxtrickForumTemplates._TEMPLATES_PREFLIST = "post_templates";
				FoxtrickForumTemplates._NEW_MESSAGE_WINDOW = 'ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtBody';
			break;
			case 'forumModWritePost':
				FoxtrickForumTemplates._TEMPLATES_DIV_ID = "post_mod_templates";
				FoxtrickForumTemplates._TEMPLATES_PREFLIST = "post_mod_templates";
				FoxtrickForumTemplates._NEW_MESSAGE_WINDOW = 'ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtBody';
			break;
			case 'messageWritePost':
				FoxtrickForumTemplates._NEW_MESSAGE_WINDOW = 'ctl00_ctl00_CPContent_CPMain_ucEditorMain_txtBody';
				FoxtrickForumTemplates._TEMPLATES_DIV_ID = "mail_templates";
				FoxtrickForumTemplates._TEMPLATES_PREFLIST = "mail_templates";
			break;
			case 'htpress': // For Staff! Users have another  MESSAGE_WINDOW ID !
				FoxtrickForumTemplates._NEW_MESSAGE_WINDOW = 'ctl00_ctl00_CPContent_CPMain_txtComment';
				FoxtrickForumTemplates._TEMPLATES_DIV_ID = "htpress_templates";
				FoxtrickForumTemplates._TEMPLATES_PREFLIST = "htpress_templates";
			break;
		}

		FoxtrickForumTemplates._DISPLAY_WIDTH=125;
		if (Foxtrick.isModuleFeatureEnabled( this, "CustomWidth")) {
			var widthtext = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "CustomWidth_text");
			if (!widthtext) widthtext = this.OPTION_TEXTS_DEFAULT_VALUES[1];
			if (!(FoxtrickForumTemplates._DISPLAY_WIDTH=parseInt(widthtext)))
				FoxtrickForumTemplates._DISPLAY_WIDTH=125;
		}


                var sControlsID = "foxtrick_forumtemplates_controls_div";
                if (doc.getElementById(sControlsID))
                	return;
                // display templates above the message window
                //var msg_window = doc.getElementById(FoxtrickForumTemplates._NEW_MESSAGE_WINDOW );

				var msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];


				if (!msg_window) return; // ie mailbox overview
                var templates_div = doc.createElement( "div" );
                templates_div.setAttribute( "class", "folderItem" );
				templates_div.setAttribute('style','display:none; padding-top:5px;');
                templates_div.id = FoxtrickForumTemplates._TEMPLATES_DIV_ID;

                msg_window.parentNode.insertBefore( templates_div,
                                                    msg_window );

                var templates = FoxtrickPrefs.getList(
                            FoxtrickForumTemplates._TEMPLATES_PREFLIST );

                for ( var  i in templates )
                {
                    FoxtrickForumTemplates._appendTemplate( doc, templates[i], templates_div );
                }

                // display add new template button
                var controls_div = doc.createElement( "div" );
                controls_div.id = sControlsID;
                controls_div.style.paddingTop = "5px";
                var new_button = doc.createElement( "a" );
                new_button.setAttribute( "id", 'addTemplateId');
				new_button.setAttribute( "href", "javascript:void(0)" );
                new_button.setAttribute("style", "display:inline-block;margin-right:10px;");
				new_button.setAttribute("tabIndex", "3");
				new_button.innerHTML = Foxtrickl10n.getString( 'make_template_from_post' );
                new_button.addEventListener( "click", FoxtrickForumTemplates._addNewTitle, false );
                controls_div.appendChild( new_button );

			if (!Foxtrick.isModuleFeatureEnabled( this, "DefaultShow")) {
				var show_button = doc.createElement( "a" );
                show_button.setAttribute( "id", 'showTemplateId');
				show_button.setAttribute( "href", "javascript:void(0);" );
                show_button.setAttribute("style", "display:inline-block; margin-right:10px;");
				//show_button.setAttribute("tabIndex", "3");
				show_button.innerHTML = Foxtrickl10n.getString( 'show_templates' );
                show_button.addEventListener( "click", FoxtrickForumTemplates._ShowTemplates, false );
				controls_div.appendChild( show_button );

				var hide_button = doc.createElement( "a" );
                hide_button.setAttribute( "id", 'hideTemplateId');
				hide_button.setAttribute( "href", "javascript:void(0);" );
                hide_button.setAttribute("style", "display:none; margin-right:10px;");
				//hide_button.setAttribute("tabIndex", "3");
				hide_button.innerHTML = Foxtrickl10n.getString( 'hide_templates' );
                hide_button.addEventListener( "click", FoxtrickForumTemplates._HideTemplates, false );
				controls_div.appendChild( hide_button );
            }
			else templates_div.style.display="inline";


           	msg_window.parentNode.insertBefore( controls_div, msg_window );

    },

	change : function( page, doc ) {
		if (!doc.getElementById(FoxtrickForumTemplates._TEMPLATES_DIV_ID)) {
			Foxtrick.dump(this.MODULE_NAME+' change\n')
			this.run(page,doc);
		}
	},

    _addNewTemplate : function( ev ) {
		var doc = ev.target.ownerDocument;
//        var msg_window = doc.getElementById( FoxtrickForumTemplates._NEW_MESSAGE_WINDOW );
		var msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
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
		inputTitleDiv.parentNode.removeChild( inputTitleDiv);
		//new_button.addEventListener( "click", FoxtrickForumTemplates._addNewTitle, false );

	},

	 _addNewTitle : function( ev ) {
	 try {
		var doc = ev.target.ownerDocument;
//        var msg_window = doc.getElementById( FoxtrickForumTemplates._NEW_MESSAGE_WINDOW );
		var msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        var text = Foxtrick.stripHTML( msg_window.value );
		if (text==""){ Foxtrick.alert( Foxtrickl10n.getString( 'template_exists' ) ); return;}
		var inputTitleDiv = doc.getElementById("ForumTemplatesinputTitleDivId");
		var inputTitle = doc.getElementById ("ForumTemplatesInputTitleId");
		if (!inputTitleDiv) {
			inputTitleDiv = doc.createElement ("div");
			inputTitleDiv.setAttribute("id", "ForumTemplatesinputTitleDivId");
			inputTitleDiv.setAttribute("style", "padding-top:5px;");

			var TitleDesc = doc.createTextNode(Foxtrickl10n.getString( 'template_title' ));
			inputTitleDiv.appendChild(TitleDesc);

			inputTitle = doc.createElement ("input");
			inputTitle.setAttribute("id", "ForumTemplatesInputTitleId");
			inputTitle.setAttribute("value","");// text.substr(0,20));
			inputTitle.setAttribute("type", "text");
			inputTitle.setAttribute("maxlength", "200");
			inputTitle.setAttribute("size", "20");
			inputTitle.setAttribute("tabIndex", "3");
			inputTitle.setAttribute("style", "margin-left:5px;margin-right:5px;");
			inputTitleDiv.appendChild(inputTitle);
			inputTitle.focus();

			var button_ok = doc.createElement( "input" );
			button_ok.setAttribute( "value", Foxtrickl10n.getString( 'ok' ));
			button_ok.setAttribute( "id",  "ForumTemplatesOKId" );
			button_ok.setAttribute( "type",  "button" );
			button_ok.setAttribute( "tabindex", "5" );
			button_ok.addEventListener( "click", FoxtrickForumTemplates._addNewTemplate, false );
			inputTitleDiv.appendChild(button_ok);

			var button_cancel = doc.createElement( "input" );
			button_cancel.setAttribute( "value", Foxtrickl10n.getString( 'foxtrick.prefs.buttonCancel' ));
			button_cancel.setAttribute( "id",  "ForumTemplatesCancelId" );
			button_cancel.setAttribute( "type",  "button" );
			//button_cancel.setAttribute( "tabindex", "" );
			button_cancel.addEventListener( "click", FoxtrickForumTemplates._CancelTitle, false );
			inputTitleDiv.appendChild(button_cancel);

			msg_window.parentNode.insertBefore( inputTitleDiv, msg_window);
		}
		inputTitle.setAttribute("value",text.substr(0,20));
	} catch(e) {Foxtrick.dump('_addNewTitle: '+e+'\n');}
	},

	 _CancelTitle : function( ev ) {
		var doc = ev.target.ownerDocument;
        var inputTitleDiv = doc.getElementById("ForumTemplatesinputTitleDivId");
		inputTitleDiv.parentNode.removeChild( inputTitleDiv);
	},

	 _ShowTemplates : function( ev ) {
		var doc = ev.target.ownerDocument;
        var div = doc.getElementById(FoxtrickForumTemplates._TEMPLATES_DIV_ID);
		div.style.display="inline";
	    var div = doc.getElementById("showTemplateId");
		div.style.display="none";
	    var div = doc.getElementById("hideTemplateId");
		div.style.display="inline-block";
	},

	 _HideTemplates : function( ev ) {
		var doc = ev.target.ownerDocument;
        var div = doc.getElementById(FoxtrickForumTemplates._TEMPLATES_DIV_ID);
		div.style.display="none";
	    var div = doc.getElementById("showTemplateId");
		div.style.display="inline-block";
	    var div = doc.getElementById("hideTemplateId");
		div.style.display="none";
	},

    _removeTemplate : function( ev ) {
        if ( Foxtrick.confirmDialog( Foxtrickl10n.getString( 'delete_template_ask' ) ) )
        {
            FoxtrickPrefs.delListPref( FoxtrickForumTemplates._TEMPLATES_PREFLIST, ev.target.msg );
            ev.target.parentNode.parentNode.parentNode.removeChild( ev.target.parentNode.parentNode );
        }
    },

    _fillMsgWindow : function( ev ) { Foxtrick.dump("_fillMsgWindow\n");
        var doc = ev.target.ownerDocument;
//        var msg_window = doc.getElementById( FoxtrickForumTemplates._NEW_MESSAGE_WINDOW );
		var msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
        Foxtrick.insertAtCursor( msg_window, ev.target.msg );
    },

    _appendTemplate : function( doc, text, where ) {
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
		tr.setAttribute('style','display:inline-block !important; width:'+FoxtrickForumTemplates._DISPLAY_WIDTH+'px;padding-top:5px;');
        var td1 = doc.createElement( "div" );
		td1.setAttribute("style","display:inline-block !important; vertical-align:middle;width:17px;");
		var td2 = doc.createElement( "div" );
        td2.setAttribute("style","width:"+parseInt(FoxtrickForumTemplates._DISPLAY_WIDTH-25)+"px; display:inline-block !important; overflow:hidden; vertical-align:middle; white-space:nowrap !important;");
		tr.appendChild( td1 );
        tr.appendChild( td2 );
        var remover = doc.createElement( "div" );
        remover.setAttribute( "class", "ft_actionicon foxtrickRemove" );
        remover.msg = fulltext;
        remover.addEventListener( "click", FoxtrickForumTemplates._removeTemplate, false );
        td1.appendChild( remover );
        where.appendChild( tr );

        var curr = doc.createElement( "a" );
        curr.setAttribute( "href", "javascript:void(0)" );
        curr.msg = text;
        curr.title = title;//.substring( 0, FoxtrickForumTemplates._MAX_TEMPLATE_DISP_LENGTH );
        curr.innerHTML = title;//.substring( 0, FoxtrickForumTemplates._MAX_TEMPLATE_DISP_LENGTH );
        /*if ( title.length > FoxtrickForumTemplates._MAX_TEMPLATE_DISP_LENGTH )
            curr.innerHTML += "...";
		*/
        curr.addEventListener( "click", FoxtrickForumTemplates._fillMsgWindow, false );
        td2.appendChild( curr );
    }
};

