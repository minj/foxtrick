'use strict';

/**
 * history-stats.js
 * Foxtrick team history stats
 * @author spambot
 */

Foxtrick.modules['HistoryStats'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['history'],
	NICE: -1, // before FoxtrickCopyMatchID
	Buffer: {},
	Pages: {},
	Offset: {},

	run: function(doc) {
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		this.Buffer[teamId] = [];
		this.Pages[teamId] = [];
		this._fetch(doc);
		this._paste(doc);
	},

	change: function(doc) {
		this._fetch(doc);
		this._paste(doc);
	},

	// eslint-disable-next-line complexity
	_fetch: function(doc) {
		var module = this;

		var isLgHist = function(a) {
			return /LeagueLevelUnitID/i.test(a.href) &&
				/RequestedSeason/i.test(a.href);
		};
		var isCupHist = function(a) {
			return /actiontype=viewcup/i.test(a.href);
		};
		var isWinnerLink = function(a) {
			return /Club\/Manager\/\?userId/i.test(a.href);
		};
		var removeEl = function(a) {
			a.parentNode.removeChild(a);
		};

		var hasSeasonOffset = function(teamId) {
			return Foxtrick.hasProp(module.Offset, teamId);
		};

		var gotSeasonOffset = function(log, teamId) {
			let feedItems = log.querySelectorAll('.feedItem');
			return Foxtrick.any(function(feedItem) {
				let dateSpan = feedItem.querySelector('.date');
				if (!dateSpan)
					return false;

				/** @type {Element} */
				let row = feedItem.closest('tr');

				let date;
				while (row && !date) {
					let feedItem = row.querySelector('.feedItem');
					if (feedItem) {
						let dateSpan = feedItem.querySelector('.date');
						date = Foxtrick.util.time.getDateFromText(dateSpan.textContent);
					}
					row = row.previousElementSibling;
				}
				if (!date)
					return false;

				let season = Foxtrick.util.time.gregorianToHT(date).season;
				let clone = feedItem.querySelector('td.float_left').cloneNode(true);
				let links = clone.querySelectorAll('a');

				let cupLink = Foxtrick.nth(isCupHist, links);
				if (cupLink) {
					let cupSeason = cupLink.textContent;
					module.Offset[teamId] = parseInt(season, 10) - parseInt(cupSeason, 10);
					return true;
				}
				else if (Foxtrick.any(isLgHist, links)) {
					Foxtrick.forEach(removeEl, links);

					// README: match 2 digits only to guard against position number
					let seriesSeason = clone.textContent.match(/\b\d\d\b/);
					if (seriesSeason) {
						module.Offset[teamId] = parseInt(season, 10) - parseInt(seriesSeason, 10);
						return true;
					}
				}

				return false;

			}, feedItems);
		};

		var teamId = Foxtrick.Pages.All.getTeamId(doc);

		// try to get current page number
		var page;
		try {
			var pager = Foxtrick.getMBElement(doc, 'ucOtherEvents_ucPagerBottom_divWrapper');
			page = parseInt(pager.getElementsByTagName('strong')[0].textContent, 10);
		}
		catch (e) {
			page = 1;
		}

		if (Foxtrick.has(this.Pages[teamId], page))
			return;

		this.Pages[teamId].push(page);
		var log = Foxtrick.getMBElement(doc, 'ucOtherEvents_ctl00');

		// get season offset
		if (!hasSeasonOffset(teamId)) {
			if (!gotSeasonOffset(log, teamId))
				return;
		}

		// eslint-disable-next-line no-extra-parens
		var copy = /** @type {HTMLElement} */ (log.cloneNode(true));
		var events = copy.querySelectorAll('.feedItem td.float_left');
		for (var event of Foxtrick.toArray(events)) {
			// stop if old manager
			if (event.getElementsByClassName('shy').length)
				break;

			var buff = '';
			var series = '-';
			var division = 0;
			var cup = 0;

			/** @type {Element} */
			let row = event.closest('.feedItem').closest('tr');

			let date;
			while (row && !date) {
				let feedItem = row.querySelector('.feedItem');
				if (feedItem) {
					let dateSpan = feedItem.querySelector('.date');
					date = Foxtrick.util.time.getDateFromText(dateSpan.textContent);
				}
				row = row.previousElementSibling;
			}
			if (!date)
				continue;

			let season = Foxtrick.util.time.gregorianToHT(date).season;

			var links = Foxtrick.toArray(event.querySelectorAll('a'));
			for (var link of links) {
				if (isLgHist(link)) {
					series = link.textContent;

					// README: should use Foxtrick.util.id.parseSeries
					// but leagueId is unavailable
					if (/\./.test(series)) {
						var sSplit = series.split('.')[0];
						division = Foxtrick.util.id.romantodecimal(sSplit);
					}
					else {
						division = 1;
					}
				}

				if (isCupHist(link)) {
					Foxtrick.forEach(removeEl, event.querySelectorAll('a'));

					// French/Flemish: '1e'
					cup = event.textContent.match(/\b\d{1,2}(?!\d)/) || '!';
				}
			}

			// league
			if (division) {
				if (Foxtrick.any(isWinnerLink, links)) {
					// skip double entry for winning league
					continue;
				}

				var lSeason = season - this.Offset[teamId];
				var lSeasonRe = new RegExp('\\b' + lSeason + '\\b');
				Foxtrick.forEach(removeEl, event.getElementsByTagName('a'));
				event.textContent = event.textContent.replace(lSeasonRe, '').trim();

				var pos = event.textContent.match(/\b\d{1}(?!\d)/); // French/Flemish: '1e'
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
			if (!Foxtrick.has(this.Buffer[teamId], buff))
				this.Buffer[teamId].push(buff);
		}
	},

	_paste: function(doc) {
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		var buffer = this.Buffer[teamId];
		if (!buffer.length)
			return;

		var table = doc.createElement('table');
		Foxtrick.addClass(table, 'smallText historystats');
		var tbody = doc.createElement('tbody');
		table.appendChild(tbody);

		var tr = doc.createElement('tr');
		var td = doc.createElement('th');
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

		for (var entry of buffer) {
			var info = entry.split('|');

			var season = parseInt(info[0], 10) - this.Offset[teamId];
			var cupRoundOrDivision = info[1];
			var position = info[2];
			var league = info[3];
			var timestamp = info[4];

			var className = 'ft-history-stats-row-' + season;
			var row = tbody.querySelector('.' + className);

			if (!row) {
				row = doc.createElement('tr');
				Foxtrick.addClass(row, className);
				for (var j = 0; j < info.length - 1; j++)
					row.insertCell().textContent = '-';

				tbody.appendChild(row);
				row.cells[0].textContent = season;
			}

			if (league) {
				row.cells[2].textContent = league;
				row.cells[3].textContent = position;
			}
			else {
				// only regard the first cup of the season = main cup
				var timestampPrev = row.cells[1].dataset.timestamp || Infinity;
				if (timestampPrev < timestamp)
					continue;

				row.cells[1].dataset.timestamp = timestamp;
				if (cupRoundOrDivision == '!') {
					row.cells[1].textContent = '';
					var b = doc.createElement('strong');
					b.title = Foxtrick.L10n.getString('HistoryStats.cupwinner');
					b.textContent = Foxtrick.L10n.getString('HistoryStats.cupwinner.short');
					row.cells[1].appendChild(b);
				}
				else {
					row.cells[1].textContent = cupRoundOrDivision;
				}
			}
		}

		// sort by season DESC
		var rows = Foxtrick.toArray(table.rows);
		rows.sort(function(a, b) {
			return parseInt(b.cells[0].textContent, 10) - parseInt(a.cells[0].textContent, 10);
		});
		rows.forEach(function(row) {
			tbody.appendChild(row);
		});

		var OWN_BOX_BODY_ID = 'ft_HistoryStats';
		var target = doc.getElementById(OWN_BOX_BODY_ID);
		if (target) {
			target.replaceChild(table, target.firstChild);
		}
		else {
			var ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			ownBoxBody.id = OWN_BOX_BODY_ID;
			ownBoxBody.appendChild(table);
			var header = Foxtrick.L10n.getString('HistoryStats.boxheader');
			Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, 1);
		}
	},
};
