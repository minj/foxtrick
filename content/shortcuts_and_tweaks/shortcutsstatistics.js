/**
* shortcutsstatistics.js
* Adds an imagelink to the shortcut
* @author baumanns, spambot
*/

var FoxtrickShortcutsStatistics = {

    MODULE_NAME : "shortcutsstatistics",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('all'), 
    DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.9.1",	
	LATEST_CHANGE:"Added link to FoxTrick HTML preferences",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS : new Array("AddLeft","Supporterstats", "Transfers", "Prefs", "FoxTrickPrefs"),
	CSS:"",
	
    init : function() {
		Foxtrick.unload_css_permanent ( this.CSS );
		
		var num_shown=0;
		if (Foxtrick.isModuleFeatureEnabled( this, "Supporterstats")) ++num_shown;
        if (Foxtrick.isModuleFeatureEnabled( this, "Transfers")) ++num_shown;
        if (Foxtrick.isModuleFeatureEnabled( this, "Prefs")) ++num_shown;
		if (Foxtrick.isModuleFeatureEnabled( this, "FoxTrickPrefs")) ++num_shown;
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
		if (!shortcuts) return;
		var targetNode = doc.getElementById ( 'shortcuts' ).getElementsByTagName('div');
		var i=0, scCont=null;
		while (scCont=targetNode[i++]) {if (scCont.className=='scContainer') break;}
		targetNode=scCont;
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
                    img1.src = "chrome://foxtrick/content/resources/img/transparent.gif";
                    img1.setAttribute("style","margin-left:2px; background-image: url('chrome://foxtrick/content/resources/linkicons/chart_bar.png') !important;");
                    img1.title = Foxtrickl10n.getString("foxtrick.shortcutsstatistics.label");

                    link.appendChild(img1);
                    if (Foxtrick.isModuleFeatureEnabled( this, "AddLeft")) targetNode.insertBefore(link,targetNode.firstChild);
					else { 
						if (targetNode.lastChild.nodeName=='BR') {
							targetNode.insertBefore(link,targetNode.lastChild);
						}
						else {
							targetNode.appendChild(link);
						}
					}
					++num_added;
                }
                
                if (Foxtrick.isModuleFeatureEnabled( this, "Transfers")) {                
                    var link = doc.createElement('a');                
                    link.id = 'ft_shortcutsstatistics';
                    link.href = "../../Club/Transfers/";
                    //link.setAttribute("style", "padding:3px 0px 0px 4px;");
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftMyTransfers");
                    img1.src = "chrome://foxtrick/content/resources/img/transparent.gif";
                    img1.setAttribute("style","margin-left:2px; background-image: url('chrome://foxtrick/content/resources/linkicons/dollar.png') !important;");
                    img1.title = Foxtrickl10n.getString("foxtrick.shortcutstransfers.label");

                    link.appendChild(img1);
                    if (Foxtrick.isModuleFeatureEnabled( this, "AddLeft")) targetNode.insertBefore(link,targetNode.firstChild);
					else { 
						if (targetNode.lastChild.nodeName=='BR') { 
							targetNode.insertBefore(link,targetNode.lastChild);
						}
						else {
							targetNode.appendChild(link);
						}
					}
					++num_added;
                }

                if (Foxtrick.isModuleFeatureEnabled( this, "Prefs")) {                
                    var link = doc.createElement('a');                
                    link.id = 'ft_shortcutsstatistics';
                    link.href = "../../MyHattrick/Preferences/";
                    //link.setAttribute("style", "padding:3px 0px 0px 4px;");
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftSCPrefs");
                    img1.src = "chrome://foxtrick/content/resources/img/transparent.gif";
                    img1.setAttribute("style","margin-left:2px; background-image: url('chrome://foxtrick/content/resources/linkicons/options.png') !important;");
                    img1.title = Foxtrickl10n.getString("foxtrick.shortcutsprefs.label");

                    link.appendChild(img1);
                    if (Foxtrick.isModuleFeatureEnabled( this, "AddLeft")) targetNode.insertBefore(link,targetNode.firstChild);
					else { 
						if (targetNode.lastChild.nodeName=='BR') { 
							targetNode.insertBefore(link,targetNode.lastChild);
						}
						else {
							targetNode.appendChild(link);
						}
					}
					++num_added;
                }
				
				if (Foxtrick.isModuleFeatureEnabled( this, "FoxTrickPrefs")) {                
                    var link = doc.createElement('a');                
                    link.id = 'ft_shortcutsstatistics';
                    link.href = "../../MyHattrick/?configure_foxtrick=true&category=main/";
                    //link.setAttribute("style", "padding:3px 0px 0px 4px;");
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftSCPrefs");
                    img1.src = "chrome://foxtrick/content/resources/img/transparent.gif";
                    img1.setAttribute("style","margin-left:2px; background-image: url('chrome://foxtrick/content/resources/img/foxtrick22.png') !important;");
                    img1.title = Foxtrickl10n.getString("foxtrick.shortcutsfoxtrickprefs.label");

                    link.appendChild(img1);
                    if (Foxtrick.isModuleFeatureEnabled( this, "AddLeft")) targetNode.insertBefore(link,targetNode.firstChild);
					else { 
						if (targetNode.lastChild.nodeName=='BR') { 
							targetNode.insertBefore(link,targetNode.lastChild);
						}
						else {
							targetNode.appendChild(link);
						}
					}
					++num_added;
                }
				var head = doc.getElementsByTagName("head")[0];
				var style = doc.createElement("style");
				style.setAttribute("type", "text/css"); // +(353-num_added*22)+'
					// here
					var zaw = '#ticker {width:400px; left: 235px !important;} div#ticker div { width:400px !important; overflow:hidden !important; white-space:nowrap !important;} div#ticker div a { padding:0 2px !important; }';
					if (Foxtrick.isRTLLayout(doc)) 
							zaw = '#ticker {width:400px; left: 350px;} div#ticker div { width:400px !important; overflow:hidden !important; white-space:nowrap !important;} div#ticker div a { padding:0 2px !important; }';
						
					if (!Foxtrick.isStandardLayout ( doc )) 
						{	 zaw = '#ticker {width:275px; left: 165px !important;} div#ticker div { width:275px !important; overflow:hidden !important; white-space:nowrap !important;} div#ticker div a { padding:0 2px !important; }';
						if (Foxtrick.isRTLLayout(doc)) 
							zaw = '#ticker {width:275px; left: 350px;} div#ticker div { width:275px !important; overflow:hidden !important; white-space:nowrap !important;} div#ticker div a { padding:0 2px !important; }';
						}			
					style.appendChild(doc.createTextNode(zaw));
					head.appendChild(style);
				
			}
            catch(e) {
                Foxtrick.dump( ' => shortcutsstatistics: ' + e + '\n');
            }
        }
    }
}
// EOF 