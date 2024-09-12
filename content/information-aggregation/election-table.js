'use strict';
/**
 * election-table.js
 * some more infos on election page
 * @author spambot, ryanli
 */

Foxtrick.modules['ElectionTable'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['election'],

	run: function(doc) {
		var sum = 0;
		var table = doc.getElementsByClassName('previousCandidates')[0];

		if (table) {
			// count up the sum first
			for (var i = 0; i < table.rows.length; ++i) {
				if (table.rows[i].cells[2]) {
					sum += parseInt(table.rows[i].cells[2].textContent.trim(), 10);
				}
			}

			// add percentage for each candidate
			for (var i = 0; i < table.rows.length; i++) {
				if (table.rows[i].cells[2]) {
					var content = parseInt(table.rows[i].cells[2].textContent.trim(), 10);
					var result = '(' + Math.floor(content / sum * 1000) / 10 + '%)';
					table.rows[i].cells[3].textContent += result;
					// keep consistent padding with the cell on the left
					table.rows[i].cells[3].style.padding = '0px';
				}
			}

			// finally, a sum is displayed
			var cnt = Foxtrick.createFeaturedElement(doc, this, 'strong');
			cnt.textContent = 'Σ ' + Foxtrick.formatNumber(sum, '\u00a0');
			cnt.style.paddingTop = '10px';
			table.parentNode.insertBefore(cnt, table.nextSibling);
		}
		else {
			// pre election list

			var list = doc.getElementsByClassName('candidates')[0];

			if (list) {
				var lis = list.getElementsByTagName('li');
				var sum = 0;
				// count up the sum first
				for (var i = 0; i < lis.length; ++i) {
					var imgs = lis[i].getElementsByTagName('img');
					// count only if not withdrawn
					if (imgs.length < 2 || imgs[1].src.search(/withdrawnStamp/i) == -1)
						++sum;
				}

				// display number of candidates
				var h2 = doc.getElementById('mainBody').getElementsByTagName('h2')[0];
				var sum_span = Foxtrick.createFeaturedElement(doc, this, 'span');
				sum_span.textContent = ' - Σ ' + Foxtrick.formatNumber(sum, '\u00a0');
				h2.appendChild(sum_span);
			}
		}
	}
};
