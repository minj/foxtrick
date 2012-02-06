"use strict";
/**
 * LastLogin Modifies last login time with HT Dateformat
 * @author spambot
 */

Foxtrick.modules["LastLogin"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["managerPage"],

	change : function(doc) {
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
		var brs = div.getElementsByTagName('br');
		for (var i=0; i<login_elm.length; i++) {
			login_elm[i] = Foxtrick.trim(login_elm[i]);
			var last = doc.createElement('span');
			if (login_elm[i].search(/\*\*\*\.\*\*\*/) != -1) {
				var ST_date = Foxtrick.util.time.getDateFromText(login_elm[i]);

				var _s = Math.floor((HT_date.getTime() - ST_date.getTime()) / 1000); //Sec
				var DiffText = Foxtrick.util.time.timeDifferenceToText(_s).replace(/&nbsp;/g,' ');
				if (DiffText.search("NaN") == -1) {
					last.textContent = '(' + DiffText + ')';
					last.className = "date smallText ft-last-login-diff nowrap";
				}
				else 
					Foxtrick.log('Could not create timediff (NaN)');
			}
			if (i !== login_elm.length - 1) {
				div.insertBefore(last, brs[i]);
			}
			else
				div.appendChild(last);
		}
		div.setAttribute("processed", "processed");
	}
};
