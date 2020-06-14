/**
 * supporterstats-enhancements.js
 * Add extra information to supporterstats
 * @author convincedd
 */

'use strict';

Foxtrick.modules['SupporterStatsEnhancements'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['statsSquad'],

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		// get selected teamid
		let teamId = 0;
		let options = Foxtrick.getMBElement(doc, 'ddlTeams').querySelectorAll('option');
		for (let option of options) {
			if (option.selected) {
				teamId = parseInt(option.value, 10);
				break;
			}
		}

		if (teamId == 0)
			return;

		/** @type {CHPPParams} */
		let args = [
			['file', 'players'],
			['version', '2.2'],
			['teamId', teamId],
		];
		Foxtrick.util.api.retrieve(doc, args, { cache: 'session' }, (xml, errorText) => {
			if (!xml || errorText) {
				Foxtrick.log(errorText);
				return;
			}

			/** @type {HTMLTableElement} */
			let table = doc.querySelector('#mainBody table');
			if (!table)
				return;

			let th = Foxtrick.createFeaturedElement(doc, module, 'th');
			Foxtrick.addClass(th, 'center');
			Foxtrick.addImage(doc, th, {
				src: Foxtrick.InternalPath + 'resources/img/formation.png',
				alt: Foxtrick.L10n.getString('CurrentSquad'),
				title: Foxtrick.L10n.getString('CurrentSquad'),
			});

			table.rows[0].appendChild(th);

			let playerNodes = xml.getElementsByTagName('Player');

			/** @type {NodeListOf<HTMLAnchorElement>} */
			let as = doc.querySelectorAll('#mainBody a');
			for (let a of as) {
				if (!/\/Club\/Players\/Player\./i.test(a.href))
					continue;

				let id = parseInt(Foxtrick.getUrlParam(a.href, 'playerId'), 10);
				let inSquad = false;
				for (let playerNode of playerNodes) {
					let pid = xml.num('PlayerID', playerNode);

					if (pid === id) {
						inSquad = true;
						break;
					}
				}

				let td = Foxtrick.insertFeaturedCell(a.closest('tr'), module, -1);
				td.className = 'center';
				if (inSquad)
					td.textContent = 'x';
			}
		});
	},
};
