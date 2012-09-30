'use strict';
/**
* extra-shortcuts.js
* Adds an imagelink to the shortcut
* @author baumanns, spambot
*/

Foxtrick.modules['ExtraShortcuts'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['all'],
	OPTIONS: ['AddSpace', 'AddLeft', 'Supporterstats', 'Transfers', 'Prefs', 'FoxTrickPrefs',
		'ManageCHPP', 'HtRadio', 'No9', 'Latehome'],
	LINKS: {
		'Supporterstats': { link:'/World/Stats/', 	imgClass:'ftSuppStats', property:'statistics'},
		'Transfers':	{ link:'/Club/Transfers/', 	imgClass:'ftMyTransfers', property:'transfers'},
		'Prefs':		{ link:'/MyHattrick/Preferences/', imgClass:'ftSCPrefs', property:'prefs'},
		'ManageCHPP': { link:'/MyHattrick/Preferences/ExternalAccessGrants.aspx',
					imgClass:'ftManageCHPP', property:'ManageCHPP'}
	},

	RADIOS: ['HtRadio', 'No9', 'Latehome'],
	// following also need to be entered in manifest.json->optional_permissions
	// and perferences.js->neededPermissions
	RADIO_URLS: [
		'http://stream.ht-radio.nl/foxtrick/status.php',
		'http://no9-online.de/_no9/no9status.php',
		'http://www.latehome.de/foxtrick/status.php',
    ],
	CSS: Foxtrick.InternalPath + 'resources/css/extra-shortcuts.css',

	OPTIONS_CSS: [
		Foxtrick.InternalPath + 'resources/css/extra-shortcuts-space.css'
	],

	run: function(doc) {
		var checkRadio = function(url, radio) {
			Foxtrick.util.load.xml(url, function(radio_xml) {
				if (radio_xml != null && radio_xml.getElementsByTagName('radio').length != 0) {
					if (radio_xml.getElementsByTagName('status').length != 0) {
						var span = doc.getElementById(radio + 'Span');

						var list = span.getElementsByTagName('ul');
						list = doc.createElement('ul');
						list.className = 'ft-pop';
						list.setAttribute('style', 'margin-top:-1px;');


						if (radio_xml.getElementsByTagName('status')[0].textContent === 'online') {

							var item = doc.createElement('li');
							var h2 = doc.createElement('h2');
							h2.textContent = radio_xml.getElementsByTagName('iconOnline')[0]
								.getAttribute('value');
							item.appendChild(h2);
							list.appendChild(item);

							var item = doc.createElement('li');
							item.textContent = radio_xml.getElementsByTagName('song')[0]
								.getAttribute('value');
							item.appendChild(doc.createElement('br'));
							item.appendChild(doc.createTextNode(radio_xml
							                 .getElementsByTagName('song')[0].textContent));
							list.appendChild(item);

							var streams = radio_xml.getElementsByTagName('stream');
							for (var j = 0; j < streams.length; ++j) {
								var item = doc.createElement('li');
								var link = doc.createElement('a');
								link.href = Foxtrick.util.sanitize.parseUrl(streams[j].textContent);
								link.target = '_blank';
								link.textContent = streams[j].getAttribute('value');
								item.appendChild(link);
								list.appendChild(item);
							}

							var iconurl = Foxtrick.util.sanitize
								.parseUrl(radio_xml.getElementsByTagName('iconOnline')[0]
								          .textContent);
							var img1 = doc.getElementById(radio + 'Icon');
							img1.setAttribute('style', 'margin-left:2px; ' +
							                  'background-repeat:no-repeat; background-image: ' +
							                  'url(' + iconurl + ') !important;');
							FoxtrickPrefs.setString(radio + 'CurrentIcon', iconurl);
						}
						else {
							var item = doc.createElement('li');
							var h2 = doc.createElement('h2');
							h2.textContent = radio_xml.getElementsByTagName('iconOffline')[0]
								.getAttribute('value');
							item.appendChild(h2);
							list.appendChild(item);

							var iconurl = Foxtrick.util.sanitize
								.parseUrl(radio_xml.getElementsByTagName('iconOffline')[0]
								          .textContent);
							var img1 = doc.getElementById(radio + 'Icon');
							img1.setAttribute('style', 'margin-left:2px; ' +
							                  'background-repeat:no-repeat; background-image: ' +
							                  'url(' + iconurl + ') !important;');
							FoxtrickPrefs.setString(radio + 'CurrentIcon', iconurl);
						}
						var websites = radio_xml.getElementsByTagName('website');
						for (var j = 0; j < websites.length; ++j) {
							var item = doc.createElement('li');
							var link = doc.createElement('a');
							link.href = Foxtrick.util.sanitize.parseUrl(websites[j].textContent);
							link.target = '_blank';
							link.textContent = websites[j].getAttribute('value');
							item.appendChild(link);
							list.appendChild(item);
						}
						span.appendChild(list);
					}
				}
			});
		};

		var shortcuts = doc.getElementById('shortcuts') ||
			doc.getElementById('shortcutsNoSupporter');
		if (!shortcuts)
			return;
		var targetNode = shortcuts.getElementsByTagName('div');
		var i = 0, scCont = null;
		while (scCont = targetNode[i++]) {
			if (Foxtrick.hasClass(scCont, 'scContainer') ||
			    Foxtrick.hasClass(scCont, 'scContainerNoSupporter'))
				break;
		}
		targetNode = scCont;
		if (targetNode) {
				for (var j in this.LINKS) {
					if (FoxtrickPrefs.isModuleOptionEnabled('ExtraShortcuts', j)) {
						var link = doc.createElement('a');
						link.className = 'ft_extra-shortcuts';
						link.href = this.LINKS[j].link;

						var img1 = doc.createElement('img');
						img1.setAttribute('class', this.LINKS[j].imgClass);
						img1.src = '/Img/Icons/transparent.gif';
						img1.title = Foxtrickl10n.getString('ExtraShortcuts.' +
						                                    this.LINKS[j].property);
						img1.alt = Foxtrickl10n.getString('ExtraShortcuts.' +
						                                  this.LINKS[j].property);
						img1 = Foxtrick.makeFeaturedElement(img1, this);

						link.appendChild(img1);
						if (FoxtrickPrefs.isModuleOptionEnabled('ExtraShortcuts', 'AddLeft'))
							targetNode.insertBefore(link, targetNode.firstChild);
						else {
							if (targetNode.lastChild.nodeName == 'BR') {
								targetNode.insertBefore(link, targetNode.lastChild);
							}
							else {
								targetNode.appendChild(link);
							}
						}
					}
				}
				if (FoxtrickPrefs.isModuleOptionEnabled('ExtraShortcuts', 'FoxTrickPrefs')) {
					var link = doc.createElement('a');
					link.className = 'ft_extra-shortcuts';
					link.href = 'javascript:void(0);';
					Foxtrick.onClick(link, function() {
						FoxtrickPrefs.show('#tab=on_page&view-by=page');});
					var img1 = doc.createElement('img');
					img1.setAttribute('class', 'ftSCFtPrefs');
					img1.src = '/Img/Icons/transparent.gif';
					img1.title = Foxtrickl10n.getString('ExtraShortcuts.ftprefs');
					img1.alt = Foxtrickl10n.getString('ExtraShortcuts.ftprefs');
					img1 = Foxtrick.makeFeaturedElement(img1, this);

					link.appendChild(img1);
					if (FoxtrickPrefs.isModuleOptionEnabled('ExtraShortcuts', 'AddLeft'))
						targetNode.insertBefore(link, targetNode.firstChild);
					else {
						if (targetNode.lastChild.nodeName == 'BR') {
							targetNode.insertBefore(link, targetNode.lastChild);
						}
						else {
							targetNode.appendChild(link);
						}
					}
				}

			for (i = 0; i < this.RADIOS.length; ++i) {
				var radio = this.RADIOS[i];
				if (FoxtrickPrefs.isModuleOptionEnabled('ExtraShortcuts', radio)) {

					var link = Foxtrick.createFeaturedElement(doc, this, 'a');
					link.className = 'ft_extra-shortcuts';
					//link.target='_blank';
					link.id = radio + 'Id';
					var img1 = doc.createElement('img');
					img1.setAttribute('class', 'ftSCRadio');
					img1.src = '/Img/Icons/transparent.gif';
					img1.id = radio + 'Icon';
					if (FoxtrickPrefs.getString(radio + 'CurrentIcon') != null)
						img1.setAttribute('style', 'margin-left:2px; background-image: url(' +
						                  FoxtrickPrefs.getString(radio + 'CurrentIcon') +
						                  ') !important;');
					link.appendChild(img1);

					var span = doc.createElement('div');
					span.className = 'ft-pop-up-container';
					span.id = radio + 'Span';
					span.appendChild(link);

					if (FoxtrickPrefs.isModuleOptionEnabled('ExtraShortcuts', 'AddLeft'))
						targetNode.insertBefore(span, targetNode.firstChild);
					else {
						if (targetNode.lastChild.nodeName == 'BR') {
							targetNode.insertBefore(span, targetNode.lastChild);
						}
						else {
							targetNode.appendChild(span);
						}
					}
					checkRadio(this.RADIO_URLS[i], radio);
				}
			}
		}
	}
};
