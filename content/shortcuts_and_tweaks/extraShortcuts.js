/**
* extraShortcuts.js
* Adds an imagelink to the shortcut
* @author baumanns, spambot
*/

var FoxtrickExtraShortcuts = {

    MODULE_NAME : "ExtraShortcuts",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('all'), 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.1.2",	
	LATEST_CHANGE : "Module name changed to ExtraShortcuts",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	OPTIONS : new Array("AddLeft","Supporterstats", "Transfers", "Prefs", "FoxTrickPrefs", "Ht_radio_winamp","Ht_radio_windows_mediaplayer"),
	CSS:"",
	
    init : function() {
		Foxtrick.unload_css_permanent ( this.CSS );
		
		var num_shown=0;
		if (Foxtrick.isModuleFeatureEnabled( this, "Supporterstats")) ++num_shown;
        if (Foxtrick.isModuleFeatureEnabled( this, "Transfers")) ++num_shown;
        if (Foxtrick.isModuleFeatureEnabled( this, "Prefs")) ++num_shown;
		if (Foxtrick.isModuleFeatureEnabled( this, "FoxTrickPrefs")) ++num_shown;
        if (Foxtrick.isModuleFeatureEnabled( this, "Ht_radio_winamp") 
			|| Foxtrick.isModuleFeatureEnabled( this, "Ht_radio_windows_mediaplayer") ) ++num_shown;
        if (num_shown==0) {
			this.CSS="";
		}
        else if (num_shown==1) {
			this.CSS = Foxtrick.ResourcePath+"resources/css/shortcuts_one.css";
		}
        else if (num_shown==2) {
			this.CSS = Foxtrick.ResourcePath+"resources/css/shortcuts_two.css";
		}
        
    },

	change : function( page, doc ) {
	},

    run : function( page, doc ) {
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
                    link.className = 'ft_extra-shortcuts';
                    link.href = "../../World/Stats/";
                    //link.setAttribute("style", "padding:3px 0px 0px 4px;");
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftSuppStats");
                    img1.src = Foxtrick.ResourcePath+"resources/img/transparent.gif";
                    img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/linkicons/chart_bar.png') !important;");
                    img1.title = Foxtrickl10n.getString("foxtrick.ExtraShortcuts.statistics");

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
                    link.className = 'ft_extra-shortcuts';
                    link.href = "../../Club/Transfers/";
                    //link.setAttribute("style", "padding:3px 0px 0px 4px;");
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftMyTransfers");
                    img1.src = Foxtrick.ResourcePath+"resources/img/transparent.gif";
                    img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/linkicons/dollar.png') !important;");
                    img1.title = Foxtrickl10n.getString("foxtrick.ExtraShortcuts.transfers");

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
                    link.className = 'ft_extra-shortcuts';
                    link.href = "../../MyHattrick/Preferences/";
                    //link.setAttribute("style", "padding:3px 0px 0px 4px;");
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftSCPrefs");
                    img1.src = Foxtrick.ResourcePath+"resources/img/transparent.gif";
                    img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/linkicons/options.png') !important;");
                    img1.title = Foxtrickl10n.getString("foxtrick.ExtraShortcuts.prefs");

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
                    link.className = 'ft_extra-shortcuts';
                    link.href = "../../MyHattrick/?configure_foxtrick=true&category=main/";
                    //link.setAttribute("style", "padding:3px 0px 0px 4px;");
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftSCPrefs");
                    img1.src = Foxtrick.ResourcePath+"resources/img/transparent.gif";
                    img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/img/foxtrick22.png') !important;");
                    img1.title = Foxtrickl10n.getString("foxtrick.ExtraShortcuts.ftprefs");

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


				if (Foxtrick.isModuleFeatureEnabled( this, "Ht_radio_winamp")                
					|| Foxtrick.isModuleFeatureEnabled( this, "Ht_radio_windows_mediaplayer")) {                
                    
					var link = doc.createElement('a');                
                    link.className = 'ft_extra-shortcuts';
                    link.target="_blank";
					link.href = "http://www.ht-radio.nl";                    
					//link.setAttribute("style", "padding:3px 0px 0px 4px;");
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftSCPrefs");
                    img1.src = Foxtrick.ResourcePath+"resources/img/transparent.gif";
                    img1.id = 'ft_extra-shortcuts_ht_radio_icon';
					
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
					
					
					var online=false;
					try {
						var location = 'http://stream.ht-radio.nl/foxtrick-status.php'
						var startTime = (new Date()).getTime();
						var req = new XMLHttpRequest();
						req.open("GET", location, false);
						req.overrideMimeType('text/xml');

						req.send(null);
						if (req.status == 200) {
							var endTime = (new Date()).getTime();
							Foxtrick.dump("Time used for "+location+": " + (endTime - startTime) + "ms. "
								+ "(This estimation is inaccurate, please use Tamper Data or other tools for better estimation)\n");
							var radio_xml = req.responseXML;					 
							if (radio_xml.getElementsByTagName('HattrickRadio').length!=0) {
								if (radio_xml.getElementsByTagName('status').length!=0) {
									if (radio_xml.getElementsByTagName('status')[0].textContent==='online') {
										online = true;
										//doc.getElementById('ft_extra-shortcuts_ht_radio_icon').
										img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/img/radio-icon.png') !important;");                    
										img1.title = "Hattrick Radio now playing: "+radio_xml.getElementsByTagName('song')[0].textContent;
										if (Foxtrick.isModuleFeatureEnabled( this, "Ht_radio_winamp")) 
											link.href = radio_xml.getElementsByTagName('winamp')[0].textContent;
										else link.href = radio_xml.getElementsByTagName('windows')[0].textContent;
										Foxtrick.dump('Hattrick Radio online\n');
									}
									else link.href = radio_xml.getElementsByTagName('website')[0].textContent;                    
								}
							}							
						}
						else {
							Foxtrick.dump("Failure getting " + location + ", request status: " + req.status + ".\n");
						}
					}
					catch (e) {
						Foxtrick.dump("Failure getting " + location + ": " + e + "\n");
					}				
					//doc.getElementById('ft_extra-shortcuts_ht_radio_icon').
					if (!online) {
						img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/img/radio-icon-offline.png') !important;");                    
						img1.title = "Hattrick Radio offline";
					}
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
                Foxtrick.dump( ' => ExtraShortcuts: ' + e + '\n');
            }
        }
    }
}
// EOF 
