'use strict';
/**
 * matches.js
 * utilities on matches page
 * @author CatzHoek
 */
////////////////////////////////////////////////////////////////////////////////

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.Matches = {};

/**
 * Test whether it's a youth matches page
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.Matches.isYouth = function(doc) {
	return /YouthTeamId=/i.test(doc.location.search);
};

/**
 * Test whether it's an NT matches page
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.Matches.isNT = function(doc) {
	var teamId = Foxtrick.Pages.All.getTeamId(doc);
	return teamId >= 3000 && teamId < 4000;
};
/**
 * Possible match icon classes
 * @type {array}
 */
Foxtrick.Pages.Matches.Types = [
	'matchLeague',
	'matchQualification',
	'matchCupA',
	'matchCupB1',
	'matchCupB2',
	'matchCupB3',
	'matchCupC',
	'matchFriendly',
	'matchMasters',
	'matchTournament',
	'matchTournamentLadder',
	'matchSingleMatch',
	'matchNewbie',
];
