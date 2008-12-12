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
/*Foxtrick.need_init = [ FoxtrickPrefs,
                       FoxtrickForumTemplates,
                       Foxtrickl10n,
                       BookmarkAdjust,
                       FoxtrickHideManagerAvatar,
                       FoxtrickForumStaffMarker,
                       FoxtrickAddLeaveConfButton ];*/

/** Modules that are to be called every time any hattrick page loads.
 * Should implement a run() method.
 * DON'T EDIT THIS, use registerAllPagesHandler() instead.
 */
Foxtrick.run_every_page = [];

/** Modules that are to be called on specific hattrick page loads.
 * Should implement a run() method.
 * DON'T EDIT THIS, use registerPageHandler() instead.
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

        
        // hattrick URL check and run if on HT
        if ( Foxtrick.getHref( doc ).search( FoxtrickPrefs.getString( "HTURL" ) ) > -1 )
        {
            var begin = new Date();

            FoxtrickMain.run( doc );

            var end = new Date();
            var time = ( end.getSeconds() - begin.getSeconds() ) * 1000
                     + end.getMilliseconds() - begin.getMilliseconds();
            dump( "Foxtrick run time: " + time + " ms\n" );
        }
    },

    // main entry run on every ht page load
    run : function( doc ) {
        // call the modules that want to be run() on every hattrick page
        Foxtrick.run_every_page.forEach(
            function( fn ) {
                fn.run( doc )
            } );

        // call all modules that registered as page listeners
        // if their page is loaded
        
        // find current page index/name and run all handlers for this page
        for ( var i in Foxtrick.ht_pages )
        {
            if ( Foxtrick.isPage( Foxtrick.ht_pages[i], doc ) )
            {
                // on a specific page, run all handlers
                Foxtrick.run_on_page[i].forEach(
                    function( fn ) {
                        fn.run( i, doc );
                    } );
            }
        }

    },

};

Foxtrick.isPage = function( page, doc ) {
    return Foxtrick.getHref( doc ).search( page ) > -1;
}

Foxtrick.getHref = function( doc ) {
    return doc.location.href;
}

/**
 * Register with this method to have your module's run()
 * function called on specific pages (names can be found
 * in Foxtrick.ht_pages in module.js.
 * Your function should accept two arguments:
 * the page name (from ht_pages) and current document.
 */
Foxtrick.registerPageHandler = function( page, who ) {

    if ( who.run )
    {
        Foxtrick.run_on_page[page].push( who );
    }
}

/**
 * Register with this method to have your module's run() function
 * called every time any hattrick page is loaded.
 * Please use registerPageHandler() if you need only to run
 * on specific pages.
 * Your run() function will be called with only one argument,
 * the current document.
 */
Foxtrick.registerAllPagesHandler = function( who ) {
    if ( who.run )
    {
        Foxtrick.run_every_page.push( who );
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

Foxtrick.addStyleSheet = function( doc, css ) {
	var path = "head[1]";
	var head = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;
	
	var link = doc.createElement("link");
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("media", "all");
	link.setAttribute("href", css);
	head.appendChild(link);
}


Foxtrick.trim = function (text) {
  return text.replace(/^\s+/, "").replace(/\s+$/, '');
}
