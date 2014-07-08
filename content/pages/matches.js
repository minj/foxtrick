'use strict';
/**
 * matches.js
 * utilities on matches page
 * @author CatzHoek
 */
////////////////////////////////////////////////////////////////////////////////

Foxtrick.Pages.Matches = {
	/**
	 * Test whether it's a youth matches page
	 * @param  {document}  doc
	 * @return {Boolean}
	 */
	isYouthMatchesPage: function(doc) {
		return /YouthTeamId=/i.test(doc.location.search);
	},

	/**
	 * Test whether it's an NT matches page
	 * @param  {document}  doc
	 * @return {Boolean}
	 */
	isNtMatchesPage: function(doc) {
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		return teamId >= 3000 && teamId < 4000;
	}
};
