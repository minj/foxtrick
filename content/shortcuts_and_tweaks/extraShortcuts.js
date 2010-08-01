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
	NEW_AFTER_VERSION : "0.5.2.1",	
	LATEST_CHANGE : "Optional extra space for shortcuts. Links to national Hattrick radios added",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS : new Array("AddLeft","AddSpace","Supporterstats", "Transfers", "Prefs", "FoxTrickPrefs", "HtRadioWinamp","HtRadioMediaPlayer"),//,"DTRadioWinamp"),
	CSS:"",
	
    run : function( page, doc ) { 
        var shortcuts = doc.getElementById ( 'shortcuts' );
		if (!shortcuts) return;
		var targetNode = doc.getElementById ( 'shortcuts' ).getElementsByTagName('div');
		var i=0, scCont=null;
		while (scCont=targetNode[i++]) {if (scCont.className=='scContainer') break;}
		targetNode=scCont;
		if (targetNode) {
            try {
			
			if (Foxtrick.isModuleFeatureEnabled( this, "AddSpace")) {
				var head = doc.getElementsByTagName("head")[0];
				var style = doc.createElement("style");
				style.setAttribute("type", "text/css"); 
					// here
					var zaw = '#scSettingsLink{display:none;} div#shortcuts, div#shortcuts div.scContainer {width: 324px !important;} #ticker {width:400px; left: 235px !important;} div#ticker div { width:400px !important; overflow:hidden !important; white-space:nowrap !important;} div#ticker div a { padding:0 2px !important; }';
					if (Foxtrick.isRTLLayout(doc)) 
							zaw = '#scSettingsLink{display:none;} div#shortcuts, div#shortcuts div.scContainer {width: 324px !important;} #ticker {width:400px; left: 350px;} div#ticker div { width:400px !important; overflow:hidden !important; white-space:nowrap !important;} div#ticker div a { padding:0 2px !important; }';
						
					if (!Foxtrick.isStandardLayout ( doc )) 
						{	 zaw = '#scSettingsLink{display:none;} div#shortcuts, div#shortcuts div.scContainer {width: 324px !important;} #ticker {width:275px; left: 165px !important;} div#ticker div { width:275px !important; overflow:hidden !important; white-space:nowrap !important;} div#ticker div a { padding:0 2px !important; }';
						if (Foxtrick.isRTLLayout(doc)) 
							zaw = '#scSettingsLink{display:none;} div#shortcuts, div#shortcuts div.scContainer {width: 324px !important;} #ticker {width:275px; left: 350px;} div#ticker div { width:275px !important; overflow:hidden !important; white-space:nowrap !important;} div#ticker div a { padding:0 2px !important; }';
						}			
					style.appendChild(doc.createTextNode(zaw));
					head.appendChild(style);
			}
			
			
			if (Foxtrick.isModuleFeatureEnabled( this, "Supporterstats")
				&& Foxtrick.isSupporter(doc)) {
                    var link = doc.createElement('a');                
                    link.className = 'ft_extra-shortcuts';
                    link.href = "../../World/Stats/";
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftSuppStats");
                    img1.src = Foxtrick.ResourcePath+"resources/img/transparent.gif";
                    img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/img/shortcuts/stats.png') !important;");
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
                }
                
				
                if (Foxtrick.isModuleFeatureEnabled( this, "Transfers")) {                
                    var link = doc.createElement('a');                
                    link.className = 'ft_extra-shortcuts';
                    link.href = "../../Club/Transfers/";
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftMyTransfers");
                    img1.src = Foxtrick.ResourcePath+"resources/img/transparent.gif";
                    img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/img/shortcuts/transfers.png') !important;");
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
                }

				
                if (Foxtrick.isModuleFeatureEnabled( this, "Prefs")) {                
                    var link = doc.createElement('a');                
                    link.className = 'ft_extra-shortcuts';
                    link.href = "../../MyHattrick/Preferences/";
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftSCPrefs");
                    img1.src = Foxtrick.ResourcePath+"resources/img/transparent.gif";
                    img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/img/shortcuts/options.png') !important;");
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
                }
				
				
				if (Foxtrick.isModuleFeatureEnabled( this, "FoxTrickPrefs")) {                
                    var link = doc.createElement('a');                
                    link.className = 'ft_extra-shortcuts';
                    link.href = "../../MyHattrick/?configure_foxtrick=true&category=main/";
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftSCPrefs");
                    img1.src = Foxtrick.ResourcePath+"resources/img/transparent.gif";
                    img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/img/shortcuts/foxtrick.png') !important;");
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
                }


				if (Foxtrick.isModuleFeatureEnabled( this, "HtRadioWinamp")                
					|| Foxtrick.isModuleFeatureEnabled( this, "HtRadioMediaPlayer")) {                
                    
					var link = doc.createElement('a');                
                    link.className = 'ft_extra-shortcuts';
                    link.target="_blank";
					link.href = "http://www.ht-radio.nl";                                        
                    link.id = 'ht_radio_link';					
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftSCPrefs");
                    img1.src = Foxtrick.ResourcePath+"resources/img/transparent.gif";
                    img1.id = 'ht_radio_icon';					
					img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/img/shortcuts/radio-icon-offline.png') !important;");                    
					img1.title = "Hattrick Radio offline";
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
					
						var url = 'http://stream.ht-radio.nl/foxtrick-status.php';											
						var req = new XMLHttpRequest();
						var abortTimerId = window.setTimeout(function(){req.abort()}, 20000);
						var stopTimer = function(){window.clearTimeout(abortTimerId); };
						req.onreadystatechange = function(){
							if (req.readyState == 4){ 
								try {
									stopTimer(); 
									var radio_xml = req.responseXML;					 
									if (radio_xml != null && radio_xml.getElementsByTagName('HattrickRadio').length!=0) {
										if (radio_xml.getElementsByTagName('status').length!=0) {
											var link = doc.getElementById('ht_radio_link');
											if (radio_xml.getElementsByTagName('status')[0].textContent==='online') {
												var img1 = doc.getElementById('ht_radio_icon');
												img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/img/shortcuts/radio-icon.png') !important;");                    
												img1.title = "Hattrick Radio now playing: "+radio_xml.getElementsByTagName('song')[0].textContent;
												if (Foxtrick.isModuleFeatureEnabled( this, "HtRadioWinamp")) 
													link.href = radio_xml.getElementsByTagName('winamp')[0].textContent;
												else link.href = radio_xml.getElementsByTagName('windows')[0].textContent;
											}
											else link.href = radio_xml.getElementsByTagName('website')[0].textContent;                    
										}
									}
								}							
								catch (e) {
									Foxtrick.dump("Failure getting " + url + ": " + e + "\n");
								}				
							}
						}
						var url = 'http://stream.ht-radio.nl/foxtrick-status.php';
						req.open('GET', url , true); 
						//req.overrideMimeType('text/xml');
						req.send(null);
                }	
				
				
				/*if (Foxtrick.isModuleFeatureEnabled( this, "DTRadioWinamp")) {
					var link = doc.createElement('a');                
                    link.className = 'ft_extra-shortcuts';
                    link.target="_blank";
					link.href = "http://down-times.de/index.php";                    
                    
                    var img1 = doc.createElement('img');
                    img1.setAttribute( "class", "ftSCPrefs");
                    img1.src = Foxtrick.ResourcePath+"resources/img/transparent.gif";
                    img1.id = 'ft_extra-shortcuts_dt_radio_icon';
					
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
					var online=false;
					var title='';
					var now=new Date();
					var day=now.getDay();
					var hour=now.getHours();
					var minutes=now.getMinutes();
					Foxtrick.dump(day+' '+hour+' '+minutes+'\n');
					if (day==2 && ((hour>17 && hour<20) || (hour==17 && minutes>=30))) 
						{ online=true; title='cool down die Pokal & Friendlys';}
					if (day==5 && hour>=20 && hour<23)
						{ online=true; title='Gonzos Hattrick Wunschbox';}
					if (day==6 && ((hour>=17 && hour<21) || (hour==21 && minutes<=30))) 
						{ online=true; title='cool down die Ligaspiele Deutschland / Schweiz';}
					if (online) {
						//doc.getElementById('ft_extra-shortcuts_ht_radio_icon').
						img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/img/shortcuts/dtradio.png') !important;");                    
						img1.title = "Radio downtime now playing: "+title;
						link.href = 'http://www.down-times.de:2500/listen.pls';
					}
					//doc.getElementById('ft_extra-shortcuts_ht_radio_icon').
					if (!online) {
						img1.setAttribute("style","margin-left:2px; background-image: url('"+Foxtrick.ResourcePath+"resources/img/shortcuts/dtradio_offline.png') !important;");                    
						img1.title = "Radio downtime offline";
					}				
				}*/
			}
            catch(e) {
                Foxtrick.dump( ' => ExtraShortcuts: ' + e + '\n');
            }
        }
    }
}
// EOF 
