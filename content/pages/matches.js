'use strict';
/**
 * matches.js
 * utilities on matches page
 * @author CatzHoek
 */
////////////////////////////////////////////////////////////////////////////////

if (!Foxtrick)
	var Foxtrick = this.Foxtrick;
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
 * Get the matches table
 * @param  {document} doc
 * @return {HTMLTableElement}
 */
Foxtrick.Pages.Matches.getTable = function(doc) {
	return doc.querySelector('#mainBody table');
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
