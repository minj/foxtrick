/**
 * copy-button.js
 * Utilities for adding a button for copying
 * @author ryanli
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.copyButton = {};

/**
 * Adds a button on the HTML document
 *
 * @param  {document} doc
 * @param  {string} text
 * @return {HTMLAnchorElement} HTML node of the button
 */
Foxtrick.util.copyButton.add = function(doc, text) {
	var link, img;
	if (Foxtrick.Prefs.getBool('smallcopyicons')) {
		// try to get order of the button in the header
		// icons: contains a list of icons which is a list of classes
		// that can occupy the header
		// so, take first unoccupied by us or any HT icon
		const ICONS = [
			'ci_first', 'ci_second', 'ci_third', 'ci_fourth', 'ci_fifth', 'ci_sixth', 'ci_seventh',
			'bookmark', 'backIcon', 'statsIcon', 'alltidIcon', 'forumSettings', 'forumSearch',
			'forumStats', 'forumSearch2', 'searchSimilarPlayers', 'copyToClipboard',
		];

		let mainBody = doc.getElementById('mainBody');
		let takenCount = Foxtrick.count(function(n) {
			return mainBody.getElementsByClassName(n).length > 0;
		}, ICONS);
		let orderClass = ICONS[takenCount];

		link = doc.createElement('a');
		link.className = `inner copyicon ${orderClass}`;
		link.title = text;

		img = doc.createElement('img');
		img.alt = text;
		img.src = '/Img/Icons/transparent.gif';

		link.appendChild(img);
		mainBody.insertBefore(link, mainBody.firstChild);
	}
	else {
		link = doc.createElement('a');
		link.title = text;

		if (Foxtrick.util.layout.isStandard(doc)) {
			link.className = 'inner copyicon';
			img = doc.createElement('img');
			img.src = '/Img/Icons/transparent.gif';
			img.className = 'actionIcon';
			img.alt = text;
			link.appendChild(img);
		}
		else {
			link.className = 'ft-link';
			link.textContent = text;
		}

		let actions = Foxtrick.L10n.getString('sidebarBox.actions');
		Foxtrick.addBoxToSidebar(doc, actions, link, -1);
	}
	return link;
};
