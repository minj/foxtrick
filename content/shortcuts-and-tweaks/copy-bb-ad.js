'use strict';
/**
 * copy-bb-ad.js
 * Copies finances, leage stats or league table (in BB code) to the clipboard
 * @author merfis
 */
 ////////////////////////////////////////////////////////////////////////////////
Foxtrick.modules['CopyBBAd'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['finances', 'statsSeries', 'series', 'youthSeries'],
	OPTIONS: ['CopyTableAd', 'CopyFinancesAd', 'CopyLeagueStatsAd'],
	CSS: Foxtrick.InternalPath + 'resources/css/copy-bb-ad.css',
	run: function(doc) {
		if ((Foxtrick.isPage(doc, 'series') || Foxtrick.isPage(doc, 'youthSeries')) &&
			Foxtrick.Prefs.isModuleOptionEnabled('CopyBBAd', 'CopyTableAd'))
			this.runSeries(doc);
		else if (Foxtrick.isPage(doc, 'finances') &&
			Foxtrick.Prefs.isModuleOptionEnabled('CopyBBAd', 'CopyFinancesAd'))
			this.runFinances(doc);
		else if (Foxtrick.isPage(doc, 'statsSeries') &&
			Foxtrick.Prefs.isModuleOptionEnabled('CopyBBAd', 'CopyLeagueStatsAd'))
			this.runStatsSeries(doc);
	},
	runSeries: function(doc) {
		var button =
			Foxtrick.util.copyButton.add(doc, Foxtrick.L10n.getString('CopyTableAd.copy'));
		if (button) {
			Foxtrick.addClass(button, 'ft-copy-bb-ad');
			Foxtrick.onClick(button, this.CopyTableAd);
		}
	},
	CopyTableAd: function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			//try regular table first
			var isYouth = Foxtrick.isPage(doc, 'youthSeries');
			var tableId = isYouth ? 'ctl00_ctl00_CPContent_CPMain_UpdatePanel1' :
				'ctl00_ctl00_CPContent_CPMain_repLeagueTable';
			var leagueTableElem = doc.getElementById(tableId);

			if (leagueTableElem) {
				var leagueTable = leagueTableElem.getElementsByTagName('table')[0];
				var posRnkg = 0;
				var posTeam = 2;
				//youth table doesn't has a manager online icon
				var posGames = (isYouth) ? 3 : 5;
				var posWins = (isYouth) ? 4 : 6;
				var posDraws = (isYouth) ? 5 : 7;
				var posLost = (isYouth) ? 6 : 8;
				var posGF = (isYouth) ? 7 : 9;
				var posGA = (isYouth) ? 8 : 10;
				var posGD = (isYouth) ? 9 : 11;
				var posPts = (isYouth) ? 10 : 12;

				//youth table has an additional row for some reason
				var leagueTableLength = isYouth ? leagueTable.rows.length - 1 :
					leagueTable.rows.length;

				var ad = '[table]\n';
				for (var i = 0; i < leagueTableLength; i++) {
					ad += '[tr]\n';
					//position
					ad += '[td]' + leagueTable.rows[i].cells[posRnkg].textContent.trim() +
						'[/td]\n';
					//team - trim to first 30 chars
					ad += '[td]' + leagueTable.rows[i].cells[posTeam].textContent.trim()
						.substring(0, 30) + '[/td]\n';
					//games
					ad += '[td][right] ' + leagueTable.rows[i].cells[posGames].textContent.trim() +
						' [/right][/td]\n';
					//wins
					ad += '[td][right] ' + leagueTable.rows[i].cells[posWins].textContent.trim() +
						' [/right][/td]\n';
					//draws
					ad += '[td][right] ' + leagueTable.rows[i].cells[posDraws].textContent.trim() +
						 ' [/right][/td]\n';
					//lost
					ad += '[td][right] ' + leagueTable.rows[i].cells[posLost].textContent.trim() +
						' [/right][/td]\n';
					//goals for
					ad += '[td][right] ' + leagueTable.rows[i].cells[posGF].textContent.trim() +
						' [/right][/td]\n';
					//goals against
					ad += '[td][right] ' + leagueTable.rows[i].cells[posGA].textContent.trim() +
						' [/right][/td]\n';
					//goal difference
					ad += '[td][right] ' + leagueTable.rows[i].cells[posGD].textContent.trim() +
						' [/right][/td]\n';
					//points
					ad += '[td][right] ' + leagueTable.rows[i].cells[posPts].textContent.trim() +
						' [/right][/td]\n';
					ad += '[/tr]\n';
				}
				ad += '[/table]\n';

				Foxtrick.copyStringToClipboard(ad);
				Foxtrick.util.note.add(doc, Foxtrick.L10n.getString('CopyTableAd.copied'),
				                       'ft-tableAd-copy-note');
			}

		}

		catch (e) {
			Foxtrick.log('CopyTableAd', e);
		}

	},
	runStatsSeries: function(doc) {
		var CopyLeagueStatsAd = function(type) {
			try {
				var allStats = (type == 'all');
				var maxStats = (type == 'max');
				var avgStats = (type == 'avg');
				//array with ratings tables
				//position 0 is for ratings
				//position 1 is for stars
				var ratingsTables = doc.getElementById('mainBody')
					.getElementsByTagName('table');
				var ad = '';

				for (var k = 0; k < ratingsTables.length; k++) {

					switch (k) {
						case 0:
							ad += Foxtrick.L10n.getString('CopyLeagueStatsAd.topteamsrating');
						break;
						case 1:
							ad += Foxtrick.L10n.getString('CopyLeagueStatsAd.topteamsstars');
						break;
					}

					if (allStats) {
						ad += ' (' + Foxtrick.L10n.getString('CopyLeagueStatsAd.allstats') +')';
					}
					else if (maxStats) {
						ad += ' (' + Foxtrick.L10n.getString('CopyLeagueStatsAd.maxstats') +')';
					}
					else {
						ad += ' (' + Foxtrick.L10n.getString('CopyLeagueStatsAd.avgstats') +')';
					}

					ad += '\n[table]\n';

					for (var i = 0; i < ratingsTables[k].rows.length; i++) {
						ad += '[tr]\n';
						for (var j = 0; j < ratingsTables[k].rows[i].cells.length; j++) {
							//the first row is the header row, so just copy its contents
							if (i == 0) {
								ad += '[td]' + ratingsTables[k].rows[i].cells[j].textContent +
									'[/td]\n';
							}
							else if (j == 0 || j == 1) {
								ad += '[td]' + ratingsTables[k].rows[i].cells[j].textContent +
									'[/td]\n';
							}
							else if (maxStats) {
								ad += '[td]' + ratingsTables[k].rows[i].cells[j]
									.getElementsByTagName('span')[0].textContent + '[/td]\n';
							}
							else if (avgStats) {
								ad += '[td]' + ratingsTables[k].rows[i].cells[j]
									.getElementsByTagName('span')[1].textContent + '[/td]\n';
							}
							else {
								ad += '[td]' + ratingsTables[k].rows[i].cells[j]
									.getElementsByTagName('span')[0].textContent + ' (' +
									ratingsTables[k].rows[i].cells[j]
									.getElementsByTagName('span')[1].textContent + ')' + '[/td]\n';
							}
						}
						ad += '[/tr]\n';
					}
					ad += '[/table]\n\n';
				}
				Foxtrick.copyStringToClipboard(ad);
				Foxtrick.util.note.add(doc, Foxtrick.L10n.getString('CopyLeagueStatsAd.copied'),
				                       'ft-tableAd-copy-note');
			}

			catch (e) {
				Foxtrick.log('CopyTableAd', e);
			}
		};

		var button =
			Foxtrick.util.copyButton.add(doc, Foxtrick.L10n.getString('CopyLeagueStatsAd.copy'));
		if (button) {
			Foxtrick.addClass(button, 'ft-copy-bb-ad ft-pop-up-container');

			var versions = ['all', 'max', 'avg'];
			var list = doc.createElement('ul');
			list.className = 'ft-pop';
			for (var j = 0; j < versions.length; ++j) {
				var item = doc.createElement('li');
				var link = doc.createElement('span');
				Foxtrick.onClick(link, (function(type) {
					return function() { CopyLeagueStatsAd(type); };
				})(versions[j]));
				link.setAttribute('teams', versions[j]);
				link.textContent = Foxtrick.L10n.getString('CopyLeagueStatsAd.' + versions[j]);
				item.appendChild(link);
				list.appendChild(item);
			}
			button.appendChild(list);
		}

		// which stats should be copied
	},
	runFinances: function(doc) {
		var button = Foxtrick.util.copyButton.add(doc,
				Foxtrick.L10n.getString('CopyFinancesAd.copy'));
		if (button) {
			Foxtrick.addClass(button, 'ft-copy-bb-ad');
			Foxtrick.onClick(button, this.CopyFinancesAd);
		}
	},

	CopyFinancesAd: function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var mainBody = doc.getElementById('mainBody');
			var financesTable = mainBody.getElementsByTagName('table')[0];

			var ad = '[b]' + mainBody.getElementsByTagName('h2')[0].textContent.trim() +
				'[/b]\n\n';
			ad += '[table]\n';
			for (var i = 0; i < financesTable.rows.length; i++) {
				ad += '[tr]\n';
				for (var j = 0; j < financesTable.rows[i].cells.length; j++) {
					ad += '[td]';
					if (i == 0 || i == financesTable.rows.length - 3 ||
						i == financesTable.rows.length - 1)
						ad += '[b]';
					ad += financesTable.rows[i].cells[j].textContent;
					if (i == 0 || i == financesTable.rows.length - 3 ||
						i == financesTable.rows.length - 1)
						ad += '[/b]';
					ad += '[/td]\n';
					if (i == 0)
						ad += '[td] [/td]\n';
					if (i == financesTable.rows.length - 1 && j==0)
						ad += '[td] [/td]\n[td] [/td]\n';
				}
				ad += '[/tr]\n';
			}
			ad += '[/table]\n';
			ad = ad.replace(/\s+/g, ' ');

			Foxtrick.copyStringToClipboard(ad);
			Foxtrick.util.note.add(doc, Foxtrick.L10n.getString('CopyFinancesAd.copied'),
			                       'ft-tableAd-copy-note');
		}
		catch (e) {
			Foxtrick.log('CopyFinancesAd', e);
		}
	}
};
