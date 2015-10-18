'use strict';
/**
 * ExtendedPlayerDetails
 * @desc displays wage without 20% bonus and time since player joined a team.
 * @author spambot, ryanli
 */

Foxtrick.modules['ExtendedPlayerDetails'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails'],
	RADIO_OPTIONS: ['SWD', 'SW', 'SD', 'WD', 'D'],
	OPTIONS: ['Language'],

	run: function(doc) {
		var module = this;
		if (Foxtrick.Pages.Player.wasFired(doc))
			return;

		this._Player_Joined(doc);

		// experiment: add language
		if (Foxtrick.Prefs.isModuleOptionEnabled('ExtendedPlayerDetails', 'Language')) {
			var addPlayerLanguage = function(playerid, node) {
				Foxtrick.Pages.Player.getPlayer(doc, playerid,
				  function(player) {
					if (!player)
						return;
					if (player.playerLanguage) {
						var language = doc.createElement('em');
						Foxtrick.addClass(language, 'shy');
						language.setAttribute('style', 'font-weight:normal; margin-left:5px;');
						language.textContent = player.playerLanguage;
						if (player.playerLanguageID)
							language.setAttribute('PlayerLanguageID', player.playerLanguageID);

						var langPara = Foxtrick.createFeaturedElement(doc, module, 'p');
						langPara.appendChild(language);
						node.appendChild(langPara);
					}
				});
			};
			var id = Foxtrick.Pages.Player.getId(doc);
			var targetNode = doc.getElementById('mainBody').getElementsByClassName('byline')[0];
			addPlayerLanguage(id, targetNode);
		}
	},

	_Player_Joined: function(doc) {
		// Player in team since...
		var processed = doc.getElementsByClassName('ft_since');
		if (processed.length > 0)
			return;

		var div = doc.getElementsByClassName('playerInfo')[0];
		if (!Foxtrick.util.id.findTeamId(div.getElementsByTagName('table')[0]))
			return; // player has no team

		var joined_elm = div.getElementsByClassName('shy')[0];

		var dateObj = Foxtrick.util.time.getDateFromText(joined_elm.textContent);
		var season_week = Foxtrick.util.time.gregorianToHT(dateObj);

		var htDate = Foxtrick.util.time.getHtDate(doc);

		var sec = Math.floor((htDate.getTime() - dateObj.getTime()) / 1000); // sec

		var JoinedSpan = Foxtrick.util.time.timeDiffToSpan(doc, sec, { useDHM: false });

		if (JoinedSpan.textContent.search('NaN') == -1) {
			Foxtrick.addClass(joined_elm, 'smallText ft_since');
			joined_elm.textContent = joined_elm.textContent.replace(')', '');
			joined_elm.insertBefore(doc.createElement('br'), joined_elm.firstChild);

			if (Foxtrick.Prefs.isModuleEnabled('HTDateFormat')) {
				var dateSpan = Foxtrick
					.createFeaturedElement(doc, Foxtrick.modules.HTDateFormat, 'span');
				dateSpan.textContent = '(' + season_week.week + '/' + season_week.season + '), ';
				joined_elm.appendChild(dateSpan);
			}
			joined_elm.appendChild(JoinedSpan);
			joined_elm.appendChild(doc.createTextNode(')'));
			Foxtrick.makeFeaturedElement(joined_elm, this);
		}
		else
			Foxtrick.log('Could not create jointime (NaN)\n');
	},
};

Foxtrick.modules['ExtendedPlayerDetailsWage'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails'],
	OPTIONS: ['WageWithoutBonus', 'SeasonWage'],

	run: function(doc) {
		var module = this;
		var NBSP = '\u00a0';

		Foxtrick.util.currency.establish(doc, function(rate, symbol) {
			var done = doc.querySelector('#ft_bonuswage, #ft_seasonwage');
			if (done)
				return;

			var wageObj = Foxtrick.Pages.Player.getWage(doc);
			if (!wageObj)
				return;

			var wageTbl = doc.querySelector('.playerInfo table');
			if (!wageTbl)
				return;

			var symbolReStr = symbol.replace('$', '\\$');
			var wageStr = Foxtrick.formatNumber(wageObj.total, NBSP);
			var wageRe = new RegExp('^\\s*' + wageStr + NBSP + symbolReStr);
			var wageRow = Foxtrick.nth(function(row) {
				var cell = row.cells[1];
				if (cell) {
					return wageRe.test(cell.textContent);
				}
				return false;
			}, wageTbl.rows);

			if (!wageRow) {
				// bad currency
				Foxtrick.log(symbol, 'NOT FOUND');
				Foxtrick.util.currency.reset();
				Foxtrick.util.currency.displaySelector(doc, { reason: 'symbol' });
				return;
			}

			var wageCell = wageRow.cells[1];

			var wageWOBonus = Foxtrick.Prefs.isModuleOptionEnabled(module, 'WageWithoutBonus');
			var seasonWage = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SeasonWage');

			var hasBonus = !!wageObj.bonus;
			if (hasBonus && wageWOBonus) {
				var wageText = wageCell.textContent;
				var part1 = wageText.match(wageRe)[0];
				var part2 = wageText.replace(wageRe, '');

				wageCell.textContent = part1 + NBSP;
				var wageWOStr = Foxtrick.formatNumber(wageObj.base, NBSP);

				var spanWO = doc.createElement('span');
				spanWO.id = 'ft_bonuswage';
				spanWO.setAttribute('style', 'direction: ltr; color:#666666;');
				spanWO.textContent = '(' + wageWOStr + NBSP + symbol + ')';
				Foxtrick.makeFeaturedElement(spanWO, module);

				wageCell.appendChild(spanWO);
				wageCell.appendChild(doc.createTextNode(part2));
			}

			if (seasonWage) {
				var wageSeason = wageObj.total * 16;
				var wageSeasonStr = Foxtrick.formatNumber(wageSeason, NBSP);
				var perseason = Foxtrick.L10n.getString('ExtendedPlayerDetails.perseason');

				var spanSeason = doc.createElement('span');
				spanSeason.id = 'ft_seasonwage';
				spanSeason.textContent = wageSeasonStr + NBSP + symbol + perseason;
				Foxtrick.makeFeaturedElement(spanSeason, module);

				wageCell.appendChild(doc.createElement('br'));
				wageCell.appendChild(spanSeason);
			}
		});
	},
};
