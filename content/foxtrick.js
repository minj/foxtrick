/**
 * Foxtrick - an extension for hattrick.org
 * Contact us: by HT-mail to Mod-PaV on hattrick.org
 */
////////////////////////////////////////////////////////////////////////////////
// execute at window load
window.addEventListener( "load", function() { FoxtrickMain.init(); }, false );
////////////////////////////////////////////////////////////////////////////////
/** Modules that need to be initialized and register their page handlers
 * in the beginning.
 * Each should implement an init() method
 */
Foxtrick.need_init = [ FoxtrickPrefs,
                       FoxtrickForumTemplates,
                       Foxtrickl10n ];

/** Modules that are to be called every time any hattrick page loads.
 * Should implement a run() method.
 * Note: not implemented yet
 */
Foxtrick.run_every_page = [];

/** Modules that are to be called on specific hattrick page loads.
 * Should implement a run() method.
 */
Foxtrick.run_on_page = [];
////////////////////////////////////////////////////////////////////////////////
var FoxtrickMain = {

    init : function() {

        // create handler arrays for each recognized page
        for ( i in Foxtrick.ht_pages )
        {
            Foxtrick.run_on_page[i] = new Array();
        }

         // listen to page loads
        var appcontent = document.getElementById( "appcontent" );
        if ( appcontent) 
            appcontent.addEventListener( "DOMContentLoaded", this.onPageLoad,
                                         true );
        // init all modules
        for ( var i in Foxtrick.need_init )
        {
            if ( Foxtrick.need_init[i].init )
                Foxtrick.need_init[i].init();
        }

   },
    
    onPageLoad : function( ev ) {
        var doc = ev.originalTarget;

        if ( doc.nodeName != "#document" )
            return;

        Foxtrick.current_doc = doc;

        // save the current URL
        Foxtrick.current_url = doc.location.href;
        
        // hattrick URL check and run if on HT
        if ( Foxtrick.current_url.search( FoxtrickPrefs.getString( "HTURL" ) ) > -1 )
        {
            var begin = new Date();

            FoxtrickMain.run();

            var end = new Date();
            var time = ( end.getSeconds() - begin.getSeconds() ) * 1000
                     + end.getMilliseconds() - begin.getMilliseconds();
            dump( "Foxtrick run time: " + time + " ms\n" );
        }
    },

    // main entry run on every ht page load
    run : function() {
        // call all modules that registered as page listeners
        // if their page is loaded
        
        // find current page index/name and run all handlers for this page
        for ( var i in Foxtrick.ht_pages )
        {
            if ( Foxtrick.isPage( Foxtrick.ht_pages[i] ) )
            {
                // on a specific page, run all handlers
                Foxtrick.run_on_page[i].forEach(
                    function( fn ) {
                        fn.run( i );
                    } );
            }
        }

    },

};

Foxtrick.isPage = function( page ) {
    return Foxtrick.current_url.search( page ) > -1;
}

Foxtrick.registerPageHandler = function( page, who ) {

    if ( who.run )
    {
        Foxtrick.run_on_page[page].push( who );
    }
}


Foxtrick.stripHTML = function( text ) {
    return text.replace( /(<([^>]+)>)/ig,"");
}

Foxtrick.insertAtCursor = function( textarea, text ) {
    textarea.value = textarea.value.substring( 0, textarea.selectionStart )
                   + text
                   + textarea.value.substring( textarea.selectionEnd, textarea.value.length );
}

