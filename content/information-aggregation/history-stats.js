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
	Buffer: [],
	Pages: [],
	Offset: 0,

	run: function(doc) {
		this.Buffer = [];
		this.Pages = [];
		this._fetch(doc);
		this._paste(doc);
	},

	change: function(doc) {
		this._fetch(doc);
		this._paste(doc);
	},

	_fetch: function(doc) {
		try {
			// try to get current page number
			try {
				var pager = doc.getElementById('ctl00_ctl00_CPContent_CPMain_' +
				                               'ucOtherEvents_ucPagerBottom_divWrapper');
				var page = parseInt(pager.getElementsByTagName('strong')[0].textContent, 10);
			}
			catch (e) {
				var page = 1;
			}
			if (!Foxtrick.member(page, this.Pages)) {
				this.Pages.push(page);

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
								this.Offset = parseInt(season, 10) - parseInt(check_season, 10);
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
								cup = "<span class='bold' title='" +
									Foxtrickl10n.getString('HistoryStats.cupwinner') + "'>" +
									Foxtrickl10n.getString('HistoryStats.cupwinner.short') +
									'</span>';
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
						table[i].innerHTML = Foxtrick.trim(table[i].innerHTML
						                                   .replace(season - this.Offset, ''));
						var pos = table[i].textContent.match(/\d{1}/);
						buff = season + '|' + league + '|' + pos + '|' + leagueN;
						if (!Foxtrick.member(buff, this.Buffer))
							this.Buffer.push(buff);
					}
					else if (cup != -1) {
						buff = season + '|' + cup;
						if (!Foxtrick.member(buff, this.Buffer))
							this.Buffer.push(buff);
					}
				}
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	_paste: function(doc) {
		if (this.Buffer.length == 0)
			return;
		try {
			var HistoryTable = '<tr>' +
				"<th title='" + Foxtrickl10n.getString('HistoryStats.season') + "'>" +
				Foxtrickl10n.getString('HistoryStats.season.short') + '</th>' +
				"<th title='" + Foxtrickl10n.getString('HistoryStats.cup') + "'>" +
				Foxtrickl10n.getString('HistoryStats.cup.short') + '</th>' +
				"<th title='" + Foxtrickl10n.getString('HistoryStats.league') + "'>" +
				Foxtrickl10n.getString('HistoryStats.league.short') + '</th>' +
				"<th title='" + Foxtrickl10n.getString('HistoryStats.finalPosition') + "'>" +
				Foxtrickl10n.getString('HistoryStats.finalPosition.short') + '</th></tr>';

			var last = -1;
			for (var i = 0; i < this.Buffer.length; i++) {
				var dummy = this.Buffer[i].split('|');
				dummy[0] = parseInt(dummy[0], 10) - this.Offset + '|';
				var line = '<tr><td>%s' + dummy[0] + '</td><td>%c' + dummy[0] + '</td><td>%l' +
					dummy[0] + '</td><td>%p' + dummy[0] + '</td></tr>';

				if (last == -1 || last != dummy[0]) {
					HistoryTable += line;
				}


				HistoryTable = HistoryTable.replace('%s' + dummy[0], dummy[0]);

				if (dummy[3]) {
					HistoryTable = HistoryTable.replace('%p' + dummy[0], dummy[2]);
					HistoryTable = HistoryTable.replace('%l' + dummy[0], dummy[3]);
				} else {
					HistoryTable = HistoryTable.replace('%c' + dummy[0], dummy[1]);
				}

				last = dummy[0];
			}
			var	table = doc.createElement('table');
			table.setAttribute('class', 'smallText historystats');
			HistoryTable = HistoryTable.replace(/%[cpl]\d{1,2}/gi, '-').replace(/\|/g, '');
			table.innerHTML = HistoryTable;

			if (doc.getElementById('ft_HistoryStats') === null) {
				var	ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
				var header = Foxtrickl10n.getString('HistoryStats.boxheader');
				var ownBoxBodyId = 'ft_HistoryStats';
				ownBoxBody.setAttribute('id', ownBoxBodyId);
				ownBoxBody.appendChild(table);
				Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, 1);
			}
			else doc.getElementById('ft_HistoryStats').firstChild.innerHTML = table.innerHTML;
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
};
