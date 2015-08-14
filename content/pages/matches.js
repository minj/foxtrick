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
Foxtrick.Pages.Matches.IconTypes = [
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

Foxtrick.Pages.Matches.TypeIds = {
	1: 'League match',
	2: 'Qualification match',
	3: 'Cup match (standard league match)',
	4: 'Friendly (normal rules)',
	5: 'Friendly (cup rules)',
	6: null,
	7: 'Hattrick Masters',
	8: 'International friendly (normal rules)',
	9: 'Internation friendly (cup rules)',
	10: 'National teams competition match (normal rules)',
	11: 'National teams competition match (cup rules)',
	12: 'National teams friendly',
	50: 'Tournament League match',
	51: 'Tournament Playoff match',
	61: 'Single match',
	62: 'Ladder match',
	80: 'Preparation match',
	100: 'Youth league match',
	101: 'Youth friendly match',
	102: null,
	103: 'Youth friendly match (cup rules)',
	104: null,
	105: 'Youth international friendly match',
	106: 'Youth international friendly match (Cup rules)',
};

Foxtrick.Pages.Matches.IconsByType = {
	1: 'matchLeague',
	2: 'matchQualification',
	3: 'matchCupA',
	4: 'matchFriendly',
	5: 'matchFriendly',
	6: null,
	7: 'matchMasters',
	8: 'matchFriendly',
	9: 'matchFriendly',
	10: 'matchLeague',
	11: 'matchLeague',
	12: 'matchFriendly',
	50: 'matchTournament',
	51: 'matchTournament',
	61: 'matchSingleMatch',
	62: 'matchTournamentLadder',
	80: 'matchNewbie',
	100: 'matchLeague',
	101: 'matchFriendly',
	102: null,
	103: 'matchFriendly',
	104: null,
	105: 'matchFriendly',
	106: 'matchFriendly',
};

/**
 * Get numeric match type ID based on match icon class name
 * @param  {string} iconClass
 * @return {number}
 */
Foxtrick.Pages.Matches.getTypeFromIcon = function(iconClass) {
	var type = null;
	for (var id in this.IconsByType) {
		if (this.IconsByType[id] === iconClass) {
			type = parseInt(id, 10);
			break;
		}
	}
	return type;
};

Foxtrick.Pages.Matches.Official = [1, 2, 3, 7];
Foxtrick.Pages.Matches.Friendly = [4, 5, 8, 9];
Foxtrick.Pages.Matches.NT = [10, 11, 12];
Foxtrick.Pages.Matches.HTO = [50, 51, 61, 62, 80];
Foxtrick.Pages.Matches.Youth = [100, 101, 103, 105, 106];
