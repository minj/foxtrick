/**
 * copy-bb-ad.js
 * Copies finances, leage stats or league table (in BB code) to the clipboard
 * @author merfis
 */

'use strict';

Foxtrick.modules.CopyBBAd = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['finances', 'statsSeries', 'series', 'youthSeries'],
	OPTIONS: ['CopyTableAd', 'CopyFinancesAd', 'CopyLeagueStatsAd'],
	CSS: Foxtrick.InternalPath + 'resources/css/copy-bb-ad.css',

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		if ((Foxtrick.isPage(doc, 'series') || Foxtrick.isPage(doc, 'youthSeries')) &&
			Foxtrick.Prefs.isModuleOptionEnabled(module, 'CopyTableAd'))
			module.runSeries(doc);
		else if (Foxtrick.isPage(doc, 'finances') &&
			Foxtrick.Prefs.isModuleOptionEnabled(module, 'CopyFinancesAd'))
			module.runFinances(doc);
		else if (Foxtrick.isPage(doc, 'statsSeries') &&
			Foxtrick.Prefs.isModuleOptionEnabled(module, 'CopyLeagueStatsAd'))
			module.runStatsSeries(doc);
	},

	/** @param {document} doc */
	runSeries: function(doc) {
		const module = this;

		var button = Foxtrick.util.copyButton.add(doc, Foxtrick.L10n.getString('CopyTableAd.copy'));
		if (button) {
			Foxtrick.addClass(button, 'ft-copy-bb-ad');
			Foxtrick.onClick(button, module.copyTableAd);
		}
	},

	/** @type {Listener<HTMLAnchorElement, MouseEvent>} */
	// eslint-disable-next-line complexity
	copyTableAd: function(ev) {
		try {
			var doc = this.ownerDocument;

			// try regular table first
			var leagueTable = Foxtrick.Pages.Series.getTable(doc);
			if (!leagueTable)
				return;

			const TEAM_NAME_LIMIT = 30;

			var posRnkg = 0;
			var posTeam = 2;

			// youth table doesn't has a manager online icon
			var isYouth = Foxtrick.isPage(doc, 'youthSeries');

			/* eslint-disable no-magic-numbers */
			var posGames = isYouth ? 3 : 5;
			var posWins = isYouth ? 4 : 6;
			var posDraws = isYouth ? 5 : 7;
			var posLost = isYouth ? 6 : 8;
			var posGF = isYouth ? 7 : 9;
			var posGA = isYouth ? 8 : 10;
			var posGD = isYouth ? 9 : 11;
			var posPts = isYouth ? 10 : 12;
			/* eslint-enable no-magic-numbers */

			// youth table has an additional row for some reason
			let rows = [...leagueTable.rows];
			if (isYouth)
				rows.pop();

			var ad = '[table]\n';
			for (let row of rows) {
				ad += '[tr]\n';

				// position
				ad += '[td]' + row.cells[posRnkg].textContent.trim() + '[/td]\n';

				// team - trim to first 30 chars
				ad += '[td]' +
					row.cells[posTeam].textContent.trim().slice(0, TEAM_NAME_LIMIT) + '[/td]\n';

				// games
				ad += '[td][right] ' + row.cells[posGames].textContent.trim() + ' [/right][/td]\n';

				// wins
				ad += '[td][right] ' + row.cells[posWins].textContent.trim() + ' [/right][/td]\n';

				// draws
				ad += '[td][right] ' + row.cells[posDraws].textContent.trim() + ' [/right][/td]\n';

				// lost
				ad += '[td][right] ' + row.cells[posLost].textContent.trim() + ' [/right][/td]\n';

				// goals for
				ad += '[td][right] ' + row.cells[posGF].textContent.trim() + ' [/right][/td]\n';

				// goals against
				ad += '[td][right] ' + row.cells[posGA].textContent.trim() + ' [/right][/td]\n';

				// goal difference
				ad += '[td][right] ' + row.cells[posGD].textContent.trim() + ' [/right][/td]\n';

				// points
				ad += '[td][right] ' + row.cells[posPts].textContent.trim() + ' [/right][/td]\n';

				ad += '[/tr]\n';
			}
			ad += '[/table]\n';

			Foxtrick.copy(doc, ad);

			let l10nCopied = Foxtrick.L10n.getString('CopyTableAd.copied');
			Foxtrick.util.note.add(doc, l10nCopied, 'ft-tableAd-copy-note');

		}
		catch (e) {
			Foxtrick.log('CopyTableAd', e);
		}

	},

	/** @param {document} doc */
	runStatsSeries: function(doc) {
		/** @param {string} type */
		// eslint-disable-next-line complexity
		var copyLeagueStatsAd = function(type) {
			try {
				var allStats = type == 'all';
				var maxStats = type == 'max';
				var avgStats = type == 'avg';

				// array with ratings tables
				// position 0 is for ratings
				// position 1 is for stars
				var ad = '';

				/** @type {NodeListOf<HTMLTableElement>} */
				var ratingsTables = doc.querySelectorAll('#mainBody table');
				for (let [k, table] of [...ratingsTables].entries()) {

					switch (k) {
						case 0:
							ad += Foxtrick.L10n.getString('CopyLeagueStatsAd.topteamsrating');
							break;
						case 1:
							ad += Foxtrick.L10n.getString('CopyLeagueStatsAd.topteamsstars');
							break;
						default:
							Foxtrick.log('WARNING: unhandled case');
							break;
					}

					if (allStats)
						ad += ' (' + Foxtrick.L10n.getString('CopyLeagueStatsAd.allstats') + ')';
					else if (maxStats)
						ad += ' (' + Foxtrick.L10n.getString('CopyLeagueStatsAd.maxstats') + ')';
					else
						ad += ' (' + Foxtrick.L10n.getString('CopyLeagueStatsAd.avgstats') + ')';

					ad += '\n[table]\n';

					for (let [i, row] of [...table.rows].entries()) {
						ad += '[tr]\n';

						for (let [j, cell] of [...row.cells].entries()) {
							let texts = [...cell.querySelectorAll('span')].map(s => s.textContent);

							// the first row is the header row, so just copy its contents
							if (i == 0)
								ad += '[td]' + cell.textContent + '[/td]\n';
							else if (j == 0 || j == 1)
								ad += '[td]' + cell.textContent + '[/td]\n';
							else if (maxStats)
								ad += '[td]' + texts[0] + '[/td]\n';
							else if (avgStats)
								ad += '[td]' + texts[1] + '[/td]\n';
							else
								ad += '[td]' + texts[0] + ' (' + texts[1] + ')[/td]\n';
						}

						ad += '[/tr]\n';
					}
					ad += '[/table]\n\n';
				}

				Foxtrick.copy(doc, ad);

				let l10nCopied = Foxtrick.L10n.getString('CopyLeagueStatsAd.copied');
				Foxtrick.util.note.add(doc, l10nCopied, 'ft-tableAd-copy-note');
			}

			catch (e) {
				Foxtrick.log('CopyTableAd', e);
			}
		};

		let l10nCopy = Foxtrick.L10n.getString('CopyLeagueStatsAd.copy');
		let button = Foxtrick.util.copyButton.add(doc, l10nCopy);
		if (button) {
			Foxtrick.addClass(button, 'ft-copy-bb-ad ft-pop-up-container');

			let versions = ['all', 'max', 'avg'];
			let list = doc.createElement('ul');
			list.className = 'ft-pop';
			for (let version of versions) {
				let item = doc.createElement('li');
				let link = doc.createElement('span');
				Foxtrick.onClick(link, () => copyLeagueStatsAd(version));
				link.setAttribute('teams', version);
				link.textContent = Foxtrick.L10n.getString('CopyLeagueStatsAd.' + version);
				item.appendChild(link);
				list.appendChild(item);
			}
			button.appendChild(list);
		}

		// which stats should be copied
	},

	/** @param {document} doc */
	runFinances: function(doc) {
		const module = this;

		let l10nCopy = Foxtrick.L10n.getString('CopyFinancesAd.copy');
		let button = Foxtrick.util.copyButton.add(doc, l10nCopy);
		if (button) {
			Foxtrick.addClass(button, 'ft-copy-bb-ad');
			Foxtrick.onClick(button, module.copyFinancesAd);
		}
	},

	/** @type {Listener<HTMLAnchorElement, MouseEvent>} */
	// eslint-disable-next-line complexity
	copyFinancesAd: function(ev) {
		try {
			var doc = this.ownerDocument;

			let mainBody = doc.getElementById('mainBody');
			let financesTable = mainBody.querySelector('table');

			var ad = '[b]' + mainBody.querySelector('h2').textContent.trim() + '[/b]\n\n';

			ad += '[table]\n';
			for (let [i, row] of [...financesTable.rows].entries()) {
				ad += '[tr]\n';

				/* eslint-disable no-magic-numbers */
				for (let [j, cell] of [...row.cells].entries()) {
					ad += '[td]';
					if (i == 0 || i == financesTable.rows.length - 3 ||
						i == financesTable.rows.length - 1)
						ad += '[b]';

					ad += cell.textContent;

					if (i == 0 || i == financesTable.rows.length - 3 ||
						i == financesTable.rows.length - 1)
						ad += '[/b]';

					ad += '[/td]\n';

					if (i == 0)
						ad += '[td] [/td]\n';
					if (i == financesTable.rows.length - 1 && j == 0)
						ad += '[td] [/td]\n[td] [/td]\n';
				}
				/* eslint-enable no-magic-numbers */

				ad += '[/tr]\n';
			}
			ad += '[/table]\n';
			ad = ad.replace(/\s+/g, ' ');

			Foxtrick.copy(doc, ad);
			let l10nCopied = Foxtrick.L10n.getString('CopyFinancesAd.copied');
			Foxtrick.util.note.add(doc, l10nCopied, 'ft-tableAd-copy-note');
		}
		catch (e) {
			Foxtrick.log('CopyFinancesAd', e);
		}
	},
};
