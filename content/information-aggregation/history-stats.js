'use strict';

/**
 * history-stats.js
 * Foxtrick team history stats
 * @author spambot
 */

Foxtrick.modules.HistoryStats = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['history'],
	NICE: -1, // before FoxtrickCopyMatchID

	/** @type {Object<string, string[]>} */
	Buffer: {},
	Pages: {},
	Offset: {},

	/** @param {document} doc */
	run: function(doc) {
		const teamId = Foxtrick.Pages.All.getTeamId(doc);
		this.Buffer[teamId] = [];
		this.Pages[teamId] = [];
		this._fetch(doc);
		this._paste(doc);
	},

	/** @param {document} doc */
	change: function(doc) {
		this._fetch(doc);
		this._paste(doc);
	},

	/** @param {document} doc */
	// eslint-disable-next-line complexity
	_fetch: function(doc) {
		const module = this;

		const DATE_SPAN_SELECTOR = '.date, [id$="_spanDate"]';

		/**
		 * @param  {HTMLAnchorElement} a
		 * @return {boolean}
		 */
		var isLgHist = function(a) {
			return /LeagueLevelUnitID/i.test(a.href) &&
				/RequestedSeason/i.test(a.href);
		};

		/**
		 * @param  {HTMLAnchorElement} a
		 * @return {boolean}
		 */
		var isCupHist = function(a) {
			return /actiontype=viewcup/i.test(a.href);
		};

		/**
		 * @param  {HTMLAnchorElement} a
		 * @return {boolean}
		 */
		var isWinnerLink = function(a) {
			return /Club\/Manager\/\?userId/i.test(a.href);
		};

		/**
		 * @param  {number} teamId
		 * @return {boolean}
		 */
		var hasSeasonOffset = function(teamId) {
			return Foxtrick.hasProp(module.Offset, String(teamId));
		};

		/**
		 * @param  {HTMLElement} log
		 * @param  {number}      teamId
		 * @return {boolean}
		 */
		var gotSeasonOffset = function(log, teamId) {
			let feedItems = log.querySelectorAll('.feedItem');
			return Foxtrick.any(function(feedItem) {
				let dateSpan = feedItem.querySelector(DATE_SPAN_SELECTOR);
				if (!dateSpan)
					return false;

				/** @type {Element} */
				let row = feedItem.closest('tr');

				let date;
				while (row && !date) {
					let feedItem = row.querySelector('.feedItem');
					if (feedItem) {
						let dateSpan = feedItem.querySelector(DATE_SPAN_SELECTOR);
						if (dateSpan)
							date = Foxtrick.util.time.getDateFromText(dateSpan.textContent);
					}
					row = row.previousElementSibling;
				}
				if (!date)
					return false;

				let { season } = Foxtrick.util.time.gregorianToHT(date);

				/** @type {HTMLTableCellElement} */
				let cell = feedItem.querySelector('td.float_left');
				let clone = Foxtrick.cloneElement(cell, true);
				let links = clone.querySelectorAll('a');

				let cupLink = Foxtrick.nth(isCupHist, links);
				if (cupLink) {
					let cupSeason = cupLink.textContent;
					module.Offset[teamId] = season - parseInt(cupSeason, 10);
					return true;
				}
				else if (Foxtrick.any(isLgHist, links)) {
					Foxtrick.forEach(l => l.remove(), links);

					// README: match 2 digits only to guard against position number
					let seriesSeason = clone.textContent.match(/\b\d\d\b/);
					if (seriesSeason) {
						let thisSeason = seriesSeason.toString();
						module.Offset[teamId] = season - parseInt(thisSeason, 10);
						return true;
					}
				}

				return false;

			}, feedItems);
		};

		var teamId = Foxtrick.Pages.All.getTeamId(doc);

		// try to get current page number
		var page = 1;
		try {
			let pager = Foxtrick.getMBElement(doc, 'ucOtherEvents_ucPagerBottom_divWrapper');
			page = parseInt(pager.querySelector('strong').textContent, 10);
		}
		catch (e) { }

		if (Foxtrick.has(module.Pages[teamId], page))
			return;

		module.Pages[teamId].push(page);

		let log = Foxtrick.getMBElement(doc, 'ucOtherEvents_ctl00');

		// get season offset
		if (!hasSeasonOffset(teamId)) {
			if (!gotSeasonOffset(log, teamId))
				return;
		}

		let copy = Foxtrick.cloneElement(log, true);
		let events = copy.querySelectorAll('.feedItem td.float_left');
		for (let event of Foxtrick.toArray(events)) {
			// stop if old manager
			if (event.getElementsByClassName('shy').length)
				break;

			let buff = '';
			let series = '-';
			let cup = '';
			let division = 0;

			/** @type {Element} */
			let row = event.closest('.feedItem').closest('tr');

			let date;
			while (row && !date) {
				let feedItem = row.querySelector('.feedItem');
				if (feedItem) {
					let dateSpan = feedItem.querySelector(DATE_SPAN_SELECTOR);
					if (dateSpan)
						date = Foxtrick.util.time.getDateFromText(dateSpan.textContent);
				}
				row = row.previousElementSibling;
			}
			if (!date)
				continue;

			let { season } = Foxtrick.util.time.gregorianToHT(date);

			let links = Foxtrick.toArray(event.querySelectorAll('a'));
			for (let link of links) {
				if (isLgHist(link)) {
					series = link.textContent;

					// README: should use Foxtrick.util.id.parseSeries
					// but leagueId is unavailable
					if (/\./.test(series)) {
						let [sSplit] = series.split('.');
						division = Foxtrick.util.id.romantodecimal(sSplit);
					}
					else {
						division = 1;
					}
				}

				if (isCupHist(link)) {
					Foxtrick.forEach(a => a.remove(), event.querySelectorAll('a'));

					// French/Flemish: '1e'
					let match = event.textContent.match(/\b\d{1,2}(?!\d)/);
					cup = match ? match.toString() : '!';
				}
			}

			// league
			if (division) {
				if (Foxtrick.any(isWinnerLink, links)) {
					// skip double entry for winning league
					continue;
				}

				let lSeason = season - module.Offset[teamId];
				let lSeasonRe = new RegExp('\\b' + lSeason + '\\b');
				Foxtrick.forEach(a => a.remove(), event.getElementsByTagName('a'));
				event.textContent = event.textContent.replace(lSeasonRe, '').trim();

				let pos = event.textContent.match(/\b\d{1}(?!\d)/); // French/Flemish: '1e'
				buff += season + '|' + division + '|' + pos + '|' + series;
			}
			else if (cup) {
				buff += season + '|' + cup + '||';
			}
			else {
				// unimportant event
				continue;
			}

			// add a short timestamp
			buff += '|' + Math.floor(date.valueOf() / Foxtrick.util.time.MSECS_IN_DAY);
			if (!Foxtrick.has(module.Buffer[teamId], buff))
				module.Buffer[teamId].push(buff);
		}
	},

	/** @param {document} doc */
	_paste: function(doc) {
		const module = this;
		const OWN_BOX_BODY_ID = 'ft_HistoryStats';

		const teamId = Foxtrick.Pages.All.getTeamId(doc);

		let buffer = module.Buffer[teamId];
		if (!buffer.length)
			return;

		let table = doc.createElement('table');
		Foxtrick.addClass(table, 'smallText historystats');
		let tbody = doc.createElement('tbody');
		table.appendChild(tbody);

		let tr = doc.createElement('tr');
		let td = doc.createElement('th');
		td.title = Foxtrick.L10n.getString('HistoryStats.season');
		td.textContent = Foxtrick.L10n.getString('HistoryStats.season.short');
		tr.appendChild(td);
		td = doc.createElement('th');
		td.title = Foxtrick.L10n.getString('HistoryStats.cup');
		td.textContent = Foxtrick.L10n.getString('HistoryStats.cup.short');
		tr.appendChild(td);
		td = doc.createElement('th');
		td.title = Foxtrick.L10n.getString('HistoryStats.league');
		td.textContent = Foxtrick.L10n.getString('HistoryStats.league.short');
		tr.appendChild(td);
		td = doc.createElement('th');
		td.title = Foxtrick.L10n.getString('HistoryStats.finalPosition');
		td.textContent = Foxtrick.L10n.getString('HistoryStats.finalPosition.short');
		tr.appendChild(td);
		tbody.appendChild(tr);

		for (let entry of buffer) {
			let info = entry.split('|');

			let [seas, cupRoundOrDivision, position, league, tmstmp] = info;
			let season = String(parseInt(seas, 10) - module.Offset[teamId]);
			let timestamp = parseInt(tmstmp, 10);

			let className = 'ft-history-stats-row-' + season;

			/** @type {HTMLTableRowElement} */
			let row = tbody.querySelector('.' + className);
			if (!row) {
				row = doc.createElement('tr');
				Foxtrick.addClass(row, className);
				for (let j = 0; j < info.length - 1; j++)
					row.insertCell().textContent = '-';

				tbody.appendChild(row);
			}

			let [seasonCell, cupCell, leagueCell, posCell] = row.cells;
			seasonCell.textContent = season;

			if (league) {
				leagueCell.textContent = league;
				posCell.textContent = position;
			}
			else {
				// only regard the first cup of the season = main cup
				let timestampPrev = parseInt(cupCell.dataset.timestamp, 10) || Infinity;
				if (timestampPrev < timestamp)
					continue;

				cupCell.dataset.timestamp = String(timestamp);
				if (cupRoundOrDivision == '!') {
					cupCell.textContent = '';
					let b = doc.createElement('strong');
					b.title = Foxtrick.L10n.getString('HistoryStats.cupwinner');
					b.textContent = Foxtrick.L10n.getString('HistoryStats.cupwinner.short');
					cupCell.appendChild(b);
				}
				else {
					cupCell.textContent = cupRoundOrDivision;
				}
			}
		}

		// sort by season DESC
		let rows = Foxtrick.toArray(table.rows);
		rows.sort((a, b) => {
			let [aSeason] = a.cells;
			let [bSeason] = b.cells;
			return parseInt(bSeason.textContent, 10) - parseInt(aSeason.textContent, 10);
		});
		Foxtrick.append(tbody, rows);

		let target = doc.getElementById(OWN_BOX_BODY_ID);
		if (target) {
			target.replaceChild(table, target.firstChild);
		}
		else {
			let ownBoxBody = Foxtrick.createFeaturedElement(doc, module, 'div');
			ownBoxBody.id = OWN_BOX_BODY_ID;
			ownBoxBody.appendChild(table);

			let header = Foxtrick.L10n.getString('HistoryStats.boxheader');
			Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, 1);
		}
	},
};
