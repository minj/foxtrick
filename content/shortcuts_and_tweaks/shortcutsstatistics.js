/**
* shortcutsstatistics.js
* Adds an imagelink to the shortcut
* @author baumanns
*/

var FoxtrickShortcutsStatistics = {

    MODULE_NAME : "shortcutsstatistics",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : false,

    init : function() {
        Foxtrick.registerPageHandler( 'all', this);
    },

	change : function( page, doc ) {
        var elm = doc.getElementById( 'ft_shortcutsstatistics' );
        if (elm != null) return;
	},

    run : function( page, doc ) {
        
        var elm = doc.getElementById( 'ft_shortcutsstatistics' );
        if (elm != null) return;

        var targetNode = doc.getElementById ( 'shortcuts' );
        if (targetNode) {
            try {
                var link = doc.createElement('a');                
                link.id = 'ft_shortcutsstatistics';
                link.href = "../../World/Stats/";
                link.setAttribute("style", "padding:3px 0px 0px 5px;");
                
                var img1 = doc.createElement('img');
                img1.setAttribute( "class", "scLive");
                img1.src = "/Img/Icons/transparent.gif";
                img1.setAttribute("style","background-image: url('chrome://foxtrick/content/resources/linkicons/chart_bar.png') !important;");
                img1.title = Foxtrickl10n.getString("foxtrick.shortcutsstatistics.label");

                link.appendChild(img1);
                
                targetNode.insertBefore(link, targetNode.lastChild);
                var link = doc.createElement('a');                
                link.id = 'ft_shortcutsstatistics';
                link.href = "../../Club/Transfers/";
                link.setAttribute("style", "padding:3px 0px 0px 5px;");
                
                var img1 = doc.createElement('img');
                img1.setAttribute( "class", "scLive");
                img1.src = "/Img/Icons/transparent.gif";
                img1.setAttribute("style","background-image: url('chrome://foxtrick/content/resources/linkicons/dollar.png') !important;");
                img1.title = Foxtrickl10n.getString("foxtrick.shortcutstransfers.label");

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