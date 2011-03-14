/* country.js
 * Utilities on country page
 * @author ryanli
 */

Foxtrick.Pages.Country = {
	getId : function(doc) {
		var matched = doc.location.href.match(/LeagueID=(\d+)/);
		if (matched)
			return Number(matched[1]);
		else
			return null;
	}
};
