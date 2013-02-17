'use strict';
/* country.js
 * Utilities on country page
 * @author ryanli
 */

Foxtrick.Pages.Country = {
	getId: function(doc) {
		try {
			// should fetch from h2 header because changing country from
			// select box would not change the URL
			var mainWrapper = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
			var h2 = mainWrapper.getElementsByTagName('h2')[0];
			var countryLink = h2.getElementsByTagName('a')[0];
			var matched = countryLink.href.match(/LeagueID=(\d+)/);
			if (matched)
				return Number(matched[1]);
			else
				throw 'Cannot find ID from: ' + countryLink.href;
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	}
};
