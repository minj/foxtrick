/**
 * LastLogin Modifies last login time with HT Dateformat
 * @author spambot
 */

FoxtrickLastLogin = {
	MODULE_NAME : "LastLogin",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('managerPage'),
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Prettier layout for pages with faces disabled.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	change : function(page, doc) {
		// FIXME - what does this mean? (cvd: i guess no lastlogins on guestbookpage)
		if (doc.getElementById('ctl00_ctl00_CPContent_CPMain_upGB') != null) return;
		FoxtrickLastLogin._Show(doc);
	},

	_Show : function(doc) {
		var div = doc.getElementById("pnlLogin");
		if (!div || div.hasAttribute("processed")) {
			// if the last login div isn't present or has been processed,
			// return.
			return;
		}
		var httime = doc.getElementById("time").textContent;
		var HT_date = Foxtrick.util.time.getDateFromText(httime);
		if (!HT_date) return;

		var login_elm = div.innerHTML.split('<br>');
		var newInner = "";
		for (var i=0; i<login_elm.length;i++){
			login_elm[i] = Foxtrick.trim(login_elm[i]);
			var last = '';
			if (login_elm[i].search(/\*\*\*\.\*\*\*/) != -1) {
				var ST_date = Foxtrick.util.time.getDateFromText(login_elm[i]);

				var _s = Math.floor((HT_date.getTime() - ST_date.getTime()) / 1000); //Sec
				var DiffText = Foxtrick.util.time.timeDifferenceToText(_s);
				if (DiffText.search("NaN") == -1)
					last += '<span class="date smallText ft-last-login-diff">(' + DiffText + ')</span>';
				else Foxtrick.dump('Could not create timediff (NaN)\n');
			}
			newInner += login_elm[i] + last;
			if (i !== login_elm.length - 1) {
				// if not last row, add a break
				newInner += "<br/>\n";
			}
		}
		div.innerHTML = newInner;
		div.setAttribute("processed", "processed");
	}
};
