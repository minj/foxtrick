/**
* shortcutsstatistics.js
* Adds an imagelink to the shortcut
* @author baumanns
*/

var FoxtrickShortcutsStatistics = {

    MODULE_NAME : "shortcutsstatistics",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : true,

    init : function() {
        Foxtrick.registerPageHandler( 'all', this);
    },


    run : function( page, doc ) {
        
        var targetNode = doc.getElementById ( 'shortcuts' );
        if (targetNode) {
            try {
                var link = doc.createElement('a');                
                link.href = "../../World/Stats/";
                link.setAttribute("style", "padding:3px 0px 0px 5px;");
                
                var img1 = doc.createElement('img');
                img1.setAttribute( "class", "scLive");
                img1.src = "/Img/Icons/transparent.gif";
                img1.setAttribute("style","background-image: url('http://famfamfam.com/lab/icons/silk/icons/chart_bar.png') !important;");
                img1.title = 'Statistics';

                link.appendChild(img1);
                
                targetNode.insertBefore(link, targetNode.lastChild);
            }
            catch(e) {
                dump( ' => shortcutsstatistics: ' + e + '\n');
            }
        }
    }
}
// EOF 