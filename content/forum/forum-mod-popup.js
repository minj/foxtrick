'use strict';
/**
 * forum-mod-popup.js
 * @author CatzHoek
 */

Foxtrick.modules['ForumModeratorPopup'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread'],
	CSS: Foxtrick.InternalPath + 'resources/css/forum-mod-popup.css',

	run: function(doc) {
		var modoption = doc.getElementById('cfModFunctions');
		if (modoption) {
			var content = doc.getElementById('mainWrapper');
			var header = content.getElementsByClassName('boxHead')[0];
			var popupdiv = Foxtrick.createFeaturedElement(doc, this, 'div');
			Foxtrick.addClass(popupdiv, 'ft-pop-up-container');
			Foxtrick.addClass(popupdiv, 'ft-moderator-popup');
			Foxtrick.addClass(popupdiv, 'ft-moderator-popup-align');
			var lnk = doc.createTextNode(Foxtrick.L10n.getString('ForumModeratorPopup.toModerate'));
			popupdiv.appendChild(lnk);
			header.appendChild(popupdiv);

			var clear = doc.createElement('div');
			Foxtrick.addClass(clear, 'ft-clear-both');
			header.parentNode.insertBefore(clear, doc.getElementById('mainBody'));


			var ul = doc.createElement('ul');
			Foxtrick.addClass(ul, 'ft-pop right');
			var links = modoption.getElementsByTagName('a');
			for (var l = 0; l < links.length; l++) {
				if (links[l].href.search('actionTypeFunctions') > -1) {
					var actionTypeFunctions = Foxtrick.getParameterFromUrl(links[l].href,
					                                                       'actionTypeFunctions');
					var li = doc.createElement('li');
					var lnk_i = links[l].cloneNode(true);
					li.appendChild(lnk_i);
					ul.appendChild(li);

				} else if (links[l].href.search('actionTypeWrite') > -1) {
					var actionTypeWrite = Foxtrick.getParameterFromUrl(links[l].href,
					                                                   'actionTypeWrite');
					var li = doc.createElement('li');
					var lnk_i = links[l].cloneNode(true);
					li.appendChild(lnk_i);
					ul.appendChild(li);
				}
			}
			popupdiv.appendChild(ul);
		}
	}
};
