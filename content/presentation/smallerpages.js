/**
 * FoxtrickSmallerPages.js
 * Reduces the dimension of some pages to adapt to small screens
 * @author taised, ryanli
 */
////////////////////////////////////////////////////////////////////////////////
FoxtrickSmallerPages = {

	MODULE_NAME : "SmallerPages",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],
	DEFAULT_ENABLED: true,
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Reduce page width for non supporters if advertisement on the right is blocked.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	OPTIONS : new Array("ReduceBid"),

	TABLE_ID : "foxtrick-smaller-pages-table",

	run : function(page, doc) {
		if (doc.getElementById("hattrickNoSupporter")) {
			// if the advertisement at the right side is blocked,
			// non suppoters will still see a blank space on the right
			// since a fixed width larger than needed is assigned.
			// now we find if the ad is blocked, reduce the width of the
			// container.
			var main = doc.getElementById("hattrickNoSupporter");
			var skyscraperAd = doc.getElementById("google_ads_div_HT_Right");
			if (!skyscraperAd) {
				if (Foxtrick.isStandardLayout(doc)) {
					// for standard theme, reduce to 1001px, which is the width
					// of the div with id "page", 981px, plus its margin at the
					// left and right, 10px each.
					main.style.width = "1001px";
				}
				else {
					// while for simple theme, it's merely the width of the div
					// with id "page", which is 765px.
					main.style.width = "765px";
				}
			}
		}
		if (page == "playerdetail") {
			if (!doc.getElementById('ctl00_CPMain_ucPlayerFace_pnlAvatar')) {
				doc.getElementById('ctl00_CPMain_pnlplayerInfo').style.width = "auto";
			}

			if (Foxtrick.isModuleFeatureEnabled(this, "ReduceBid")) {
				//we move the bid div
				if (doc.getElementById(this.TABLE_ID)) {
					this._move_bid( doc );
				}
				//then adjust it
				this._adjust_bid( doc );
			}
		}
		else if (page == "youthoverview") {
			if (!doc.getElementById('ctl00_CPMain_ucScoutProposalFace_pnlAvatar')) {
				doc.getElementById('ctl00_CPMain_UpdatePanel1').getElementsByTagName('div')[0].style.width = "auto";
			}
		}
	},

	change : function(page, doc) {
		this.run(page, doc);
	},

	_move_bid : function(doc) {
		var biddiv = doc.getElementById('ctl00_CPMain_updBid');
		if (biddiv) {
			try {
				//We move the bid div, i get the skill div
				var skilldiv=biddiv.nextSibling.nextSibling;
				//I get the skilltable and create a new table where to put skilltable and biddiv
				var skilltable=skilldiv.getElementsByTagName('table').item(0);
				var newtable=doc.createElement('table');
				newtable.id = "foxtrick-smaller-pages-table";
				skilldiv.appendChild(newtable);
				newtable.insertRow(0);
				newtable.rows[0].insertCell(0);
				newtable.rows[0].insertCell(1);
				newtable.rows[0].cells[0].appendChild(skilltable);
				newtable.rows[0].cells[1].appendChild(biddiv);

				//Now reducing the bid div cutting strings
				var toremove=biddiv.getElementsByTagName('strong');
				for (i=0;toremove.length;i++) {
					toremove.item(i).parentNode.removeChild(toremove.item(i));
				}
				toremove=biddiv.getElementsByTagName('b');
				for (i=0;toremove.length;i++) {
					toremove.item(i).parentNode.removeChild(toremove.item(i));
				}
			}
			catch (e) {
				Foxtrick.dumpError(e);
			}
		}
	},

	_adjust_bid : function (doc) {
		var biddiv = doc.getElementById('ctl00_CPMain_updBid');
		if (biddiv) {
			try {
				//Now reducing the bid div cutting strings
				var toremove=biddiv.getElementsByTagName('strong');
				for (i=0;toremove.length;i++) {
					toremove.item(i).parentNode.removeChild(toremove.item(i));
				}
				toremove=biddiv.getElementsByTagName('b');
				for (i=0;toremove.length;i++) {
					toremove.item(i).parentNode.removeChild(toremove.item(i));
				}
				//Now removing text before numbers
				toremove=biddiv.getElementsByTagName('p');
				//for (i=0;toremove.length;i++) {
					//removing all non digit characters NOT WORKING
					//toremove[i].innerHTML=toremove[i].innerHTML.replace(/&nbsp;/g,"").replace(/[a-z]/g, "").replace(/[A-Z]/g, "");
					//Analyzing character per character
				//}
			}
			catch (e) {
				Foxtrick.dumpError(e);
			}
		}
	}
};
