/**
 * current-transfers.js
 * Lists information for players on the transfer overview page.
 * @author LA-MJ
 */

'use strict';

Foxtrick.modules.CurrentTransfers = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['transfer'],

	// CSS: Foxtrick.InternalPath + 'resources/css/current-transfers.css',

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		let players = module.getPlayers(doc);
		if (!players.length)
			return;

		module.runPlayers(doc, players);
	},

	/**
	* @param  {HTMLTableRowElement} row
	* @return {HTMLElement}
	*/
	getPlayerCell(row) {
		let [first, second] = row.cells;
		let playerCell = first;
		if (playerCell.rowSpan != 1)
			playerCell = second;

		return playerCell;
	},

	/**
	* @param  {HTMLTableRowElement} row
	* @return {HTMLElement}
	*/
	getBidCell(row) {
		let playerCell = this.getPlayerCell(row);
		return /** @type {HTMLElement} */ (playerCell.nextElementSibling);
	},

	/**
	 * @param  {HTMLTableRowElement} row
	 * @return {HTMLElement}
	 */
	getInfoDiv(row) {
		let infoRow = row.nextElementSibling;
		let info = infoRow.querySelector('.smallText .shy');
		return info.parentElement;
	},

	/**
	 * @param {document} doc
	 * @param {TransferPlayer[]} players
	 */
	runPlayers: function(doc, players) {
		const module = this;

		// time to add to player deadline for caching
		const CACHE_BONUS = 0;

		/** @type {[CHPPParams, CHPPOpts][]} */
		let entries = players.map(function(player) {
			let cache = player.deadline + CACHE_BONUS;

			return [
				[
					['file', 'playerdetails'],
					['version', '2.5'],
					['playerId', player.id],
				],
				{ cache },
			];
		});

		let pArgs = entries.map(([a]) => a);
		let pOpts = entries.map(([_, o]) => o);

		Foxtrick.util.currency.detect(doc).then(function(curr) {
			// TODO promisify
			Foxtrick.util.api.batchRetrieve(doc, pArgs, pOpts, (xmls, errors) => {
				if (!xmls)
					return;

				/** @type {IterableIterator<[CHPPXML, string, CHPPParams, TransferPlayer]>} */
				// @ts-ignore
				let vals = Foxtrick.zip(xmls, errors, pArgs, players);
				for (let [xml, error, args, p] of vals) {
					if (!xml || error) {
						Foxtrick.log('No XML in batchRetrieve', args, error);
						continue;
					}

					let data = {
						curr,
						args,
						deadline: p.deadline,
						recursion: !!p.recursion,
					};
					module.processXML(doc, xml, data);
				}
			});

		}).catch(function(reason) {
			Foxtrick.log('WARNING: currency.detect aborted:', reason);
		});

	},

	/**
	 * @param  {document} doc
	 * @return {TransferPlayer[]}
	 */
	getPlayers: function(doc) {
		const module = this;
		const EMPTY = [];

		const NOW = Foxtrick.util.time.getHTTimeStamp(doc);
		if (!NOW)
			return EMPTY;

		const table = doc.querySelector('#mainBody table.naked');
		if (!table)
			return EMPTY;

		// transfers table is the worst DOM ever created
		// some rows include <h2> for player grouping
		// other rows .even .odd are for players:
		// two rows per player: 1) player & price; 2) deadline
		/** @type {HTMLTableRowElement[]} */
		let playerRows = Foxtrick.filter(function(row, i) {
			return i % 2 === 0;
		}, table.querySelectorAll('.odd, .even'));

		let memo = new Set();
		return Foxtrick.map((row) => {
			let playerCell = module.getPlayerCell(row);
			let playerLink = playerCell.querySelector('a');

			if (!playerLink)
				return void 0;

			let playerId = Foxtrick.getUrlParam(playerLink.href, 'playerId');
			Foxtrick.addClass(row, 'ft-transfer-' + playerId);
			let id = parseInt(playerId, 10);
			if (memo.has(id)) {
				// same player on different lists
				return void 0;
			}
			memo.add(id);

			let deadline = NOW;

			let nextRow = /** @type {HTMLTableRowElement} */ (row.nextElementSibling);
			let [deadlineCell] = nextRow.cells;
			let date = deadlineCell.querySelector('.date');
			if (date) {
				let ddl = Foxtrick.util.time.getDateFromText(date.firstChild.textContent);
				ddl = Foxtrick.util.time.toHT(doc, ddl);
				deadline = ddl.valueOf();
			}

			let bidCell = module.getBidCell(row);
			let bidLink = bidCell.querySelector('a');
			if (!bidLink) {
				// no current bid, adding for CHPP
				return { id, deadline };
			}

			return void 0;
		}, playerRows).filter(Boolean);
	},

	/**
	 * @typedef TransferOpts
	 * @prop {CHPPParams} args
	 * @prop {boolean} recursion
	 * @prop {number} deadline
	 * @prop {Currency} curr
	 */
	/**
	 * @typedef TransferPlayer
	 * @prop {number} id
	 * @prop {number} deadline
	 * @prop {boolean} [recursion]
	 */

	/**
	 * @param {document} doc
	 * @param {CHPPXML} xml
	 * @param {TransferOpts} opts
	 */
	processXML: function(doc, xml, opts) {
		const module = this;

		var id = xml.num('PlayerID');
		var result;

		try {
			let { rate, symbol } = opts.curr;
			let price = xml.money('AskingPrice', rate);
			result = Foxtrick.formatNumber(price, '\u00a0') + ' ' + symbol;
		}
		catch (e) {
			// no AskingPrice => stale CHPP
			result = Foxtrick.L10n.getString('status.unknown');

			let { recursion, deadline, args } = opts;
			let now = Foxtrick.util.time.getHTTimeStamp(doc);
			Foxtrick.util.api.setCacheLifetime(JSON.stringify(args), now);


			// try to recurse once
			if (!recursion) {
				module.runPlayers(doc, [{ id, deadline, recursion: true }]);
				return;
			}
		}

		const OPENING_PRICE = Foxtrick.L10n.getString('CurrentTransfers.openingPrice');

		/** @type {NodeListOf<HTMLTableRowElement>} */
		let rows = doc.querySelectorAll('.ft-transfer-' + id);
		for (let row of rows) {
			let bidCell = module.getBidCell(row);

			/** @type {HTMLSpanElement} */
			let resultSpan = bidCell.querySelector('span.shy');
			if (!resultSpan)
				continue;

			Foxtrick.makeFeaturedElement(resultSpan, module);
			Foxtrick.addClass(resultSpan, 'ft-transfers-price');
			resultSpan.textContent = OPENING_PRICE + ': ' + result;

			resultSpan.remove();
			for (let tN of Foxtrick.getTextNodes(bidCell)) {
				if (/^[\s()]+$/.test(tN.textContent))
					tN.textContent = '';
			}

			let infoDiv = module.getInfoDiv(row);
			Foxtrick.prependChild(resultSpan, infoDiv);
		}
	},
};
