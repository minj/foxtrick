'use strict';
/**
 * seniorshortcuts.js
 * Foxtrick add coach and lastlineup links to team pages
 * @author convinced
 */

Foxtrick.modules['SeniorTeamShortCuts'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['teamPageGeneral', 'series', 'youthSeries', 'tournamentsGeneral'],
	RADIO_OPTIONS: ['OnlyOtherPages', 'AllPages'],

	run: function(doc) {
		var ownteamid = Foxtrick.util.id.getOwnTeamId();

		var boxleft = doc.getElementsByClassName('subMenu')[0];
		if (boxleft == null) {return;}
		var teamid = Foxtrick.util.id.findTeamId(boxleft);
		if (teamid == ownteamid && Foxtrick.Prefs.getInt('module.' +
		    this.MODULE_NAME + '.value') == 0)
			return;

		var pos1 = -1; var pos2 = -1;
		var bl_header = boxleft.getElementsByTagName('li');
		var bllink = boxleft.getElementsByTagName('a');
		for (var j = 0; j < bllink.length; j++) {
			if (pos1 == -1 && bllink[j].href.search(/\/Club\/Players\/\?TeamID/i) > 0)
				pos1 = j;
			if (pos1 == -1 && bllink[j].href.search(/\/Club\/NationalTeam\/NTPlayers/i) > 0)
				pos1 = j;
			if (pos2 == -1 && bllink[j].href.search(/\/Club\/Matches\/\?TeamID/i) > 0)
				pos2 = j;
		}
		if (pos1 == -1) return; // not a team leftbox
	// last lineup
		var li = Foxtrick.createFeaturedElement(doc, this, 'li');
		var lastmatchlink = doc.createElement('a');
		lastmatchlink.setAttribute('href', '/Club/Matches/MatchLineup.aspx?MatchID=&TeamID='
		                           + teamid + '&useArchive=True&redir_to_newlineup=true');
		lastmatchlink.appendChild(doc.createTextNode(Foxtrick.L10n.getString('LastLineup')));
		var ownlastmatchlinkId = 'foxtrick_content_lastmatch';
		lastmatchlink.setAttribute('id', ownlastmatchlinkId);
		li.appendChild(lastmatchlink);

		if (pos2 != -1) bl_header[pos2].parentNode.insertBefore(li, bl_header[pos2].nextSibling);
		else bl_header[0].parentNode.appendChild(li);

		// coach make link
		var li2 = Foxtrick.createFeaturedElement(doc, this, 'li');
		var coachlink = doc.createElement('a');
		if (teamid < 3000 || teamid >= 5000) { // normal teams
			if (teamid != ownteamid)
				coachlink.setAttribute('href', '/Club/Players/?TeamID=' + teamid +
				                       '&redir_to_coach=true');
			else
				coachlink.setAttribute('href', '/Club/Training/?redir_to_coach=true');
		}
		else {   // nt teams
			if (doc.location.href.search(/\/Club\/NationalTeam\/NationalTeam/i) != -1) {
				var ntinfo = doc.getElementById('teamInfo');
				var CoachId = Foxtrick.util.id.findPlayerId(ntinfo);
				coachlink.setAttribute('href', '/Club/Players/Player.aspx?playerId=' + CoachId);
			}
			else
				coachlink.setAttribute('href', '/Club/NationalTeam/NationalTeam.aspx?teamId=' +
				                       teamid + '&redir_to_coach=true');
		}
		coachlink.appendChild(doc.createTextNode(Foxtrick.L10n.getString('Coach')));
		var owncoachlinkId = 'foxtrick_content_coach';
		coachlink.setAttribute('id', owncoachlinkId);
		li2.appendChild(coachlink);
		if (pos1 != -1) bl_header[pos1].parentNode.insertBefore(li2, bl_header[pos1].nextSibling);
		else bl_header[0].parentNode.appendChild(li2);
	}
};
