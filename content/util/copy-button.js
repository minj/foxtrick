'use strict';
/*
 * copy-button.js
 * Utilities for adding a button for copying
 * @author ryanli
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};
Foxtrick.util.copyButton = {};

/*
 * Adds a button on the HTML document
 * @returns HTML node of the button
 */
Foxtrick.util.copyButton.add = function(doc, text) {
	if (FoxtrickPrefs.getBool('smallcopyicons')) {
		var mainWrapper = doc.getElementsByClassName('main')[0];
		var mainBody = doc.getElementById('mainBody');

		var boxHead = mainWrapper.getElementsByClassName('boxHead')[0];

		if (Foxtrick.util.layout.isStandard(doc))
			mainBody.style.paddingTop = '10px';

		// try to get order of the button in the header
		// icons: contains a list of icons which is a list of classes
		// that can occupy the header
		// so, take first unoccupied by us or any HT icon
		var icons =	[
			'ci_first', 'ci_second', 'ci_third', 'ci_fourth', 'ci_fifth', 'ci_sixth', 'ci_seventh',
			'bookmark', 'backIcon', 'statsIcon', 'alltidIcon', 'forumSettings', 'forumSearch',
			'forumStats', 'forumSearch2'
		];
		var orderClass = icons[
			Foxtrick.count(function(n) {
				return mainBody.getElementsByClassName(n).length > 0;
			}, icons)
		];

		var link = doc.createElement('a');
		link.className = 'inner copyicon ' + orderClass;
		link.title = text;

		var img = doc.createElement('img');
		img.alt = text;
		img.src = '/Img/Icons/transparent.gif';

		link.appendChild(img);
		mainBody.insertBefore(link, mainBody.firstChild);
	}
	else {
		var link = doc.createElement('a');
		link.title = text;

		if (Foxtrick.util.layout.isStandard(doc)) {
			link.className = 'inner copyicon';
			var img = doc.createElement('img');
			img.src = '/Img/Icons/transparent.gif';
			img.className = 'actionIcon';
			img.alt = text;
			link.appendChild(img);
		}
		else {
			link.className = 'ft-link';
			link.textContent = text;
		}

		Foxtrick.addBoxToSidebar(doc,
			Foxtrickl10n.getString('sidebarBox.actions'), link, -1);
	}
	return link;
};
