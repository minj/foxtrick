'use strict';
/**
 * linksplayer.js
 * Foxtrick add links to team pages
 * @author convinced, LA-MJ
 */

Foxtrick.modules['LinksPlayerDetail'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	PAGES: ['playerDetails'],
	LINK_TYPES: [
		'playerhealinglink',
		'playerlink',
		'keeperlink',
		'transfercomparelink',
	],
	/**
	 * return HTML for FT prefs
	 * @param  {document}         doc
	 * @param  {function}         cb
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc, cb) {
		return Foxtrick.util.links.getPrefs(doc, this, cb);
	},

	run: function(doc) {
		Foxtrick.util.links.run(doc, this);
	},

	links: function(doc) {
		if (Foxtrick.Pages.Player.wasFired(doc))
			return;

		var playerInfo = doc.getElementsByClassName('playerInfo')[0];
		var infoTable = playerInfo.getElementsByTagName('table')[0];
		var mainBox = doc.getElementsByClassName('mainBox')[0];
		var skillTable = mainBox ? mainBox.getElementsByTagName('table')[0] : null;

		var teamid = Foxtrick.Pages.All.getTeamId(doc);
		var teamname = Foxtrick.Pages.All.getTeamName(doc);
		var playerid = Foxtrick.Pages.Player.getId(doc);
		var playername = Foxtrick.Pages.Player.getName(doc);
		var nationality = Foxtrick.Pages.Player.getNationalityId(doc);

		var tsi = Foxtrick.Pages.Player.getTsi(doc);

		// age
		var age = Foxtrick.Pages.Player.getAge(doc);
		var years = age.years;
		var days = age.days;

		var attrs = Foxtrick.Pages.Player.getAttributes(doc);
		var form = attrs.form;
		var stamina = attrs.stamina;
		var exp = attrs.experience;
		var ls = attrs.leadership;

		var injuredweeks = Foxtrick.Pages.Player.getInjuryWeeks(doc);

		var types = ['playerlink'];
		var params = {
			teamid: teamid, teamname: teamname,
			playerid: playerid, playername: playername, nationality: nationality,
			tsi: tsi, age: years, age_days: days,
			form: form, exp: exp, leadership: ls, stamina: stamina,
			injuredweeks: injuredweeks, deadline: '',
		};

		var rate = Foxtrick.util.currency.getRate();
		if (rate) {
			var wageObj = Foxtrick.Pages.Player.getWage(doc);
			params.wage = Math.round(wageObj.base * rate);
			params.wagebonus = Math.round(wageObj.bonus * rate);
		}

		var deadlineDate = Foxtrick.Pages.Player.getTransferDeadline(doc);
		if (deadlineDate) {
			var parts = [
				deadlineDate.getFullYear(), '-',
				(deadlineDate.getMonth() + 1), '-', // getMonth() returns 0-11
				deadlineDate.getDate(), ' ',
				deadlineDate.getHours(), ':', deadlineDate.getMinutes(),
			];
			params.deadline = parts.join('');
		}

		var skills = Foxtrick.Pages.Player.getSkills(doc);
		if (skills) {
			var copy = [
				['goalkeeping', 'keeper'],
				'playmaking',
				'passing',
				'winger',
				'defending',
				'scoring',
				['setpieces', 'setPieces']
			];
			Foxtrick.forEach(function(skill) {
				if (typeof skill === 'string')
					params[skill] = skills[skill];
				else
					params[skill[0]] = skills[skill[1]];
			}, copy);

			types.push('transfercomparelink');
			if (skills.keeper > 3 && skillTable) {
				var newtable = (skillTable.rows.length === 7);
				var goalkeeperskillnode = newtable ? skillTable.rows[0].cells[1] :
					skillTable.rows[0].cells[3];
				goalkeeperskillnode = goalkeeperskillnode.getElementsByTagName('a')[0];

				var keeperLinks = {
					type: 'keeperlink',
					parent: goalkeeperskillnode.parentNode,
					className: 'ft-link-keeper',
				};
				types.push(keeperLinks);
			}
		}
		if (injuredweeks > 0) {
			var injuryLinks = {
				type: 'playerhealinglink',
				parent: infoTable.rows[4].cells[1],
				className: 'ft-link-injury',
			};
			types.push(injuryLinks);
		}
		if (Foxtrick.Prefs.isModuleEnabled('LinksTracker')) {
			var tracker = {
				type: 'trackerplayerlink',
				module: 'LinksTracker',
			};
			types.push(tracker);
		}
		return { types: types, info: params };
	}
};
