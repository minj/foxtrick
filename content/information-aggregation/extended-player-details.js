/**
 * ExtendedPlayerDetails
 * @desc displays wage without 20% bonus and time since player joined a team.
 * @author spambot, ryanli, LA-MJ
 */

'use strict';

Foxtrick.modules['ExtendedPlayerDetails'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails'],
	RADIO_OPTIONS: ['SWD', 'SW', 'SD', 'WD', 'D'],
	OPTIONS: ['Language'],

	run: function(doc) {
		var module = this;
		if (Foxtrick.Pages.Player.wasFired(doc))
			return;

		this.playerJoined(doc);

		// experiment: add language
		if (!Foxtrick.Prefs.isModuleOptionEnabled('ExtendedPlayerDetails', 'Language'))
			return;

		let id = Foxtrick.Pages.Player.getId(doc);
		let targetNode = doc.querySelector('#mainBody .byline');
		Foxtrick.Pages.Player.getPlayer(doc, id, (player) => {
			if (!player || !player.playerLanguage)
				return;

			let language = doc.createElement('em');
			Foxtrick.addClass(language, 'shy');
			language.setAttribute('style', 'font-weight:normal; margin-left:5px;');
			language.textContent = player.playerLanguage;
			if (player.playerLanguageID)
				language.setAttribute('PlayerLanguageID', player.playerLanguageID);

			let langPara = Foxtrick.createFeaturedElement(doc, module, 'p');
			langPara.appendChild(language);
			targetNode.appendChild(langPara);
		});
	},

	// Player in team since...
	playerJoined: function(doc) {
		var module = this;
		var HTDateFormat = Foxtrick.modules.HTDateFormat;
		let processed = doc.querySelectorAll('.ft-since');
		if (processed.length > 0)
			return;

		var table = doc.querySelector('.ownerAndStatusPlayerInfo table') ||
			doc.querySelector('.playerInfo table');
		if (!Foxtrick.util.id.findTeamId(table)) {
			// player has no team
			return;
		}

		let htDate = Foxtrick.util.time.getDate(doc);
		if (!htDate) {
			Foxtrick.log('User time missing');
			return;
		}

		var joinedEl = table.querySelector('.shy');
		let dateObj = Foxtrick.util.time.getDateFromText(joinedEl.textContent);
		if (!dateObj) {
			Foxtrick.log('Could no parse .shy time');
			return;
		}
		let seasonWeek = Foxtrick.util.time.gregorianToHT(dateObj);

		let diff = htDate.getTime() - dateObj.getTime();
		let sec = Math.floor(diff / Foxtrick.util.time.MSECS_IN_SEC);
		let joinedSpan = Foxtrick.util.time.timeDiffToSpan(doc, sec, { useDHM: false });

		Foxtrick.addClass(joinedEl, 'smallText ft-since');
		joinedEl.textContent = joinedEl.textContent.replace(')', '');

		if (Foxtrick.Prefs.isModuleEnabled(HTDateFormat)) {
			let dateSpan = Foxtrick.createFeaturedElement(doc, HTDateFormat, 'span');
			dateSpan.textContent = `(${seasonWeek.week}/${seasonWeek.season}), `;
			joinedEl.appendChild(dateSpan);
		}
		joinedEl.appendChild(joinedSpan);
		joinedEl.appendChild(doc.createTextNode(')'));

		Foxtrick.makeFeaturedElement(joinedEl, module);
	},
};

Foxtrick.modules['ExtendedPlayerDetailsWage'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['playerDetails'],
	OPTIONS: ['WageWithoutBonus', 'SeasonWage'],

	run: function(doc) {
		var module = this;
		const NBSP = '\u00a0';

		if (Foxtrick.Pages.Player.wasFired(doc))
			return;

		Foxtrick.util.currency.detect(doc).then(function({ symbol }) {
			let done = doc.querySelector('#ft_bonuswage, #ft_seasonwage');
			if (done)
				return;

			let wageObj = Foxtrick.Pages.Player.getWage(doc);
			if (!wageObj)
				return;

			var { total, bonus, base } = wageObj;
			var wageCell = Foxtrick.Pages.Player.getWageCell(doc);

			let wageStr = Foxtrick.formatNumber(total, NBSP);
			let symbolReStr = Foxtrick.strToRe(symbol);

			var currencyStr = wageStr + NBSP + symbol;
			var currencyRe = new RegExp(wageStr + NBSP + symbolReStr);

			if (!currencyRe.test(wageCell.textContent)) {
				// bad currency
				Foxtrick.log(symbol, 'NOT FOUND');
				Foxtrick.util.currency.reset();
				Foxtrick.util.currency.displaySelector(doc, { reason: 'symbol' });
				return;
			}

			var wageWOBonus = Foxtrick.Prefs.isModuleOptionEnabled(module, 'WageWithoutBonus');
			var seasonWage = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SeasonWage');

			let wageString = wageCell.textContent;

			/** @type {HTMLSpanElement} */
			let wageSpan;
			if ((wageSpan = wageCell.querySelector('span[title]'))) {
				let amount = wageCell.firstChild.textContent;
				wageString = amount + wageSpan.title.replace(/^[\d\s]+/, '');
			}

			var [wagePre, wageFull] = wageString.split(currencyRe);

			if (wageWOBonus || seasonWage)
				Foxtrick.removeClass(wageCell, 'nowrap');

			let hasBonus = !!bonus;
			if (hasBonus && wageWOBonus) {
				wageCell.textContent = wagePre + currencyStr + ' ';

				let wageBaseStr = Foxtrick.formatNumber(base, NBSP);
				let baseSpan = doc.createElement('span');
				baseSpan.id = 'ft_bonuswage';
				baseSpan.setAttribute('style', 'direction: ltr; color:#666666;');
				baseSpan.textContent = `(${wageBaseStr}${NBSP}${symbol})`;
				Foxtrick.makeFeaturedElement(baseSpan, module);

				wageCell.appendChild(baseSpan);
				wageCell.appendChild(doc.createTextNode(wageFull));
			}

			if (seasonWage) {
				let wageSeason = total * 16;
				let wageSeasonStr = Foxtrick.formatNumber(wageSeason, NBSP);
				let perseason = Foxtrick.L10n.getString('ExtendedPlayerDetails.perseason');

				let spanSeason = doc.createElement('span');
				spanSeason.id = 'ft_seasonwage';
				spanSeason.textContent = wageSeasonStr + NBSP + symbol + perseason;
				Foxtrick.makeFeaturedElement(spanSeason, module);

				wageCell.appendChild(doc.createElement('br'));
				wageCell.appendChild(spanSeason);
			}

		}).catch(function(reason) {
			Foxtrick.log('WARNING: currency.detect aborted:', reason);
		});

	},
};
