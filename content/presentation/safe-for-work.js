'use strict';
/*
 * safe-for-work.js
 * Changes the fav icon and the title text to something safe for work
 * @author CatzHoek
 */

Foxtrick.modules['SafeForWork'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	OUTSIDE_MAINBODY: true,
	PAGES: ['all'],
	NICE: -49,	// right after core, totally ridiculous to call it here but hey!
	OPTION_FUNC: function(doc) {
		var textDiv = doc.createElement('div');

		var desc = doc.createElement('p');
		desc.textContent = Foxtrick.L10n.getString('SafeForWork.icon');
		textDiv.appendChild(desc);

		var textInput = doc.createElement('input');
		textInput.setAttribute('pref', 'module.SafeForWork.icon');
		textDiv.appendChild(textInput);

		var desc2 = doc.createElement('p');
		desc2.textContent = Foxtrick.L10n.getString('SafeForWork.title');
		textDiv.appendChild(desc2);

		var textInput2 = doc.createElement('input');
		textInput2.setAttribute('pref', 'module.SafeForWork.title');
		textDiv.appendChild(textInput2);

		return textDiv;
	},
	run: function(doc) {

		// temp default until the stuff gets finished
		var entry = {
			icon: Foxtrick.Prefs.getString('module.SafeForWork.icon'),
			title: Foxtrick.Prefs.getString('module.SafeForWork.title'),
		};

		var head = doc.getElementsByTagName('head')[0];

		// remove previously used/stock icon
		var removeFavIconLink = function() {
			for (var link of Foxtrick.toArray(head.getElementsByTagName('link'))) {
				if (link.type == 'image/x-icon' && link.rel == 'shortcut icon')
					head.removeChild(link);
			}
		};

		// add a new icon link
		var addFavIconLink = function(doc, icon) {
			var link = doc.createElement('link');
			link.type = 'image/x-icon';
			link.rel = 'shortcut icon';
			link.href = icon;
			head.appendChild(link);
		};

		// set new icon
		var setFavIcon = function(doc, icon) {
			removeFavIconLink();
			addFavIconLink(doc, icon);
		};

		// set new title
		var setTitle = function(doc, title) {
			doc.title = title.replace('%s', doc.title);
		};

		// Nike! I mean, just do it!
		setTitle(doc, entry.title);
		setFavIcon(doc, entry.icon);
	},
};
