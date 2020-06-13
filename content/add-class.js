/**
 * add-class.js
 * Add classes for HTML nodes
 * @author ryanli, convincedd, LA-MJ
 */

'use strict';

Foxtrick.modules.AddClass = {
	CORE_MODULE: true,
	PAGES: [
		'playerDetails',
		'playerHistory',
		'search',
		'transferCompare',
		'bookmarks',
		'match',
	],
	NICE: -20, // place before all date-related modules

	/** @param {document} doc */
	run: function(doc) {
		const module = this;
		if (Foxtrick.isPage(doc, 'playerDetails')) {
			module.addDateForTl(doc);
		}
		else if (Foxtrick.isPage(doc, 'playerHistory')) {
			module.addDateForFeed(doc);
		}
		else if (Foxtrick.isPage(doc, 'search')) {
			let table = /** @type {HTMLTableElement} */
				(Foxtrick.getMBElement(doc, 'grdYouthSeries_ctl00'));
			module.addDateForTable(doc, table);
		}
		else if (Foxtrick.isPage(doc, 'transferCompare')) {
			module.addDateForTable(doc, doc.querySelector('#mainBody table'));
		}
		else if (Foxtrick.isPage(doc, 'bookmarks')) {
			module.addDateForBookmarks(doc);
		}
		else if (Foxtrick.isPage(doc, 'match')) {
			module.addDateForMatch(doc);
		}
	},

	/** @param {document} doc */
	change: function(doc) {
		const module = this;
		module.run(doc);
	},

	/**
	 * @param {document} doc
	 * @param {Element} parent
	 * @param {RegExp} timeRe
	 */
	replaceInNode: function(doc, parent, timeRe) {
		let node = parent.firstChild;
		while (node) {
			if (!parent.getElementsByClassName('date').length &&
			    node.nodeType == node.TEXT_NODE) {

				let texts = node.textContent.match(timeRe);
				if (texts) {
					node.textContent = texts[1];
					let span = doc.createElement('span');
					span.textContent = texts[2];
					span.className = 'date';
					parent.insertBefore(span, node.nextSibling);
					parent.insertBefore(doc.createTextNode(texts[3]), span.nextSibling);
					break;
				}
			}
			node = node.nextSibling;
		}
	},

	timeRe: /(^|.*?\D+?)(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+\d{1,2}\D\d{1,2})(\D+?.*?|$)/,
	timeReNoTime: /(^|.*?\D+?)(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+)(\D+?.*?|$)/,

	/**
	 * add date class for match
	 *
	 * @param {document} doc
	 */
	addDateForMatch: function(doc) {
		const module = this;
		var mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;

		// start time
		var parent = mainBody.querySelector('.byline');
		if (!parent)
			return;

		module.replaceInNode(doc, parent, module.timeRe);
	},

	/**
	 * guestbook, player events etc
	 *
	 * @param {document} doc
	 */
	addDateForFeed: function(doc) {
		var feeds = doc.getElementsByClassName('feed');
		for (let feed of feeds)
			Foxtrick.addClass(feed, 'date');
	},

	/**
	 * add date class for bookmark
	 *
	 * @param {document} doc
	 */
	addDateForBookmarks: function(doc) {
		const module = this;
		var mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;

		var cells = mainBody.getElementsByTagName('td');
		for (let cell of cells)
			module.replaceInNode(doc, cell, module.timeRe);
	},

	/**
	 * add date class for youth league search
	 *
	 * @param {document} doc
	 * @param {HTMLTableElement} table
	 */
	addDateForTable: function(doc, table) {
		var module = this;
		if (!table)
			return;

		// start time
		var cells = table.getElementsByTagName('td');
		for (let cell of cells) {
			if (cell.querySelector('.date'))
				return;

			if (module.timeRe.test(cell.textContent))
				module.replaceInNode(doc, cell, module.timeRe);
			else if (module.timeReNoTime.test(cell.textContent))
				module.replaceInNode(doc, cell, module.timeReNoTime);
		}
	},

	/**
	 * add date class for transfer-list
	 *
	 * @param {document} doc
	 */
	addDateForTl: function(doc) {
		var module = this;
		var transferList = Foxtrick.Pages.Player.getBidInfo(doc);
		if (!transferList)
			return;

		// deadline time
		var dlPar = transferList.querySelector('p');
		if (!dlPar)
			return;

		if (!dlPar.getElementsByClassName('date').length)
			module.replaceInNode(doc, dlPar, module.timeRe);

		// reload time
		var firstLine = transferList.querySelector('.float_left');
		if (firstLine)
			module.replaceInNode(doc, firstLine, module.timeRe);
	},
};
