/**
* extra-shortcuts.js
* Adds an imagelink to the shortcut
* @author baumanns, spambot
*/

var FoxtrickExtraShortcuts = {

	MODULE_NAME : "ExtraShortcuts",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('all'),
	OPTIONS : ["AddSpace","AddLeft","Supporterstats", "Transfers", "Prefs", "FoxTrickPrefs", "ManageCHPP", "HtRadio", "No9", "Latehome", "Balkaradio", "Downtime"],
	RADIOS: ["HtRadio", "No9", "Latehome", "Balkaradio", "Downtime"],
	RADIO_URLS: [
		"http://stream.ht-radio.nl/foxtrick/status.php",
		"http://no9-online.de/_no9/no9status.php",
		"http://www.latehome.de/foxtrick/status.php",
		"http://radio-balkadio.com/radio.xml",
		"http://www.down-times.de/dtrfoxi/dtrstatus.php"
	],
	CSS: Foxtrick.ResourcePath+"resources/css/extra-shortcuts.css",
	
	OPTIONS_CSS: [ Foxtrick.ResourcePath+"resources/css/extra-shortcuts-space.css"],
	OPTIONS_CSS_SIMPLE: [  Foxtrick.ResourcePath+"resources/css/extra-shortcuts-space-simple.css"],
	OPTIONS_CSS_RTL: [ Foxtrick.ResourcePath+"resources/css/extra-shortcuts-space-rtl.css"],
	OPTIONS_CSS_RTL_SIMPLE: [ Foxtrick.ResourcePath+"resources/css/extra-shortcuts-space-rtl-simple.css"],

	run : function(doc) {
		var shortcuts = doc.getElementById ( 'shortcuts' );
		if (!shortcuts) return;
		var targetNode = doc.getElementById ( 'shortcuts' ).getElementsByTagName('div');
		var i=0, scCont=null;
		while (scCont=targetNode[i++]) {if (scCont.className=='scContainer') break;}
		targetNode=scCont;
		if (targetNode) {
			if (FoxtrickPrefs.isModuleOptionEnabled( this, "Supporterstats")
				&& Foxtrick.util.layout.isSupporter(doc)) {
					var link = doc.createElement('a');
					link.className = 'ft_extra-shortcuts';
					link.href = "/World/Stats/";

					var img1 = doc.createElement('img');
					img1.setAttribute( "class", "ftSuppStats");
					img1.src = "/Img/Icons/transparent.gif";
					img1.title = Foxtrickl10n.getString("foxtrick.ExtraShortcuts.statistics");

					link.appendChild(img1);
					if (FoxtrickPrefs.isModuleOptionEnabled( this, "AddLeft")) targetNode.insertBefore(link,targetNode.firstChild);
					else {
						if (targetNode.lastChild.nodeName=='BR') {
							targetNode.insertBefore(link,targetNode.lastChild);
						}
						else {
							targetNode.appendChild(link);
						}
					}
				}

				if (FoxtrickPrefs.isModuleOptionEnabled( this, "Transfers")) {
					var link = doc.createElement('a');
					link.className = 'ft_extra-shortcuts';
					link.href = "/Club/Transfers/";

					var img1 = doc.createElement('img');
					img1.setAttribute( "class", "ftMyTransfers");
					img1.src = "/Img/Icons/transparent.gif";
					img1.title = Foxtrickl10n.getString("foxtrick.ExtraShortcuts.transfers");

					link.appendChild(img1);
					if (FoxtrickPrefs.isModuleOptionEnabled( this, "AddLeft")) targetNode.insertBefore(link,targetNode.firstChild);
					else {
						if (targetNode.lastChild.nodeName=='BR') {
							targetNode.insertBefore(link,targetNode.lastChild);
						}
						else {
							targetNode.appendChild(link);
						}
					}
				}

				if (FoxtrickPrefs.isModuleOptionEnabled( this, "Prefs")) {
					var link = doc.createElement('a');
					link.className = 'ft_extra-shortcuts';
					link.href = "/MyHattrick/Preferences/";

					var img1 = doc.createElement('img');
					img1.setAttribute( "class", "ftSCPrefs");
					img1.src = "/Img/Icons/transparent.gif";
					img1.title = Foxtrickl10n.getString("foxtrick.ExtraShortcuts.prefs");

					link.appendChild(img1);
					if (FoxtrickPrefs.isModuleOptionEnabled( this, "AddLeft")) targetNode.insertBefore(link,targetNode.firstChild);
					else {
						if (targetNode.lastChild.nodeName=='BR') {
							targetNode.insertBefore(link,targetNode.lastChild);
						}
						else {
							targetNode.appendChild(link);
						}
					}
				}
			
				if (FoxtrickPrefs.isModuleOptionEnabled( this, "ManageCHPP")) {
					var link = doc.createElement('a');
					link.className = 'ft_extra-shortcuts';
					link.href = "/MyHattrick/Preferences/ExternalAccessGrants.aspx";

					var img1 = doc.createElement('img');
					img1.setAttribute( "class", "ftManageCHPP");
					img1.src = "/Img/Icons/transparent.gif";
					img1.title = Foxtrickl10n.getString("foxtrick.ExtraShortcuts.ManageCHPP");

					link.appendChild(img1);
					if (FoxtrickPrefs.isModuleOptionEnabled( this, "AddLeft")) targetNode.insertBefore(link,targetNode.firstChild);
					else {
						if (targetNode.lastChild.nodeName=='BR') {
							targetNode.insertBefore(link,targetNode.lastChild);
						}
						else {
							targetNode.appendChild(link);
						}
					}
				}
				
				if (FoxtrickPrefs.isModuleOptionEnabled( this, "FoxTrickPrefs")) {
					var link = doc.createElement('a');
					link.className = 'ft_extra-shortcuts';
					link.href = 'javascript:void();'
					link.addEventListener('click', function() {FoxtrickCore.showPreferences("pagefiltered");}, false);
					var img1 = doc.createElement('img');
					img1.setAttribute( "class", "ftSCFtPrefs");
					img1.src = "/Img/Icons/transparent.gif";
					img1.title = Foxtrickl10n.getString("foxtrick.ExtraShortcuts.ftprefs");

					link.appendChild(img1);
					if (FoxtrickPrefs.isModuleOptionEnabled( this, "AddLeft")) targetNode.insertBefore(link,targetNode.firstChild);
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
				if (FoxtrickPrefs.isModuleOptionEnabled( this, radio)) {

					var link = doc.createElement('a');
					link.className = 'ft_extra-shortcuts';
					//link.target="_blank";
					link.id = radio+'Id';
					var img1 = doc.createElement('img');
					img1.setAttribute( "class", "ftSCRadio");
					img1.src = "/Img/Icons/transparent.gif";
					img1.id = radio+'Icon';
					if (FoxtrickPrefs.getString(radio+'CurrentIcon') != null)
						img1.setAttribute("style","margin-left:2px; background-image: url('"+FoxtrickPrefs.getString(radio+'CurrentIcon')+"') !important;");
					link.appendChild(img1);

					var span = doc.createElement("div");
					span.className = "ft-pop-up-container";
					span.id = radio+'Span';
					span.appendChild(link);

					if (FoxtrickPrefs.isModuleOptionEnabled( this, "AddLeft")) targetNode.insertBefore(span,targetNode.firstChild);
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

	checkRadio : function(doc, url, radio) {
		Foxtrick.loadXml(url, function(radio_xml) {
			if (radio_xml != null && radio_xml.getElementsByTagName('radio').length!=0) {
				if (radio_xml.getElementsByTagName('status').length!=0) {
					var span = doc.getElementById(radio+'Span');

					var list = span.getElementsByTagName('ul');
					list = doc.createElement("ul");
					list.className = "ft-pop";
					list.setAttribute('style',"margin-top:-1px;");
							

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
		}, true);
	}
}
