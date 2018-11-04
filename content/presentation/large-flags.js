/**
 * large-flags.js
 * Script which replaces the tiny country flag on player pages with a large one
 * @author larsw84, LA-MJ
 */

'use strict';

Foxtrick.modules['LargeFlags'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['playerDetails'],

	run: function(doc) {
		let faceCard = Foxtrick.getMBElement(doc, 'ucPlayerFace_pnlAvatar');
		if (!faceCard) {
			// if player faces aren't shown, remain with tiny flags
			// since large flags breaks page layout
			return;
		}

		let flag = doc.querySelector('.flag');
		if (!flag) {
			// promoted/sold players have no flag
			// seems HTs are not going to fix it
			return;
		}

		const URL = Foxtrick.ResourcePath + 'resources/img/largeflags.png';
		const FLAG_COUNT = 149;
		const RATIO = 1.5;
		const MARGIN = 5;
		const NATIVE_SIZE = 105;

		const HT_SIZE = 20;
		const SIZES = {
			old: NATIVE_SIZE,
			new: 93,
		};

		let { isNewDesign } = Foxtrick.Pages.Player.getInfoTable(doc);
		let size = SIZES[isNewDesign ? 'new' : 'old'];

		let img = flag.querySelector('img');
		let oldStyle = img.style.background;
		let pos = oldStyle.match(/(\d+)px/)[1];
		let newPos = -parseInt(pos, 10) / HT_SIZE * size;

		let newStyle = `transparent url(${URL}) no-repeat scroll ${newPos}px 0`;
		img.style.background = newStyle;
		img.style.backgroundSize = `${FLAG_COUNT * 100}% 100%`;
		img.style.width = `${size}px`;
		img.style.height = `${size / RATIO}px`;

		// Move the link to the faceCard div
		let parentNode = faceCard.parentNode;
		let targetBefore = faceCard.nextSibling;

		let ownDiv = doc.createElement('div');
		ownDiv.style.width = `${size + MARGIN}px`;
		ownDiv.style.margin = `${MARGIN}px ${MARGIN}px 0px 0px`;
		ownDiv.appendChild(flag);

		let wrapperDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
		wrapperDiv.appendChild(ownDiv);
		wrapperDiv.appendChild(faceCard);
		wrapperDiv.style.cssFloat = 'left';
		parentNode.insertBefore(wrapperDiv, targetBefore);
	},
};
