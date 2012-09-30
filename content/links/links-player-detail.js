'use strict';
/**
 * linksplayer.js
 * Foxtrick add links to team pages
 * @author convinced
 */

Foxtrick.modules['LinksPlayerDetail'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['playerDetails'],
	OPTION_FUNC: function(doc, callback) {
		return Foxtrick.modules['Links']
			.getOptionsHtml(doc, 'LinksPlayerDetail', ['playerhealinglink', 'playerlink',
			                'keeperlink', 'transfercomparelink'], callback);
	},

	run: function(doc) {
		var module = this;
		Foxtrick.modules.Links.getCollection(function(collection) {
			module._run(doc);
		});
	},

	_run: function(doc) {
		//addExternalLinksToPlayerDetail
		var playerInfo = doc.getElementsByClassName('playerInfo')[0];
		var infoTable = playerInfo.getElementsByTagName('table')[0];
		var mainBox = doc.getElementsByClassName('mainBox')[0];
		var skillTable = mainBox ? mainBox.getElementsByTagName('table')[0] : null;

		var owncountryid = Foxtrick.util.id.getOwnLeagueId();

		var deadlineDate = Foxtrick.Pages.Player.getTransferDeadline(doc);
		var deadline = '';
		if (deadlineDate !== null) {
			deadline = deadlineDate.getFullYear() + '-'
				+ (deadlineDate.getMonth() + 1) + '-' // getMonth() returns 0-11
				+ deadlineDate.getDate() + ' '
				+ deadlineDate.getHours() + ':'
				+ deadlineDate.getMinutes();
		}

		var teamid = Foxtrick.Pages.All.getTeamId(doc);
		var teamname = Foxtrick.Pages.All.getTeamName(doc);
		var nationality = Foxtrick.Pages.Player.getNationalityId(doc);
		var playerid = Foxtrick.Pages.Player.getId(doc);
		var playername = Foxtrick.Pages.Player.getName(doc);
		var tsi = Foxtrick.Pages.Player.getTsi(doc);

		// age
		var age = Foxtrick.Pages.Player.getAge(doc);
		var years = age.years;
		var days = age.days;

		var basicSkills = Foxtrick.Pages.Player.getBasicSkills(doc);
		var form = basicSkills.form;
		var stamina = basicSkills.stamina;
		var exp = basicSkills.experience;
		var ls = basicSkills.leadership;

		var wageObj = Foxtrick.Pages.Player.getWage(doc);
		var wage = Math.round(wageObj.base * Foxtrick.util.currency.getRate());
		var wagebonus = Math.round(wageObj.bonus * Foxtrick.util.currency.getRate());

		var injuredweeks = Foxtrick.Pages.Player.getInjuryWeeks(doc);
		if (injuredweeks > 0) {
			var ilinks = Foxtrick.modules['Links']
				.getLinks('playerhealinglink', { 'playerid': playerid, 'form': form, 'age': years,
				          'injuredweeks': injuredweeks, 'tsi': tsi }, doc, this);
			for (var i = 0; i < ilinks.length; ++i) {
				ilinks[i].link.className = 'ft-link-injury';
				infoTable.rows[4].cells[1].appendChild(ilinks[i].link);
			}
		}

		var skills = Foxtrick.Pages.Player.getSkills(doc);

		var ownBoxBody = null;
		var added = 0;
		// links
		var params = [];
		var links = new Array(2);
		if (skills) {
			var goalkeeping = skills.keeper;
			var playmaking = skills.playmaking;
			var passing = skills.passing;
			var winger = skills.winger;
			var defending = skills.defending;
			var scoring = skills.scoring;
			var setpieces = skills.setPieces;

			params = {
				'teamid': teamid, 'teamname': teamname, 'playerid': playerid,
				'playername': playername, 'nationality': nationality,
				'tsi': tsi, 'age': years, 'age_days': days, 'form': form, 'exp': exp,
				'leadership': ls, 'stamina': stamina, 'goalkeeping': goalkeeping,
				'playmaking': playmaking, 'passing': passing, 'winger': winger,
				'defending': defending, 'scoring': scoring, 'setpieces': setpieces, 'wage': wage,
				'wagebonus': wagebonus, 'owncountryid': owncountryid, 'deadline': deadline,
				'lang': FoxtrickPrefs.getString('htLanguage')
			};
			links[0] = Foxtrick.modules['Links'].getLinks('playerlink', params, doc, this);
			links[1] = Foxtrick.modules['Links'].getLinks('transfercomparelink', params, doc, this);
			if (goalkeeping > 3 && skillTable) {
				var newtable = (skillTable.rows.length === 7);
				var goalkeeperskillnode = newtable ? skillTable.rows[0].cells[1] :
					skillTable.rows[0].cells[3];
				goalkeeperskillnode = goalkeeperskillnode.getElementsByTagName('a')[0];

				// keeper links
				var klinks = Foxtrick.modules['Links']
					.getLinks('keeperlink', { 'playerid': playerid, 'tsi': tsi,
					          'form': form, 'goalkeeping': goalkeeping, 'age': years,
					          'owncountryid': owncountryid }, doc, this);
				for (var i = 0; i < klinks.length; ++i) {
					klinks[i].link.className = 'ft-link-keeper';
					if (goalkeeperskillnode) {
						goalkeeperskillnode.parentNode.appendChild(klinks[i].link);
					}
				}
			}
		}
		else {
			params = {
				'teamid': teamid, 'playerid': playerid, 'nationality': nationality,
				'tsi': tsi, 'age': years, 'age_days': days, 'form': form, 'exp': exp,
				'leadership': ls, 'stamina': stamina, 'wage': wage, 'wagebonus': wagebonus,
				'owncountryid': owncountryid, 'lang': FoxtrickPrefs.getString('htLanguage')
			};
			links[0] = Foxtrick.modules['Links'].getLinks('playerlink', params, doc, this);
		}
		var num_links = links[0].length;
		if (links[1] != null) {
			num_links += links[1].length;
		}
		ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
		var header = Foxtrickl10n.getString('links.boxheader');
		var ownBoxId = 'ft-links-box';
		var ownBoxBodyId = 'foxtrick_links_content';
		ownBoxBody.id = ownBoxBodyId;
		if (num_links > 0) {

			for (var i = 0; i < links.length; ++i) {
				if (links[i] != null) {
					for (var j = 0; j < links[i].length; ++j) {
						links[i][j].link.className = 'inner';
						ownBoxBody.appendChild(links[i][j].link);
						++added;
					}
				}
			}
		}

		if (FoxtrickPrefs.isModuleEnabled('LinksTracker')) {
			var links2 = Foxtrick.modules['Links'].getLinks('trackerplayerlink',
				params, doc,
				Foxtrick.modules['LinksTracker']);
			if (links2.length > 0) {
				for (var i = 0; i < links2.length; ++i) {
					links2[i].link.className = 'flag inner';
					var img = links2[i].link.getElementsByTagName('img')[0];
					var style = 'vertical-align:top; margin-top:1px; background: transparent ' +
						'url(/Img/Flags/flags.gif) no-repeat scroll ' + (-20) * nationality +
						'px 0pt; -moz-background-clip: -moz-initial; -moz-background-origin: ' +
						'-moz-initial; -moz-background-inline-policy: -moz-initial;';
					img.setAttribute('style', style);
					img.src = '/Img/Icons/transparent.gif';
					ownBoxBody.appendChild(links2[i].link);
					++added;
				}
			}
		}
		if (added) {
			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = 'ft-links-box';
			Foxtrick.util.links.add(doc, ownBoxBody, this.MODULE_NAME, params);
		}
	}
};
