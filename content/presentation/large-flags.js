'use strict';
/**
 * large-flags.js
 * Script which replaces the tiny country flag on player pages with a large one
 * @author larsw84
 */

Foxtrick.modules['LargeFlags'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['playerDetails'],

	run: function(doc) {
		var faceCard = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucPlayerFace_pnlAvatar');
		if (!faceCard) {
			// if player faces aren't shown, remain with tiny flags
			// since large flags breaks page layout
			return;
		}
		var flag = doc.getElementsByClassName('flag')[0];
		var img = flag.getElementsByTagName('img')[0];
		var oldStyle = img.style.background;
		var newStyle = 'transparent url(' + Foxtrick.ResourcePath + 'resources/img/largeflags.png)'
			+ ' no-repeat scroll';
		var pos = oldStyle.match(/(\d+)px/)[1];
		var newPos = -parseInt(pos, 10) / 20 * 105;
		newStyle = newStyle + ' ' + newPos + 'px 0pt';
		img.style.background = newStyle;
		img.style.width = '105px';
		img.style.height = '70px';
		// Move the link to the faceCard div
		var parentNode = faceCard.parentNode;
		var nextSibling = faceCard.nextSibling;
		var ownDiv = doc.createElement('div');
		ownDiv.style.width = '110px';
		ownDiv.style.margin = '5px 5px 0px 0px';
		ownDiv.appendChild(flag);
		var wrapperDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
		wrapperDiv.appendChild(ownDiv);
		wrapperDiv.appendChild(faceCard);
		wrapperDiv.style.cssFloat = 'left';
		parentNode.insertBefore(wrapperDiv, nextSibling);
	}
};
