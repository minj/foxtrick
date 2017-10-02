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
		if (!div || div.dataset.done) {
			// if the last login div isn't present or has been processed,
			// return.
			return;
		}
		var now = Foxtrick.util.time.getDate(doc);
		if (!now)
			return;

		Foxtrick.forEach(function(el) {
			if (el.nodeType != Foxtrick.NodeTypes.TEXT_NODE)
				return;

			var text = el.textContent;
			if (/\*\*\*\.\*\*\*/.test(text)) {
				var last = doc.createElement('span');
				var loginDate = Foxtrick.util.time.getDateFromText(text);
				var secs = Math.floor((now.getTime() - loginDate.getTime()) / 1000); // sec
				var diffEl = Foxtrick.util.time.timeDiffToSpan(doc, secs, { useSWD: true });
				var result = diffEl.textContent;
				if (!/NaN/.test(result)) {
					last.textContent = '(' + result + ')';
					last.className = 'date smallText ft-last-login-diff nowrap';
				}
				else
					Foxtrick.log('Could not create timeDiff (NaN)');

				Foxtrick.insertAfter(last, el);
			}
		}, div.childNodes);

		div.dataset.done = 1;
	},
};
