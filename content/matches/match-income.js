/**
 * match-income.js
 * Foxtrick add links to played matches pages
 * @author convinced, ryanli
 */

'use strict';

Foxtrick.modules.MatchIncome = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	OPTIONS: ['UtilizationPercentages'],

	/**
	 * @typedef ArenaSeatMixin
	 * @prop {number} terraces
	 * @prop {number} basic
	 * @prop {number} roof
	 * @prop {number} vip
	 */

	/**
	 * @typedef {ArenaSeatMixin & { total: number }} ArenaVisitorMap
	 */

	/**
	 * @typedef {ArenaSeatMixin & { from: string, until: string }} ArenaPrices
	 */

	// based on research in post 15703189.1
	/** @type {ArenaPrices[]} */
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

	/**
	 * @param  {Date}        matchDate
	 * @return {ArenaPrices}
	 */
	getPricesForDate: function(matchDate) {
		const module = this;

		const HIST = module.PRICE_HISTORY;

		// use last if we find nothing
		let prices = HIST[HIST.length - 1];

		for (let p of HIST) {
			let from = Foxtrick.util.time.getDateFromText(p.from, 'yyyy-mm-dd');
			let until = Foxtrick.util.time.getDateFromText(p.until, 'yyyy-mm-dd');

			if (until !== null) {
				let already = matchDate.getTime() - from.getTime();
				let upcoming = until.getTime() - matchDate.getTime();
				if (already >= 0 && upcoming >= 0) {
					prices = p;
					break;
				}
			}
		}

		return prices;
	},

	/**
	 * @param  {HTMLTableElement} table
	 * @return {ArenaVisitorMap}
	 */
	getVisitorMap: function(table) {
		let rows = [
			'terraces',
			'basic',
			'roof',
			'vip',
		];
		let map = {
			terraces: 0,
			basic: 0,
			roof: 0,
			vip: 0,
			total: 0,
		};

		let total = 0;
		for (let [i, row] of rows.entries()) {
			map[row] = Foxtrick.trimnum(table.rows[i].cells[1].textContent);
			total += map[row];
		}
		map.total = total;

		return map;
	},

	/**
	 * TODO extract into util
	 *
	 * @param  {document}      doc
	 * @param  {number}        ratio
	 * @return {SVGSVGElement}
	 */
	createPieChart: function(doc, ratio) {
		/* eslint-disable no-magic-numbers */
		let coords = {
			x: (1 + Math.sin(2 * Math.PI * ratio)) * 8,
			y: (1 - Math.cos(2 * Math.PI * ratio)) * 8,
			large: ratio > 0.5 ? 1 : 0,
		};
		/* eslint-enable no-magic-numbers */

		let svg = Foxtrick.createSVG(doc, 'svg');
		svg.height.baseVal.valueAsString = '16px';
		svg.width.baseVal.valueAsString = '16px';

		let svgPath = Foxtrick.createSVG(doc, 'path');
		svg.appendChild(svgPath);
		let props = {
			fill: '#cccccc',
			stroke: '#ffffff',
			'stroke-width': '0.29px',
			d: Foxtrick.format('M8,8L{x},{y}A8,8,0,{large},0,8,0Z', coords),
		};
		for (let prop in props)
			svgPath.setAttribute(prop, props[prop]);

		return svg;
	},

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		/**
		 * @param  {HTMLTableElement} table
		 * @param  {ArenaVisitorMap} visitors
		 * @return {HTMLTableRowElement}
		 */
		var addTotalAttendance = function(table, visitors) {
			let totalRow = table.insertRow(-1);
			Foxtrick.makeFeaturedElement(totalRow, module);

			let header = totalRow.insertCell(-1);
			header.className = 'ch';
			header.textContent = Foxtrick.L10n.getString('matches.total');

			let count = totalRow.insertCell(-1);
			count.textContent = visitors.total.toString();

			// add a cell here to always fix col spacing
			totalRow.insertCell(-1);

			return totalRow;
		};

		/**
		 * @param {HTMLTableElement} table
		 * @param {string}           type
		 * @param {number}           sum
		 * @param {Currency}         curr
		 */
		var addIncome = function(table, type, sum, curr) {
			let tr2 = table.insertRow(-1);
			Foxtrick.makeFeaturedElement(tr2, module);

			let td2a = doc.createElement('td');
			td2a.className = 'ch';
			td2a.textContent = Foxtrick.L10n.getString('matches.' + type);
			tr2.appendChild(td2a);

			// convert to local currency
			let s = sum / curr.rate;

			// get rid of possible fraction
			s = Math.floor(s);

			let td2b = doc.createElement('td');
			td2b.className = 'nowrap';
			td2b.textContent = Foxtrick.formatNumber(s, ' ') + ' ' + curr.symbol;

			// expand income row
			td2b.colSpan = 2;

			tr2.appendChild(td2b);
		};

		if (Foxtrick.Pages.Match.isPrematch(doc) || Foxtrick.Pages.Match.isNT(doc))
			return;

		/** @type {NodeListOf<HTMLTableElement>} */
		let tables = doc.querySelectorAll('div.reportHighlights > table');
		var table = Foxtrick.nth(function(t) {
			// eslint-disable-next-line no-magic-numbers
			if (t.rows.length != 4)
				return false;
			if (t.rows[0].cells.length < 2)
				return false;
			if (/\d/.test(t.rows[0].cells[0].textContent))
				return false;
			if (!/\d/.test(t.rows[0].cells[1].textContent))
				return false;
			return true;
		}, tables);

		if (!table)
			return;

		var visitors = module.getVisitorMap(table);

		let totalRow = addTotalAttendance(table, visitors);
		var graphCell = [...totalRow.cells].pop();

		// find correct price for match
		var matchDate = Foxtrick.Pages.Match.getDate(doc);
		if (!matchDate)
			return;

		matchDate = Foxtrick.util.time.toHT(doc, matchDate);
		if (!matchDate)
			return;

		let prices = module.getPricesForDate(matchDate);

		var sum = 0;
		for (let type in visitors) {
			if (type in prices)
				sum += prices[type] * visitors[type];
		}

		let isNeutral = Foxtrick.Pages.Match.isNeutral(doc);
		let isQalification = Foxtrick.Pages.Match.isQualification(doc);
		let isCup = Foxtrick.Pages.Match.isCup(doc);
		let isFriendly = Foxtrick.Pages.Match.isFriendly(doc);

		// eslint-disable-next-line no-nested-ternary, no-magic-numbers
		const PRICE_Q = isFriendly || isQalification || isNeutral ? 0.5 : isCup ? 0.67 : 1;

		Foxtrick.util.currency.detect(doc).then(function(curr) {
			addIncome(table, 'income', sum, curr);
			if (PRICE_Q !== 1) {
				addIncome(table, 'income.home', sum * PRICE_Q, curr);
				addIncome(table, 'income.away', sum * (1 - PRICE_Q), curr);
			}

			// display utilization percentage for games that happened after last arena change
			if (!Foxtrick.Prefs.isModuleOptionEnabled(module, 'UtilizationPercentages'))
				return;

			let arenaId = Foxtrick.Pages.Match.getArenaId(doc);
			if (!arenaId)
				return;

			/** @type {CHPPParams} */
			let args = [['file', 'arenadetails'], ['version', '1.5'], ['arenaId', arenaId]];
			Foxtrick.util.api.retrieve(doc, args, { cache: 'session' }, (xml, errorText) => {
				if (!xml || errorText) {
					Foxtrick.log(errorText);
					return;
				}

				// has the arena been altered?
				let rebuildDateAvailable =
					xml.node('RebuiltDate').getAttribute('Available') == 'True';
				if (rebuildDateAvailable) {
					// whether the arena has been rebuilt after the match or not
					let rebuildDate = xml.time('RebuiltDate');
					let playDate = Foxtrick.Pages.Match.getDate(doc);
					let hasChanged = playDate.getTime() < rebuildDate.getTime();

					if (hasChanged)
						return;
				}

				/** @type {ArenaVisitorMap} */
				var avail = {
					terraces: xml.num('Terraces'),
					basic: xml.num('Basic'),
					roof: xml.num('Roof'),
					vip: xml.num('VIP'),
					total: xml.num('Total'),
				};

				let rowIdx = 0;
				for (let type in visitors) {
					/** @type {number} */
					let capacity = avail[type];

					/** @type {number} */
					let usage = visitors[type];

					let row = table.rows[rowIdx];
					let td = Foxtrick.insertFeaturedCell(row, module, -1);
					td.textContent = capacity ? (100 * usage / capacity).toFixed(1) + '%' : '-';
					rowIdx++;
				}

				if (avail.total && Foxtrick.util.layout.isSupporter(doc)) {
					let total = visitors.total / avail.total;
					let totalStr = (100 * total).toFixed(0) + '%';
					graphCell.title = totalStr;
					graphCell.appendChild(module.createPieChart(doc, total));
				}

				[...table.rows[rowIdx].cells].pop().colSpan++;

			});

		}).catch(function(reason) {
			Foxtrick.log('WARNING: currency.detect aborted:', reason);
		});

	},
};
