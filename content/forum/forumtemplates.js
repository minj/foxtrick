/**
 * forumtemplates.js
 * Foxtrick forum template handling service
 * @author Mod-PaV
 */
////////////////////////////////////////////////////////////////////////////////
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
    },

    run : function( page, doc ) {

        // var doc = Foxtrick.current_doc;

        switch( page )
        {
            case 'forumWritePost':

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
                templates_div.id = this._TEMPLATES_DIV_ID;
                var templates_table = doc.createElement( "table" );
                var templates_tbody = doc.createElement( "tbody" );
                templates_table.appendChild( templates_tbody );
                templates_div.appendChild( templates_table );

                msg_window.parentNode.insertBefore( templates_div,
                                                    msg_window );

                var templates = FoxtrickPrefs.getList(
                            FoxtrickForumTemplates._TEMPLATES_PREFLIST );

                for ( i in templates )
                {
                    FoxtrickForumTemplates._appendTemplate( doc, templates[i], templates_tbody );
                }
                    // FoxtrickForumTemplates._appendTemplate( doc, templates[i], templates_div );

                // display add new template button
                var controls_div = doc.createElement( "div" );
                controls_div.id = sControlsID;
                controls_div.style.marginTop = "1em";
                var new_button = doc.createElement( "a" );
                new_button.setAttribute( "href", "javascript:void(0)" );
                new_button.innerHTML = Foxtrickl10n.getString( 'make_template_from_post' );
                new_button.addEventListener( "click", FoxtrickForumTemplates._addNewTemplate, false );
                controls_div.appendChild( new_button );
                msg_window.parentNode.insertBefore( controls_div, msg_window ); 
 
                break;
        }
    },

    _addNewTemplate : function( ev ) {
        var doc = ev.target.ownerDocument;
        // var msg_window = Foxtrick.current_doc.getElementById( FoxtrickForumTemplates._NEW_MESSAGE_WINDOW );
        var msg_window = doc.getElementById( FoxtrickForumTemplates._NEW_MESSAGE_WINDOW );
        var text = Foxtrick.stripHTML( msg_window.value );

        if ( FoxtrickPrefs.addPrefToList( FoxtrickForumTemplates._TEMPLATES_PREFLIST, text ) )
            FoxtrickForumTemplates._appendTemplate( doc, text );
        else
            Foxtrick.alert( Foxtrickl10n.getString( 'template_exists' ) );
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

        if ( arguments.length < 3 )
            var where = doc.getElementById( FoxtrickForumTemplates._TEMPLATES_DIV_ID );

        if ( !where )
            return;
        
        var tr = doc.createElement( "tr" );
        var td1 = doc.createElement( "td" );
        td1.setAttribute( "class", "ignore" );
        var td2 = doc.createElement( "td" );
        tr.appendChild( td1 );
        tr.appendChild( td2 );
        // var remover = doc.createElement( "a" );
        var remover = doc.createElement( "div" );
        // remover.style.marginRight = "1em";
        // remover.setAttribute( "href", "javascript:void(0)" );
        remover.setAttribute( "class", "ignore" );
        remover.msg = text;
        remover.addEventListener( "click", FoxtrickForumTemplates._removeTemplate, false );
        td1.appendChild( remover );
        // where.appendChild( remover );
        where.appendChild( tr );

        var curr = doc.createElement( "a" );
        // var br = doc.createElement( "br" );
        curr.setAttribute( "href", "javascript:void(0)" );
        curr.msg = text;
        curr.innerHTML = text.substring( 0, FoxtrickForumTemplates._MAX_TEMPLATE_DISP_LENGTH );
        if ( text.length > FoxtrickForumTemplates._MAX_TEMPLATE_DISP_LENGTH )
            curr.innerHTML += "...";

        curr.addEventListener( "click", FoxtrickForumTemplates._fillMsgWindow, false );
        td2.appendChild( curr );
        // where.appendChild( curr );
        // where.appendChild( br );
    }
};

