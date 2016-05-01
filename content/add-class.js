'use strict';
/*
 * add-class.js
 * Add classes for HTML nodes
 * @author ryanli, convincedd, LA-MJ
 */

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

	run: function(doc) {
		if (Foxtrick.isPage(doc, 'playerDetails'))
			this.addDateForTl(doc);
		else if (Foxtrick.isPage(doc, 'playerHistory'))
			this.addDateForFeed(doc);
		else if (Foxtrick.isPage(doc, 'search')) {
			var table = Foxtrick.getMBElement(doc, 'grdYouthSeries_ctl00');
			this.addDateForTable(doc, table);
		}
		else if (Foxtrick.isPage(doc, 'transferCompare'))
			this.addDateForTable(doc, doc.querySelector('#mainBody table'));
		else if (Foxtrick.isPage(doc, 'bookmarks'))
			this.addDateForBookmarks(doc);
		else if (Foxtrick.isPage(doc, 'match'))
			this.addDateForMatch(doc);
	},

	change: function(doc) {
		this.run(doc);
	},

	replaceInNode: function(doc, parent, timeRe) {
		var node = parent.firstChild;
		while (node) {
			if (!parent.getElementsByClassName('date').length &&
			    node.nodeType == Foxtrick.NodeTypes.TEXT_NODE) {

				var texts = node.textContent.match(timeRe);
				if (texts) {
					node.textContent = texts[1];
					var span = doc.createElement('span');
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

	// add date class for match
	addDateForMatch: function(doc) {
		var module = this;
		var mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;

		// start time
		var parent = mainBody.getElementsByClassName('byline')[0];
		module.replaceInNode(doc, parent, module.timeRe);
	},

	// guestbook, player events etc
	addDateForFeed: function(doc) {
		var feeds = doc.getElementsByClassName('feed');
		Foxtrick.forEach(function(feed) {
			Foxtrick.addClass(feed, 'date');
		}, feeds);
	},

	// add date class for bookmark
	addDateForBookmarks: function(doc) {
		var module = this;
		var mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;

		var cells = mainBody.getElementsByTagName('td');
		Foxtrick.map(function(cell) {
			module.replaceInNode(doc, cell, module.timeRe);
		}, cells);
	},

	// add date class for youth league search
	addDateForTable: function(doc, table) {
		var module = this;
		if (!table)
			return;

		// start time
		var cells = table.getElementsByTagName('td');
		Foxtrick.map(function(cell) {
			if (cell.querySelector('.date'))
				return;

			if (module.timeRe.test(cell.textContent))
				module.replaceInNode(doc, cell, module.timeRe);
			else if (module.timeReNoTime.test(cell.textContent))
				module.replaceInNode(doc, cell, module.timeReNoTime);
		}, cells);
	},

	// add date class for transfer-list
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
