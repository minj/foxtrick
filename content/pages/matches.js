'use strict';
/**
 * matches.js
 * utilities on matches page
 * @author CatzHoek
 */
////////////////////////////////////////////////////////////////////////////////

Foxtrick.Pages.Matches = {
	isYouthMatchesPage: function(doc) {
		return (doc.location.search.search(/YouthTeamId=/i) > -1);
	},
	isNtMatchesPage: function(doc) {
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		return (teamId >= 3000 && teamId < 4000);
	}
};
