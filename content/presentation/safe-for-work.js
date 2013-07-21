'use strict';
/*
 * safe-for-work.js
 * Changes the fav icon and the title text to something safe for work
 * @author CatzHoek
 */

Foxtrick.modules['SafeForWork'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	NICE: -49,	//right after core, totally ridiculous to call it here but hey!
	OPTION_FUNC: function(doc) {
			var textDiv = doc.createElement('div');

				var desc = doc.createElement('p');
				desc.textContent = Foxtrickl10n.getString('SafeForWork.icon');
				textDiv.appendChild(desc);

				var textInput = doc.createElement('input');
				textInput.setAttribute('pref', 'module.SafeForWork.icon');
				textDiv.appendChild(textInput);

				var desc2 = doc.createElement('p');
				desc2.textContent = Foxtrickl10n.getString('SafeForWork.title');
				textDiv.appendChild(desc2);

				var textInput2 = doc.createElement('input');
				textInput2.setAttribute('pref', 'module.SafeForWork.title');
				textDiv.appendChild(textInput2);

				return textDiv;
	},
	run: function(doc) {

		//temp default until the stuff gets finished
		var entry = {
			icon: FoxtrickPrefs.getString('module.SafeForWork.icon'),
			title: FoxtrickPrefs.getString('module.SafeForWork.title')
		};

		var head = doc.getElementsByTagName('head')[0];

		//for removing previously used/stock icon
		var removeFavIconLink = function(doc) {
			var links = head.getElementsByTagName('link');
				for (var i = 0; i < links.length; i++) {
					var link = links[i];
					if (link.type == 'image/x-icon' && link.rel == 'shortcut icon')
						head.removeChild(link);
			}
		};

		//for adding a new icon link
		var addFavIconLink = function(doc, icon) {
			var link = doc.createElement('link');
			link.type = 'image/x-icon';
			link.rel = 'shortcut icon';
			link.href = icon;
			head.appendChild(link);
		};

		//set new icon
		var setFavIcon = function(doc, icon) {
			removeFavIconLink(doc);
			addFavIconLink(doc, icon);
		};
		//set new title
		var setTitle = function(doc, title) {
			doc.title = title;
		};

		//Nike! I mean, just do it!
		setTitle(doc, entry.title);
		setFavIcon(doc, entry.icon);
	}
};
