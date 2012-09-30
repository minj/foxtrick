'use strict';
/**
 * FoxtrickSmallerPages.js
 * Reduces the dimension of some pages to adapt to small screens
 * @author taised, ryanli
 */

Foxtrick.modules['SmallerPages'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	OPTIONS: ['ReduceBid'],
	NICE: 5,
	// after FoxtrickTransferDeadline and probably also after all other player detail adjustment

	TABLE_ID: 'foxtrick-smaller-pages-table',

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
					// with id 'page', which is 765px.
					main.style.width = '765px';
				}
			}
		}
		if (Foxtrick.isPage('playerDetails', doc)) {
			if (!doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucPlayerFace_pnlAvatar')) {
				doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlplayerInfo').style.width
					= 'auto';
			}

			if (FoxtrickPrefs.isModuleOptionEnabled('SmallerPages', 'ReduceBid')) {
				//we move the bid div
				if (doc.getElementById(this.TABLE_ID)) {
					this._move_bid(doc);
				}
				//then adjust it
				this._adjust_bid(doc);
			}
		}
		else if (Foxtrick.isPage('youthOverview', doc)) {
			if (!doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucScoutProposalFace_pnlAvatar')) {
				doc.getElementById('ctl00_ctl00_CPContent_CPMain_UpdatePanel1')
					.getElementsByTagName('div')[0].style.width = 'auto';
			}
		}
	},

	change: function(doc) {
		this.run(doc);
	},

	_move_bid: function(doc) {
		var biddiv = doc.getElementById('ctl00_ctl00_CPContent_CPMain_updBid');
		if (biddiv) {
			try {
				//We move the bid div, i get the skill div
				var skilldiv = biddiv.nextSibling.nextSibling;
				//I get the skilltable and create a new table where to put skilltable and biddiv
				var skilltable = skilldiv.getElementsByTagName('table').item(0);
				var newtable = Foxtrick.createFeaturedElement(doc, this, 'table');
				newtable.id = 'foxtrick-smaller-pages-table';
				skilldiv.appendChild(newtable);
				newtable.insertRow(0);
				newtable.rows[0].insertCell(0);
				newtable.rows[0].insertCell(1);
				newtable.rows[0].cells[0].appendChild(skilltable);
				newtable.rows[0].cells[1].appendChild(biddiv);

				//Now reducing the bid div cutting strings
				var toremove = biddiv.getElementsByTagName('strong');
				for (i = 0; toremove.length; i++) {
					toremove.item(i).parentNode.removeChild(toremove.item(i));
				}
				toremove = biddiv.getElementsByTagName('b');
				for (i = 0; toremove.length; i++) {
					toremove.item(i).parentNode.removeChild(toremove.item(i));
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		}
	},

	_adjust_bid: function(doc) {
		var biddiv = doc.getElementById('ctl00_ctl00_CPContent_CPMain_updBid');
		if (biddiv) {
			try {
				//Now reducing the bid div cutting strings
				var toremove = biddiv.getElementsByTagName('strong');
				for (i = 0; toremove.length; i++) {
					toremove.item(i).parentNode.removeChild(toremove.item(i));
				}
				toremove = biddiv.getElementsByTagName('b');
				for (i = 0; toremove.length; i++) {
					toremove.item(i).parentNode.removeChild(toremove.item(i));
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		}
	}
};
