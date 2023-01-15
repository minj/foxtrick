/**
 * linksplayer.js
 * Foxtrick add links to team pages
 * @author convinced, LA-MJ
 */

'use strict';

Foxtrick.modules.LinksPlayerDetail = {
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
	 * @return {HTMLUListElement}
	 */
	OPTION_FUNC: function(doc) {
		// @ts-ignore
		return Foxtrick.util.links.getPrefs(doc, this);
	},

	/** @param {document} doc */
	run: function(doc) {
		if (!Foxtrick.util.time.getDate(doc))
			return;

		// @ts-ignore
		Foxtrick.util.links.run(doc, this);
	},

	/**
	 * @param  {document} doc
	 * @return {LinkPageDefinition}
	 */
	links: function(doc) {
		if (Foxtrick.Pages.Player.wasFired(doc))
			return null;

		var gkParent = this.getGKLinkTarget(doc);

		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		var teamName = Foxtrick.Pages.All.getTeamName(doc);
		var playerId = Foxtrick.Pages.Player.getId(doc);
		var playerName = Foxtrick.Pages.Player.getName(doc);
		var nationality = Foxtrick.Pages.Player.getNationalityId(doc);

		var tsi = Foxtrick.Pages.Player.getTsi(doc);

		// age
		var age = Foxtrick.Pages.Player.getAge(doc) || { years: NaN, days: NaN };
		var { years, days } = age;

		var attrs = Foxtrick.Pages.Player.getAttributes(doc);
		var { form, stamina, experience, leadership } = attrs;

		var injuredWeeks = Foxtrick.Pages.Player.getInjuryWeeks(doc);

		/** @type {LinkPageType[]} */
		var types = ['playerlink'];

		/** @type {LinkArgs} */
		var info = {
			teamId,
			teamName,
			playerId,
			playerName,
			nationality,
			tsi,
			age: years,
			ageDays: days,
			form,
			exp: experience,
			leadership,
			stamina,
			injuredWeeks,
			deadline: '',
		};

		var rate = Foxtrick.util.currency.getRate();
		if (rate) {
			let wageObj = Foxtrick.Pages.Player.getWage(doc);
			if (wageObj) {
				info.wage = Math.round(wageObj.base * rate);
				info.wageBonus = Math.round(wageObj.bonus * rate);
			}
		}

		var deadline = Foxtrick.Pages.Player.getTransferDeadline(doc);
		if (deadline) {
			let format = 'YYYY-mm-dd HH:MM:SS';
			deadline = Foxtrick.util.time.toUser(doc, deadline);
			if (deadline)
				info.deadline = Foxtrick.util.time.buildDate(deadline, { format });
		}

		var skills = Foxtrick.Pages.Player.getSkills(doc);
		if (skills) {
			/**
			 * @type {(PlayerSkillName|[string, PlayerSkillName])[]}
			 */
			var copy = [
				['goalkeeping', 'keeper'],
				'playmaking',
				'passing',
				'winger',
				'defending',
				'scoring',
				'setPieces',
			];
			Foxtrick.forEach(function(skill) {
				if (typeof skill === 'string')
					info[skill] = /** @type {number} */ (skills[skill]);
				else
					info[skill[0]] = /** @type {number} */ (skills[skill[1]]);
			}, copy);

			types.push('transfercomparelink');
			// eslint-disable-next-line no-magic-numbers
			if (skills.keeper > 3 && gkParent) {
				let keeperLinks = {
					type: 'keeperlink',
					parent: gkParent,
					className: 'ft-link-keeper',
				};
				types.push(keeperLinks);
			}
		}
		if (injuredWeeks > 0) {
			let injuryLinks = {
				type: 'playerhealinglink',
				parent: Foxtrick.Pages.Player.getInjuryCell(doc),
				className: 'ft-link-injury',
			};
			types.push(injuryLinks);
		}
		if (Foxtrick.Prefs.isModuleEnabled('LinksTracker')) {
			let tracker = {
				type: 'trackerplayerlink',
				module: 'LinksTracker',
			};
			types.push(tracker);
		}
		return { types, info };
	},

	/**
	 * @param  {document} doc
	 * @return {HTMLElement}
	 */
	getGKLinkTarget(doc) {
		// FIXME unmaintainable
		var gkLinkTarget;

		/** @type {HTMLTableElement} */
		var skillTable = doc.querySelector('.transferPlayerSkills, .mainBox table');
		if (!skillTable)
			return gkLinkTarget;

		if (Foxtrick.hasClass(skillTable, 'transferPlayerSkills')) {
			let table = skillTable.querySelector('table');
			if (table.rows[0].cells[1]) {
				let target = Foxtrick.createFeaturedElement(doc, this, 'span');
				Foxtrick.addClass(target, 'nowrap float_right');
				Foxtrick.prependChild(target, skillTable);
				gkLinkTarget = target;
			}
		}
		else {
			let hasBars = skillTable.querySelector('.percentImage, .ft-percentImage');
			if (hasBars) {
				let skillLink = skillTable.rows[0].querySelector('a');
				if (skillLink)
					gkLinkTarget = skillLink.closest('td');
			}
			else {
				gkLinkTarget = skillTable.querySelectorAll('td')[1];
			}
		}
		return gkLinkTarget;
	},
};
