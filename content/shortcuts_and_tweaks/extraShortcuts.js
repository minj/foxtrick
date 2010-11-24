/**
* extraShortcuts.js
* Adds an imagelink to the shortcut
* @author baumanns, spambot
*/

var FoxtrickExtraShortcuts = {

    MODULE_NAME : "ExtraShortcuts",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('all'),
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Optional extra space for shortcuts. Links to national Hattrick radios added",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS : new Array("AddLeft","AddSpace","Supporterstats", "Transfers", "Prefs", "FoxTrickPrefs", "HtRadio", "No9", "Latehome" ),//,"DTRadioWinamp"),
	RADIOS: new Array("HtRadio", "No9", "Latehome"),
	RADIO_URLS: new Array('http://stream.ht-radio.nl/foxtrick/status.php', 'http://no9-online.de/_no9/no9status.php','http://www.latehome.de/foxtrick/status.php'),

	CSS:"",

	run : function( page, doc ) {
		var shortcuts = doc.getElementById ( 'shortcuts' );
		if (!shortcuts) return;
		var targetNode = doc.getElementById ( 'shortcuts' ).getElementsByTagName('div');
		var i=0, scCont=null;
		while (scCont=targetNode[i++]) {if (scCont.className=='scContainer') break;}
		targetNode=scCont;
		if (targetNode) {

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
					link.href = "/World/Stats/";

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
					link.href = "/Club/Transfers/";

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
					link.href = "/MyHattrick/Preferences/";

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
					link.href = "/MyHattrick/?configure_foxtrick=true&category=main/";

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

			for(i=0; i<this.RADIOS.length; ++i) {
				var radio = this.RADIOS[i];
				if (Foxtrick.isModuleFeatureEnabled( this, radio)) {

					var link = doc.createElement('a');
					link.className = 'ft_extra-shortcuts';
					//link.target="_blank";
					link.id = radio+'Id';
					var img1 = doc.createElement('img');
					img1.setAttribute( "class", "ftSCPrefs");
					img1.src = Foxtrick.ResourcePath+"resources/img/transparent.gif";
					img1.id = radio+'Icon';
					if (FoxtrickPrefs.getString(radio+'CurrentIcon') != null)
						img1.setAttribute("style","margin-left:2px; background-image: url('"+FoxtrickPrefs.getString(radio+'CurrentIcon')+"') !important;");
					link.appendChild(img1);

					var span = doc.createElement("span");
					span.className = "ft-drop-down-span";
					span.id = radio+'Span';
					span.appendChild(link);

					if (Foxtrick.isModuleFeatureEnabled( this, "AddLeft")) targetNode.insertBefore(span,targetNode.firstChild);
					else {
						if (targetNode.lastChild.nodeName=='BR') {
							targetNode.insertBefore(span,targetNode.lastChild);
						}
						else {
							targetNode.appendChild(span);
						}
					}
					FoxtrickExtraShortcuts.checkRadio( doc, this.RADIO_URLS[i], radio )
				}
			}
		}
	},

	checkRadio : function( doc, url, radio ) {
		try {
			var req = new XMLHttpRequest();
			var abortTimerId = window.setTimeout(function(){req.abort()}, 5000);
			var stopTimer = function(){window.clearTimeout(abortTimerId); };
			req.onreadystatechange = function(){
				if (req.readyState == 4){
					try {
						stopTimer();
						var radio_xml = req.responseXML;

						if (radio_xml != null && radio_xml.getElementsByTagName('radio').length!=0) {
							if (radio_xml.getElementsByTagName('status').length!=0) {
								var span = doc.getElementById(radio+'Span');

								var list = span.getElementsByTagName('ul');
								list = doc.createElement("ul");
								list.className = "ft-pop";


								if (radio_xml.getElementsByTagName('status')[0].textContent==='online') {

									var item = doc.createElement("li");
									item.innerHTML = '<h2>'+radio_xml.getElementsByTagName('iconOnline')[0].getAttribute('value').replace(/javascript/gi,'')+'</h2>';
									list.appendChild(item);

									var item = doc.createElement("li");
									item.innerHTML = radio_xml.getElementsByTagName('song')[0].getAttribute('value').replace(/javascript/gi,'')+ '<br>'
													+ radio_xml.getElementsByTagName('song')[0].textContent.replace(/javascript/gi,'');
									list.appendChild(item);

									var streams = radio_xml.getElementsByTagName('stream')
									for (var j=0; j<streams.length; ++j) {
										var item = doc.createElement("li");
										var link = doc.createElement("a");
										link.href = streams[j].textContent.replace(/javascript/gi,'');
										link.target='_blank';
										link.textContent = streams[j].getAttribute('value');
										item.appendChild(link);
										list.appendChild(item);
									}

									var img1 = doc.getElementById(radio+'Icon');
									img1.setAttribute("style","margin-left:2px; background-repeat:no-repeat; background-image: url('"+radio_xml.getElementsByTagName('iconOnline')[0].textContent.replace(/javascript/gi,'')+"') !important;");
									FoxtrickPrefs.setString(radio+'CurrentIcon',radio_xml.getElementsByTagName('iconOnline')[0].textContent.replace(/javascript/gi,''));
								}
								else {
									var item = doc.createElement("li");
									item.innerHTML = '<h2>'+radio_xml.getElementsByTagName('iconOffline')[0].getAttribute('value').replace(/javascript/gi,'')+'</h2>';
									list.appendChild(item);
									var img1 = doc.getElementById(radio+'Icon');
									img1.setAttribute("style","margin-left:2px; background-repeat:no-repeat; background-image: url('"+radio_xml.getElementsByTagName('iconOffline')[0].textContent.replace(/javascript/gi,'')+"') !important;");
									FoxtrickPrefs.setString(radio+'CurrentIcon',radio_xml.getElementsByTagName('iconOffline')[0].textContent.replace(/javascript/gi,''));
								}
								var websites = radio_xml.getElementsByTagName('website')
								for (var j=0; j<websites.length; ++j) {
									var item = doc.createElement("li");
									var link = doc.createElement("a");
									link.href = websites[j].textContent.replace(/javascript/gi,'');
									link.target='_blank';
									link.textContent = websites[j].getAttribute('value');
									item.appendChild(link);
									list.appendChild(item);
								}
								span.appendChild(list);
							}
						}
					}
					catch (e) {
						Foxtrick.dump("Failure getting " + url + "\n");
						Foxtrick.dumpError(e);
					}
				}
			}
			req.open('GET', url , true);
			req.overrideMimeType('text/xml');
			req.send(null);
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},
}
// EOF
