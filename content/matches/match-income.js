'use strict';
/**
 * match-income.js
 * Foxtrick add links to played matches pages
 * @author convinced, ryanli
 */

Foxtrick.modules['MatchIncome'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	OPTIONS: ['UtilizationPercentages'],

	// based on research in post 15703189.1
	PRICE_HISTORY: [
		{
			from: '1997-09-22 00:00',
			until: '2004-10-10 23:59',
			terraces: 5,
			basic: 7.5,
			roof: 10,
			vip: 25,
		},
		{
			from: '2004-10-11 00:00',
			until: '2007-07-15 23:59',
			terraces: 5.5,
			basic: 8,
			roof: 11,
			vip: 27.5,
		},
		{
			from: '2007-07-16 00:00',
			until: '2008-02-24 23:59',
			terraces: 6.5,
			basic: 9.5,
			roof: 13,
			vip: 32.5,
		},
		{
			from: '2008-02-25 00:00',
			until: '2012-06-10 23:59',
			terraces: 6.5,
			basic: 9.5,
			roof: 18,
			vip: 32.5,
		},
		{
			from: '2012-06-11 00:00',
			until: null,
			terraces: 7,
			basic: 10,
			roof: 19,
			vip: 35,
		},
	],
	getPricesForDate: function(matchDate) {
		// use last if we find nothing
		var prices = this.PRICE_HISTORY[this.PRICE_HISTORY.length - 1];

		for (var p of this.PRICE_HISTORY) {
			var from = Foxtrick.util.time.getDateFromText(p.from, 'yyyy-mm-dd');
			var until = Foxtrick.util.time.getDateFromText(p.until, 'yyyy-mm-dd');
			if (until !== null) {
				var already = matchDate.getTime() - from.getTime();
				var upcoming = until.getTime() - matchDate.getTime();
				if (already >= 0 && upcoming >= 0) {
					prices = p;
					break;
				}
			}
		}

		return prices;
	},
	getVisitorMap: function(table) {
		var map = {};

		var rows = [
			'terraces',
			'basic',
			'roof',
			'vip',
		];

		var total = 0;
		for (var i = 0; i < rows.length; i++) {
			map[rows[i]] = Foxtrick.trimnum(table.rows[i].cells[1].textContent);
			total += map[rows[i]];
		}
		map.total = total;

		return map;
	},

	createPieChart: function(doc, ratio) {
		var coords = {
			x: (1 + Math.sin(2 * Math.PI * ratio)) * 8,
			y: (1 - Math.cos(2 * Math.PI * ratio)) * 8,
			large: ratio > 0.5 ? 1 : 0,
		};

		var svg = Foxtrick.createSVG(doc, 'svg');
		svg.height.baseVal.valueAsString = '16px';
		svg.width.baseVal.valueAsString = '16px';
		var svgPath = Foxtrick.createSVG(doc, 'path');
		svg.appendChild(svgPath);
		var props = {
			fill: '#cccccc',
			stroke: '#ffffff',
			'stroke-width': '0.29px',
			d: Foxtrick.format('M8,8L{x},{y}A8,8,0,{large},0,8,0Z', coords),
		};
		for (var prop in props)
			svgPath.setAttribute(prop, props[prop]);

		return svg;
	},

	run: function(doc) {
		var module = this;

		var addTotalAttendance = function(table, visitors) {
			var totalRow = table.insertRow(-1);
			Foxtrick.makeFeaturedElement(totalRow, module);

			var header = totalRow.insertCell(-1);
			header.className = 'ch';
			header.textContent = Foxtrick.L10n.getString('matches.total');

			var count = totalRow.insertCell(-1);
			count.textContent = visitors.total;

			// add a cell here to always fix col spacing
			totalRow.insertCell(-1);

			return totalRow;
		};

		var addIncome = function(table, type, sum, curr) {
			var tr2 = table.insertRow(-1);
			Foxtrick.makeFeaturedElement(tr2, module);

			var td2a = doc.createElement('td');
			td2a.className = 'ch';
			td2a.textContent = Foxtrick.L10n.getString('matches.' + type);
			tr2.appendChild(td2a);

			// convert to local currency
			sum /= curr.rate;
			// get rid of possible fraction
			sum = Math.floor(sum);

			var td2b = doc.createElement('td');
			td2b.className = 'nowrap';
			td2b.textContent = Foxtrick.formatNumber(sum, ' ') + ' ' + curr.symbol;

			// expand income row
			td2b.colSpan = 2;

			tr2.appendChild(td2b);
		};

		if (Foxtrick.Pages.Match.isNT(doc))
			return;

		var table = Foxtrick.filter(function(n) {
			if (n.rows.length != 4)
				return false;
			if (n.rows[0].cells.length < 2)
				return false;
			if (/\d/.test(n.rows[0].cells[0].textContent))
				return false;
			if (!/\d/.test(n.rows[0].cells[1].textContent))
				return false;
			return true;
		}, doc.querySelectorAll('div.reportHighlights > table'))[0];
		if (!table)
			return;

		var visitors = module.getVisitorMap(table);

		var totalRow = addTotalAttendance(table, visitors);
		var graphCell = totalRow.lastChild;

		// find correct price for match
		var matchDate = Foxtrick.Pages.Match.getDate(doc);
		matchDate = Foxtrick.util.time.toHT(doc, matchDate);
		var prices = module.getPricesForDate(matchDate);

		var sum = 0;
		for (var type in visitors)
			if (type in prices)
				sum += prices[type] * visitors[type];

		var isNeutral = Foxtrick.Pages.Match.isNeutral(doc);
		var isQalification = Foxtrick.Pages.Match.isQualification(doc);
		var isCup = Foxtrick.Pages.Match.isCup(doc);
		var isFriendly = Foxtrick.Pages.Match.isFriendly(doc);
		var priceQ = isFriendly || isQalification || isNeutral ? 0.5 : isCup ? 0.67 : 1;

		Foxtrick.util.currency.detect(doc).then(function(curr) {
			addIncome(table, 'income', sum, curr);
			if (priceQ !== 1) {
				addIncome(table, 'income.home', sum * priceQ, curr);
				addIncome(table, 'income.away', sum * (1 - priceQ), curr);
			}

			// display utilization percentage for games that happened after last arena change
			if (!Foxtrick.Prefs.isModuleOptionEnabled('MatchIncome', 'UtilizationPercentages'))
				return;

			var arenaId = Foxtrick.Pages.Match.getArenaId(doc);
			if (!arenaId)
				return;

			var args = [['file', 'arenadetails'], ['version', '1.5'], ['arenaId', arenaId]];
			Foxtrick.util.api.retrieve(doc, args, { cache_lifetime: 'session' },
			  function(xml, errorText) {
				if (!xml || errorText) {
					Foxtrick.log(errorText);
					return;
				}

				// has the arena been altered?
				var rebuildDateAvailable =
					xml.node('RebuiltDate').getAttribute('Available') == 'True';
				if (rebuildDateAvailable) {
					// whether the arena has been rebuilt after the match or not
					var rebuildDate = xml.time('RebuiltDate');
					var playDate = Foxtrick.Pages.Match.getDate(doc);
					var hasChanged = playDate.getTime() < rebuildDate.getTime();

					if (hasChanged)
						return;
				}

				var avail = {
					terraces: xml.num('Terraces'),
					basic: xml.num('Basic'),
					roof: xml.num('Roof'),
					vip: xml.num('VIP'),
					total: xml.num('Total'),
				};

				var rowIdx = 0;
				for (var type in visitors) {
					var capacity = avail[type];
					var usage = visitors[type];

					var row = table.rows[rowIdx];
					var td = Foxtrick.insertFeaturedCell(row, module, -1);
					td.textContent = avail ? (100 * usage / capacity).toFixed(1) + '%' : '-';
					rowIdx++;
				}

				if (avail.total && Foxtrick.util.layout.isSupporter(doc)) {
					var total = visitors.total / avail.total;
					var totalStr = (100 * total).toFixed(0) + '%';
					graphCell.title = totalStr;
					graphCell.appendChild(module.createPieChart(doc, total));
				}

			});

		}).catch(function(reason) {
			Foxtrick.log('WARNING: currency.detect aborted:', reason);
		});

	},
};
