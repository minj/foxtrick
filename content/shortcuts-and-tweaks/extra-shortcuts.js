/**
* extra-shortcuts.js
* Adds an imagelink to the shortcut
* @author baumanns, spambot, LA-MJ
*/

'use strict';

Foxtrick.modules['ExtraShortcuts'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	OUTSIDE_MAINBODY: true,
	PAGES: ['all'],
	OPTIONS: [
		'AddSpace',
		'AddLeft',
		'FoxTrickPrefs',
		'Stage',
		'Supporterstats', 'Transfers', 'Prefs', 'ManageCHPP',
		'No9', 'Latehome',
	],
	LINKS: {
		Stage: {
			link: '',
			imgClass: 'ftStageLink',
			property: 'stage',
		},
		Supporterstats: { link: '/World/Stats/', imgClass: 'ftSuppStats', property: 'statistics' },
		Transfers: { link: '/Club/Transfers/', imgClass: 'ftMyTransfers', property: 'transfers' },
		Prefs: { link: '/MyHattrick/Preferences/', imgClass: 'ftSCPrefs', property: 'prefs' },
		ManageCHPP: {
			link: '/MyHattrick/Preferences/ExternalAccessGrants.aspx',
			imgClass: 'ftManageCHPP',
			property: 'ManageCHPP',
		},
	},

	RADIOS: ['No9', 'Latehome'],

	// following also need to be entered in manifest.json->optional_permissions
	// and perferences.js->neededPermissions
	RADIO_URLS: [
		'http://radio-no9.de/_no9/no9status.php',
		'http://www.latehome.de/foxtrick/status.php',
	],
	CSS: Foxtrick.InternalPath + 'resources/css/extra-shortcuts.css',

	OPTIONS_CSS: [
		Foxtrick.InternalPath + 'resources/css/extra-shortcuts-space.css',
	],

	/** @param {document} doc */
	// eslint-disable-next-line complexity
	run: function(doc) {
		const module = this;

		const STAGE_ORIGIN = 'https://stage.hattrick.org';
		const PROD_ORIGIN = 'https://www.hattrick.org';

		let origin = doc.location.origin;
		// eslint-disable-next-line no-restricted-properties
		let relative = doc.location.pathname + doc.location.search;
		let link = new URL(relative, origin == STAGE_ORIGIN ? PROD_ORIGIN : STAGE_ORIGIN);
		module.LINKS.Stage.link = link.href;

		/**
		 * @param {string} url
		 * @param {string} radio
		 */
		var checkRadio = function(url, radio) {
			Foxtrick.util.load.xml(url, function(radioXML) {
				if (radioXML == null || radioXML.getElementsByTagName('radio').length == 0)
					return;

				if (radioXML.getElementsByTagName('status').length == 0)
					return;

				var span = doc.getElementById(radio + 'Span');

				var list = doc.createElement('ul');
				list.className = 'ft-pop';
				list.setAttribute('style', 'margin-top:-1px;');

				let [status] = radioXML.getElementsByTagName('status');

				if (status.textContent === 'online') {
					let item = doc.createElement('li');
					let h2 = doc.createElement('h2');
					let [iconOnline] = radioXML.getElementsByTagName('iconOnline');
					h2.textContent = iconOnline.getAttribute('value');
					item.appendChild(h2);
					list.appendChild(item);

					{
						let item = doc.createElement('li');
						let [song] = radioXML.getElementsByTagName('song');
						item.textContent = song.getAttribute('value');
						item.appendChild(doc.createElement('br'));
						item.appendChild(doc.createTextNode(song.textContent));
						list.appendChild(item);
					}

					let streams = radioXML.getElementsByTagName('stream');
					for (let j = 0; j < streams.length; ++j) {
						let item = doc.createElement('li');
						let link = doc.createElement('a');
						link.href = Foxtrick.util.sanitize.parseUrl(streams[j].textContent);
						link.target = '_blank';
						link.rel = 'noopener';
						link.textContent = streams[j].getAttribute('value');
						item.appendChild(link);
						list.appendChild(item);
					}

					let iconurl = Foxtrick.util.sanitize.parseUrl(iconOnline.textContent);
					let img1 = doc.getElementById(radio + 'Icon');

					let style = `background-image:url('${iconurl}');`;
					style += 'margin-left:2px;background-repeat:no-repeat;';
					img1.setAttribute('style', style);
					Foxtrick.Prefs.setString(radio + 'CurrentIcon', iconurl);
				}
				else {
					let item = doc.createElement('li');
					let h2 = doc.createElement('h2');
					let [iconOffline] = radioXML.getElementsByTagName('iconOffline');
					h2.textContent = iconOffline.getAttribute('value');
					item.appendChild(h2);
					list.appendChild(item);

					let iconurl = Foxtrick.util.sanitize.parseUrl(iconOffline.textContent);
					let img1 = doc.getElementById(radio + 'Icon');
					let style = `background-image:url('${iconurl}');`;
					style += 'margin-left:2px;background-repeat:no-repeat;';
					img1.setAttribute('style', style);
					Foxtrick.Prefs.setString(radio + 'CurrentIcon', iconurl);
				}

				let websites = radioXML.getElementsByTagName('website');
				for (let j = 0; j < websites.length; ++j) {
					let item = doc.createElement('li');
					let link = doc.createElement('a');
					link.href = Foxtrick.util.sanitize.parseUrl(websites[j].textContent);
					link.target = '_blank';
					link.rel = 'noopener';
					link.textContent = websites[j].getAttribute('value');
					item.appendChild(link);
					list.appendChild(item);
				}
				span.appendChild(list);
			});
		};

		var shortcuts = doc.getElementById('shortcuts') ||
			doc.getElementById('shortcutsNoSupporter');
		if (!shortcuts)
			return;

		var targetNode = shortcuts.querySelector('div.scContainer, div.scContainerNoSupporter');
		if (!targetNode)
			return;

		for (let [name, link] of Object.entries(module.LINKS)) {
			if (!Foxtrick.Prefs.isModuleOptionEnabled('ExtraShortcuts', name))
				continue;

			let anchor = doc.createElement('a');
			anchor.className = 'ft_extra-shortcuts';
			anchor.href = link.link;

			let img1 = doc.createElement('img');
			img1.setAttribute('class', link.imgClass);
			img1.src = '/Img/Icons/transparent.gif';
			img1.title = Foxtrick.L10n.getString('ExtraShortcuts.' + link.property);
			img1.alt = Foxtrick.L10n.getString('ExtraShortcuts.' + link.property);
			img1 = Foxtrick.makeFeaturedElement(img1, module);

			anchor.appendChild(img1);
			if (Foxtrick.Prefs.isModuleOptionEnabled('ExtraShortcuts', 'AddLeft'))
				targetNode.insertBefore(anchor, targetNode.firstChild);
			else if (targetNode.lastChild.nodeName == 'BR')
				targetNode.insertBefore(anchor, targetNode.lastChild);
			else
				targetNode.appendChild(anchor);
		}

		if (Foxtrick.Prefs.isModuleOptionEnabled('ExtraShortcuts', 'FoxTrickPrefs')) {
			let link = doc.createElement('a');
			link.className = 'ft_extra-shortcuts ft-link';
			Foxtrick.onClick(link, () => Foxtrick.Prefs.show('#tab=on_page'));
			let img1 = doc.createElement('img');
			img1.setAttribute('class', 'ftSCFtPrefs');
			img1.src = '/Img/Icons/transparent.gif';
			img1.title = Foxtrick.L10n.getString('ExtraShortcuts.ftprefs');
			img1.alt = Foxtrick.L10n.getString('ExtraShortcuts.ftprefs');
			img1 = Foxtrick.makeFeaturedElement(img1, module);

			link.appendChild(img1);
			if (Foxtrick.Prefs.isModuleOptionEnabled('ExtraShortcuts', 'AddLeft'))
				targetNode.insertBefore(link, targetNode.firstChild);
			else if (targetNode.lastChild.nodeName == 'BR')
				targetNode.insertBefore(link, targetNode.lastChild);
			else
				targetNode.appendChild(link);
		}

		for (let [i, radio] of module.RADIOS.entries()) {
			if (!Foxtrick.Prefs.isModuleOptionEnabled('ExtraShortcuts', radio))
				continue;

			let link = Foxtrick.createFeaturedElement(doc, module, 'a');
			link.className = 'ft_extra-shortcuts';

			// link.target='_blank';
			link.id = radio + 'Id';
			let img1 = doc.createElement('img');
			img1.setAttribute('class', 'ftSCRadio');
			img1.src = '/Img/Icons/transparent.gif';
			img1.id = radio + 'Icon';
			let curIcon = Foxtrick.Prefs.getString(radio + 'CurrentIcon');
			if (curIcon != null) {
				let style = `margin-left:2px;background-image:url('${curIcon}')`;
				img1.setAttribute('style', style);
			}
			link.appendChild(img1);

			let span = doc.createElement('div');
			span.className = 'ft-pop-up-container';
			span.id = radio + 'Span';
			span.appendChild(link);

			if (Foxtrick.Prefs.isModuleOptionEnabled('ExtraShortcuts', 'AddLeft'))
				targetNode.insertBefore(span, targetNode.firstChild);
			else if (targetNode.lastChild.nodeName == 'BR')
				targetNode.insertBefore(span, targetNode.lastChild);
			else
				targetNode.appendChild(span);

			checkRadio(module.RADIO_URLS[i], radio);
		}
	},
};
