'use strict';
/**
 * FoxtrickSmallerPages.js
 * Reduces the dimension of some pages to adapt to small screens
 * @author taised, ryanli
 */

Foxtrick.modules['SmallerPages'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	NICE: 5,
	// after FoxtrickTransferDeadline and probably also after all other player detail adjustment

	run: function(doc) {
		if (!Foxtrick.util.layout.isSupporter(doc)) {
			// if the advertisement at the right side is blocked,
			// non suppoters will still see a blank space on the right
			// since a fixed width larger than needed is assigned.
			// now we find if the ad is blocked, reduce the width of the
			// container.
			var main = doc.getElementsByClassName('hattrickNoSupporter')[0];
			var adSkyscraper = doc.getElementsByClassName('ad_skyscraper')[0];
			var hasAd = (adSkyscraper.getElementsByTagName('object').length > 0)
				|| (adSkyscraper.getElementsByTagName('iframe').length > 0)
				|| (adSkyscraper.getElementsByTagName('a').length > 0);
			if (!hasAd) {
				if (Foxtrick.util.layout.isStandard(doc)) {
					// for standard theme, reduce to 1001px, which is the width
					// of the div with id 'page', 981px, plus its margin at the
					// left and right, 10px each.
					main.style.width = '1001px';
				}
				else {
					// while for simple theme, it's merely the width of the div
					// with id 'page', which is 981px.
					main.style.width = '981px';
				}
			}
		}
		if (Foxtrick.isPage(doc, 'playerDetails')) {
			if (!doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucPlayerFace_pnlAvatar')) {
				doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlplayerInfo').style.width
					= 'auto';
			}
		}
		else if (Foxtrick.isPage(doc, 'youthOverview')) {
			if (!doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucScoutProposalFace_pnlAvatar')) {
				doc.getElementById('ctl00_ctl00_CPContent_CPMain_UpdatePanel1')
					.getElementsByTagName('div')[0].style.width = 'auto';
			}
		}
	},

	change: function(doc) {
		this.run(doc);
	},
};
