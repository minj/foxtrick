/**
 * forumtemplates.js
 * Foxtrick forum template handling service
 * @author Mod-PaV
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickForumTemplates = {
    
    _MAX_TEMPLATE_DISP_LENGTH : 60,
    _TEMPLATES_DIV_ID : "post_templates",
    _TEMPLATES_PREFLIST : "post_templates",
    _TEMPLATES_ENABLED : "usePostTemplates",
    _NEW_MESSAGE_WINDOW : 'ctl00_CPMain_ucEditor_tbBody',

    init : function() {
        Foxtrick.registerPageHandler( 'forumWritePost',
                                      FoxtrickForumTemplates );
    },

    run : function( page ) {

        var doc = Foxtrick.current_doc;

        switch( page )
        {
            case 'forumWritePost':

                if ( !FoxtrickPrefs.getBool(
                            FoxtrickForumTemplates._TEMPLATES_ENABLED ) )
                    break;

                // display templates above the message window
                var msg_window = doc.getElementById(
                            FoxtrickForumTemplates._NEW_MESSAGE_WINDOW );
                var templates_div = doc.createElement( "div" );
                templates_div.id = this._TEMPLATES_DIV_ID;
                msg_window.parentNode.insertBefore( templates_div,
                                                    msg_window );

                var templates = FoxtrickPrefs.getList(
                            FoxtrickForumTemplates._TEMPLATES_PREFLIST );

                for ( i in templates )
                    FoxtrickForumTemplates._appendTemplate( templates[i],
                                                            templates_div );

                // display add new template button
                var controls_div = doc.createElement( "div" );
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
        var msg_window = Foxtrick.current_doc.getElementById( FoxtrickForumTemplates._NEW_MESSAGE_WINDOW );
        var text = Foxtrick.stripHTML( msg_window.value );

        if ( FoxtrickPrefs.addPrefToList( FoxtrickForumTemplates._TEMPLATES_PREFLIST, text ) )
            FoxtrickForumTemplates._appendTemplate( text );
        else
            alert( Foxtrickl10n.getString( 'template_exists' ) );
    },

    _removeTemplate : function( ev ) {
        if ( confirm( Foxtrickl10n.getString( 'delete_template_ask' ) ) )
        {
            FoxtrickPrefs.delListPref( FoxtrickForumTemplates._TEMPLATES_PREFLIST, ev.target.msg );
            ev.target.nextSibling.parentNode.removeChild( ev.target.nextSibling );
            ev.target.parentNode.removeChild( ev.target );
        }
    },

    _fillMsgWindow : function( ev ) {
        var msg_window = Foxtrick.current_doc.getElementById( FoxtrickForumTemplates._NEW_MESSAGE_WINDOW );
        Foxtrick.insertAtCursor( msg_window, ev.target.msg );
    },

    _appendTemplate : function( text, where ) {
        var doc = Foxtrick.current_doc;

        if ( arguments.length < 2 )
            var where = doc.getElementById( FoxtrickForumTemplates._TEMPLATES_DIV_ID );

        if ( !where )
            return;

        var remover = doc.createElement( "a" );
        remover.style.marginRight = "1em";
        remover.setAttribute( "href", "javascript:void(0)" );
        remover.msg = text;
        remover.innerHTML = "[x]";
        remover.addEventListener( "click", FoxtrickForumTemplates._removeTemplate, false );
        where.appendChild( remover );

        var curr = doc.createElement( "a" );
        var br = doc.createElement( "br" );
        curr.setAttribute( "href", "javascript:void(0)" );
        curr.msg = text;
        curr.innerHTML = text.substring( 0, FoxtrickForumTemplates._MAX_TEMPLATE_DISP_LENGTH );
        if ( text.length > FoxtrickForumTemplates._MAX_TEMPLATE_DISP_LENGTH )
            curr.innerHTML += "...";

        curr.addEventListener( "click", FoxtrickForumTemplates._fillMsgWindow, false );
        where.appendChild( curr );
        where.appendChild( br );
    }
};

