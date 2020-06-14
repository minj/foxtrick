/**
 * forum-mod-popup.js
 * @author CatzHoek
 */

'use strict';

Foxtrick.modules['ForumModeratorPopup'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread'],
	CSS: Foxtrick.InternalPath + 'resources/css/forum-mod-popup.css',

	/**
	 * @param {document} doc
	 */
	run: function(doc) {
		var modOption = doc.getElementById('cfModFunctions');
		if (!modOption)
			return;

		var content = doc.getElementById('mainWrapper');
		var header = content.querySelector('.boxHead');

		var popupDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(popupDiv, 'ft-pop-up-container');
		Foxtrick.addClass(popupDiv, 'ft-moderator-popup');
		Foxtrick.addClass(popupDiv, 'ft-moderator-popup-align');

		let lnk = doc.createTextNode(Foxtrick.L10n.getString('ForumModeratorPopup.toModerate'));
		popupDiv.appendChild(lnk);
		header.appendChild(popupDiv);

		let clear = doc.createElement('div');
		Foxtrick.addClass(clear, 'ft-clear-both');
		header.parentNode.insertBefore(clear, doc.getElementById('mainBody'));

		let ul = doc.createElement('ul');
		Foxtrick.addClass(ul, 'ft-pop right');
		let links = modOption.querySelectorAll('a');
		for (let link of links) {
			if (link.href.indexOf('actionTypeFunctions') > -1) {
				// eslint-disable-next-line no-unused-vars
				let actionTypeFunctions = // lgtm[js/unused-local-variable]
					Foxtrick.getUrlParam(link.href, 'actionTypeFunctions');
				let li = doc.createElement('li');
				let clone = Foxtrick.cloneElement(link, true);
				li.appendChild(clone);
				ul.appendChild(li);

			}
			else if (link.href.indexOf('actionTypeWrite') > -1) {
				// eslint-disable-next-line no-unused-vars
				let actionTypeWrite = // lgtm[js/unused-local-variable]
					Foxtrick.getUrlParam(link.href, 'actionTypeWrite');
				let li = doc.createElement('li');
				let clone = Foxtrick.cloneElement(link, true);
				li.appendChild(clone);
				ul.appendChild(li);
			}
		}
		popupDiv.appendChild(ul);
	},
};
