'use strict';
/**
 * history-stats.js
 * Foxtrick team history stats
 * @author spambot
 */
////////////////////////////////////////////////////////////////////////////////
Foxtrick.modules['HistoryStats'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['history'],
	NICE: -1,  // before FoxtrickCopyMatchID
	Buffer: {},
	Pages: {},
	Offset: {},

	run: function(doc) {
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		this.Buffer[teamId] = [];
		this.Pages[teamId] = [];
		this.Offset[teamId] = 0;
		this._fetch(doc);
		this._paste(doc);
	},

	change: function(doc) {
		this._fetch(doc);
		this._paste(doc);
	},

	_fetch: function(doc) {
		try {
			var teamId = Foxtrick.Pages.All.getTeamId(doc);
			// try to get current page number
			try {
				var pager = doc.getElementById('ctl00_ctl00_CPContent_CPMain_' +
				                               'ucOtherEvents_ucPagerBottom_divWrapper');
				var page = parseInt(pager.getElementsByTagName('strong')[0].textContent, 10);
			}
			catch (e) {
				var page = 1;
			}
			if (!Foxtrick.has(this.Pages[teamId], page)) {
				this.Pages[teamId].push(page);

				// get season offset
				try {
					var a = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucOtherEvents_ctl00')
						.getElementsByTagName('a');
					for (var i = 0; i < a.length; i++) {
						if (a[i].href.search(/viewcup/) > -1) {
							var check_season = a[i].textContent;

							if (a[i].parentNode.parentNode.getElementsByClassName('date')
							    .length > 0) {
								var season = a[i].parentNode.parentNode
									.getElementsByClassName('date')[0].textContent;
								var date = Foxtrick.util.time.getDateFromText(season);
								season = Foxtrick.util.time.gregorianToHT(date).season;
								this.Offset[teamId] = parseInt(season, 10) - parseInt(check_season, 10);
								break;
							}
						}
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}

				var table = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucOtherEvents_ctl00')
					.cloneNode(true).getElementsByClassName('otherEventText');
				for (var i = 0; i < table.length; i++) {
					if (table[i].getElementsByClassName('shy').length != 0)
						break;

					var buff = '';
					var league = -1;
					var leagueN = -1;
					var season = -1;
					var cup = -1;
					var winner_this = false;
					if (table[i].parentNode.getElementsByClassName('date').length)
						season = table[i].parentNode.getElementsByClassName('date')[0].textContent;
					var date = Foxtrick.util.time.getDateFromText(season);
					try {
						season = Foxtrick.util.time.gregorianToHT(date).season;
					} catch (e) {
						// in case it's an empty entry.
						// as of now that's for tournaments on productions
						continue;
					}
					var as = table[i].getElementsByTagName('a');
					var isLgHist = function(a) {
						return (a.href.search(/LeagueLevelUnitID/i) > -1)
							&& (a.href.search(/RequestedSeason/i) > -1);
					};
					var isCupHist = function(a) {
						return (a.href.search(/actiontype=viewcup/i) > -1);
					};
					var isWinnerAny = function(a) {
						return (a.href.search(/Club\/Manager\/\?userId/i) > -1);
					};
					for (var j = 0; j < as.length; j++) {
						if (isWinnerAny(as[j])) {
							// this entry is for winning something
							winner_this = true;
						}
					}
					for (var j = 0; j < as.length; j++) {
						if (isLgHist(as[j])) {
							league = as[j].textContent;
							var leagueN = league;
							if (league.search(/\./) > -1) {
								league = league.split('.')[0];
								league = Foxtrick.util.id.romantodecimal(league);
							}
							else {
								league = 1;
							}
						}
						if (isCupHist(as[j])) {
							while (table[i].getElementsByTagName('a')[0]) {
								table[i].removeChild(table[i].getElementsByTagName('a')[0]);
							}
							cup = table[i].textContent.match(/\d{1,2}/);
							if (!cup)
								cup = '!';
						}
					}
					//league
					if (league != -1) {

						if (winner_this)
							// double entry for winning league skipped
							continue;

						try {
							while (table[i].getElementsByTagName('a')[0])
								table[i].removeChild(table[i].getElementsByTagName('a')[0]);
						}
						catch (e_rem) {}
						table[i].innerHTML =
							table[i].innerHTML.replace(season - this.Offset[teamId], '').trim();
						var pos = table[i].textContent.match(/\d{1}/);
						buff = season + '|' + league + '|' + pos + '|' + leagueN;
						if (!Foxtrick.has(this.Buffer[teamId], buff))
							this.Buffer[teamId].push(buff);
					}
					else if (cup != -1) {
						buff = season + '|' + cup;
						if (!Foxtrick.has(this.Buffer[teamId], buff))
							this.Buffer[teamId].push(buff);
					}
				}
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	_paste: function(doc) {
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		if (this.Buffer[teamId].length === 0)
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

		for (var i = 0; i < this.Buffer[teamId].length; i++) {
			var info = this.Buffer[teamId][i].split('|');
			var season = parseInt(info[0], 10) - this.Offset[teamId];
			var cup = info[1];
			var position = info[2];
			var league = info[3];
			var className = 'ft-history-stats-row-' + season;
			var row = tbody.querySelector('.' + className);

			if (!row) {
				row = doc.createElement('tr');
				Foxtrick.addClass(row, className);
				for (var j = 0; j < 4; j++) {
					row.insertCell();
				}
				tbody.appendChild(row);
				row.cells[0].textContent = season;
				row.cells[1].textContent =
					row.cells[2].textContent = row.cells[3].textContent = '-';
			}
			if (league) {
				row.cells[2].textContent = league;
				row.cells[3].textContent = position;
			}
			else {
				if (cup != '!')
					row.cells[1].textContent = cup;
				else {
					row.cells[1].textContent = '';
					var b = doc.createElement('strong');
					b.title = Foxtrick.L10n.getString('HistoryStats.cupwinner');
					b.textContent = Foxtrick.L10n.getString('HistoryStats.cupwinner.short');
					row.cells[1].appendChild(b);
				}
			}
		}

		var target = doc.getElementById('ft_HistoryStats');
		if (target === null) {
			var ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
			var header = Foxtrick.L10n.getString('HistoryStats.boxheader');
			var ownBoxBodyId = 'ft_HistoryStats';
			ownBoxBody.setAttribute('id', ownBoxBodyId);
			ownBoxBody.appendChild(table);
			Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, 1);
		}
		else {
			target.replaceChild(table, target.firstChild);
		}
	}
};
