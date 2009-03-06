/**
* shortcutsstatistics.js
* Adds an imagelink to the shortcut
* @author baumanns, spambot
*/

var FoxtrickShortcutsStatistics = {

    MODULE_NAME : "shortcutsstatistics",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : false,
	OPTIONS : new Array("Supporterstats", "Transfers"),
	CSS:"",
	
    init : function() {
        Foxtrick.registerPageHandler( 'all', this);
		Foxtrick.unload_css_permanent ( this.CSS );
		
		var num_shown=0;
		if (Foxtrick.isModuleFeatureEnabled( this, "Supporterstats")) ++num_shown;
        if (Foxtrick.isModuleFeatureEnabled( this, "Transfers")) ++num_shown;
        if (num_shown==0) {
			this.CSS="";
		}
        else if (num_shown==1) {
			this.CSS="chrome://foxtrick/content/resources/css/shortcuts_one.css";
		}
        else if (num_shown==2) {
			this.CSS="chrome://foxtrick/content/resources/css/shortcuts_two.css";
		}
        
    },

	change : function( page, doc ) {
        var elm = doc.getElementById( 'ft_shortcutsstatistics' );
        if (elm != null) return;
	},

    run : function( page, doc ) {
        
        var elm = doc.getElementById( 'ft_shortcutsstatistics' );
        if (elm != null) return;

        var shortcuts = doc.getElementById ( 'shortcuts' );
		var targetNode = doc.getElementById ( 'shortcuts' ).getElementsByTagName('div')[0];  // =scContainer
		if (targetNode) {
            try {
				var num_added=0;
                if (Foxtrick.isModuleFeatureEnabled( this, "Supporterstats")) {
                    var link = doc.createElement('a');                
                    link.id = 'ft_shortcutsstatistics';
                    link.href = "../../World/Stats/";
                    //link.setAttribute("style", "padding:3px 0px 0px 4px;");
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftSuppStats");
                    img1.src = "/Img/Icons/transparent.gif";
                    img1.setAttribute("style","background-image: url('chrome://foxtrick/content/resources/linkicons/chart_bar.png') !important;");
                    img1.title = Foxtrickl10n.getString("foxtrick.shortcutsstatistics.label");

                    link.appendChild(img1);
                    targetNode.appendChild(link);
					++num_added;
                }
                
                if (Foxtrick.isModuleFeatureEnabled( this, "Transfers")) {                
                    var link = doc.createElement('a');                
                    link.id = 'ft_shortcutsstatistics';
                    link.href = "../../Club/Transfers/";
                    //link.setAttribute("style", "padding:3px 0px 0px 4px;");
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftMyTransfers");
                    img1.src = "/Img/Icons/transparent.gif";
                    img1.setAttribute("style","background-image: url('chrome://foxtrick/content/resources/linkicons/dollar.png') !important;");
                    img1.title = Foxtrickl10n.getString("foxtrick.shortcutstransfers.label");

                    link.appendChild(img1);
                    targetNode.appendChild(link);
					++num_added;
                }
				
				if (!Foxtrick.isStandardLayout ( doc )) 
				{	
					var head = doc.getElementsByTagName("head")[0];
					var style = doc.createElement("style");
					style.setAttribute("type", "text/css"); // +(353-num_added*22)+'
					var zaw = '#ticker {left: 190px !important;} div#ticker div { width:300px !important; overflow:hidden !important; white-space:nowrap !important;} div#ticker div a { padding:0 2px !important; }';
					if (Foxtrick.isRTLLayout(doc)) 
							zaw = 'div#ticker div { width:250px !important; overflow:hidden !important; white-space:nowrap !important;} div#ticker div a { padding:0 2px !important; }';
					
					style.appendChild(doc.createTextNode(zaw));
					head.appendChild(style);
				}				
            }
            catch(e) {
                dump( ' => shortcutsstatistics: ' + e + '\n');
            }
        }
    }
}
// EOF 