/**
 * LastLogin Modifies last login time with HT Dateformat
 * @author spambot
 */

'use strict';

Foxtrick.modules.LastLogin = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['managerPage'],

	/** @param {document} doc */
	change: function(doc) {
		/** @type {HTMLElement} */
		var div = doc.querySelector('#pnlLogin');
		if (!div || div.dataset.done) {
			// if the last login div isn't present or has been processed,
			// return.
			return;
		}
		var now = Foxtrick.util.time.getDate(doc);
		if (!now) {
			Foxtrick.log('User time missing');
			return;
		}
		const MSECS_IN_SEC = Foxtrick.util.time.MSECS_IN_SEC;

		for (let node of div.childNodes) {
			if (node.nodeType != node.TEXT_NODE)
				continue;

			let text = node.textContent;
			if (!/\*\*\*\.\*\*\*/.test(text))
				continue;

			let last = doc.createElement('span');
			let loginDate = Foxtrick.util.time.getDateFromText(text);
			let secs = Math.floor((now.getTime() - loginDate.getTime()) / MSECS_IN_SEC);
			let diffEl = Foxtrick.util.time.timeDiffToSpan(doc, secs, { useSWD: true });
			let result = diffEl.textContent;
			if (/NaN/.test(result)) {
				Foxtrick.log('Could not create timeDiff (NaN)');
			}
			else {
				last.textContent = `(${result})`;
				last.className = 'date smallText ft-last-login-diff nowrap';
			}

			Foxtrick.insertAfter(last, node);
		}

		div.dataset.done = '1';
	},
};
