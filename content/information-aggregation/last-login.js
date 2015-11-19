'use strict';
/**
 * LastLogin Modifies last login time with HT Dateformat
 * @author spambot
 */

Foxtrick.modules['LastLogin'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['managerPage'],

	change: function(doc) {
		var div = doc.getElementById('pnlLogin');
		if (!div || div.hasAttribute('processed')) {
			// if the last login div isn't present or has been processed,
			// return.
			return;
		}
		var httime = doc.getElementById('time').textContent;
		var HT_date = Foxtrick.util.time.getDateFromText(httime);
		if (!HT_date) return;

		var login_elm = div.childNodes;
		for (var i = 0; i < login_elm.length; i++) {
			if (login_elm[i].nodeType != Foxtrick.NodeTypes.TEXT_NODE)
				continue;
			var elm = login_elm[i].textContent;
			if (elm.search(/\*\*\*\.\*\*\*/) != -1) {
				var last = doc.createElement('span');
				var ST_date = Foxtrick.util.time.getDateFromText(elm);

				var _s = Math.floor((HT_date.getTime() - ST_date.getTime()) / 1000); // sec
				var diffEl = Foxtrick.util.time.timeDiffToSpan(doc, _s, { useSWD: true });
				var DiffText = diffEl.textContent;
				if (DiffText.search('NaN') == -1) {
					last.textContent = '(' + DiffText + ')';
					last.className = 'date smallText ft-last-login-diff nowrap';
				}
				else
					Foxtrick.log('Could not create timediff (NaN)');
				if (i !== login_elm.length - 1) {
					div.insertBefore(last, login_elm[i].nextSibling);
				}
				else
					div.appendChild(last);
			}

		}
		div.setAttribute('processed', 'processed');
	}
};
