/**
 * move-player-statement.js
 * Move player statement to face
 * @author smates, LA-MJ
 */

'use strict';

Foxtrick.modules['MovePlayerStatement'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['playerDetails', 'youthPlayerDetails'],
	OPTIONS: ['DeleteInstead'],

	run: function(doc) {
		let mainBody = doc.querySelector('#mainBody');
		if (!mainBody)
			return;

		let statement = mainBody.querySelector('p.shy, em.shy');
		if (!statement)
			return;

		let contentSpeak = statement.textContent.trim();
		statement.remove();

		if (Foxtrick.Prefs.isModuleOptionEnabled(this, 'DeleteInstead') || !contentSpeak)
			return;

		let avatar = doc.querySelector('.faceCard, .faceCardNoBottomInfo');
		if (!avatar)
			return;

		let isNew = Foxtrick.hasClass(avatar, 'faceCardNoBottomInfo');

		Foxtrick.addImage(doc, avatar, {
			src: Foxtrick.InternalPath + 'resources/img/speak.png',
			title: contentSpeak + '',
			style: isNew ? 'left: 6px; top: 130px;' : 'left: 65px; top: 134px;',
		});
	},
};
