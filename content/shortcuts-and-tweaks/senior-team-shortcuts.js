/**
 * seniorshortcuts.js
 * Foxtrick add coach and lastlineup links to team pages
 * @author convinced, LA-MJ
 */

'use strict';

Foxtrick.modules['SeniorTeamShortCuts'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['teamPageAny', 'series', 'youthSeries', 'tournamentsGeneric'],
	RADIO_OPTIONS: ['OnlyOtherPages', 'AllPages'],

	/* eslint-disable complexity */
	run: function(doc) {
		var ownTeamId = Foxtrick.util.id.getOwnTeamId();

		var boxLeft = doc.getElementsByClassName('subMenu')[0];
		if (!boxLeft)
			return;

		var teamId = Foxtrick.util.id.findTeamId(boxLeft);
		if (!teamId || teamId == ownTeamId &&
		    Foxtrick.Prefs.getInt('module.' + this.MODULE_NAME + '.value') === 0)
			return;

		var pos1 = -1;
		var pos2 = -1;
		var blHeaders = [...boxLeft.querySelectorAll('li')];
		var blLinks = [...boxLeft.querySelectorAll('a')];
		for (let [idx, blLink] of blLinks.entries()) {
			if (pos1 == -1) {
				if (/\/Club\/(Players\/\?TeamID|NationalTeam\/NTPlayers)/i.test(blLink.href))
					pos1 = idx;
			}
			if (pos2 == -1 && /\/Club\/Matches\/\?TeamID/i.test(blLink.href))
				pos2 = idx;
		}

		if (pos1 == -1) {
			// not a team leftbox
			return;
		}

		// last lineup
		var li = Foxtrick.createFeaturedElement(doc, this, 'li');
		var lastmatchlink = doc.createElement('a');
		lastmatchlink.href = `/Club/Matches/?teamID=${teamId}` +
			'&redir_to_lastlineup=true';
		lastmatchlink.textContent = Foxtrick.L10n.getString('LastLineup');
		lastmatchlink.id = 'foxtrick_content_lastmatch';
		li.appendChild(lastmatchlink);

		if (pos2 > -1)
			Foxtrick.insertAfter(li, blHeaders[pos2]);
		else
			blHeaders[0].parentNode.appendChild(li);

		// NTs no longer have coaches, it seems
		if (Foxtrick.util.id.isNTId(teamId))
			return;

		var li2 = Foxtrick.createFeaturedElement(doc, this, 'li');
		var coachlink = doc.createElement('a');
		coachlink.href = teamId == ownTeamId ?
			`/Club/Specialists/?teamId=${teamId}` :
			`/Club/Players/?TeamID=${teamId}&redir_to_coach=true`;

		coachlink.textContent = Foxtrick.L10n.getString('Coach');
		coachlink.id = 'foxtrick_content_coach';
		li2.appendChild(coachlink);

		if (pos1 > -1)
			Foxtrick.insertAfter(li2, blHeaders[pos1]);
		else
			blHeaders[0].parentNode.appendChild(li2);
	},
};
