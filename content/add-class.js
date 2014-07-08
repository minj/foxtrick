'use strict';
/*
 * add-class.js
 * Add classes for HTML nodes
 * @author ryanli
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
			var table = doc.getElementById('ctl00_ctl00_CPContent_CPMain_grdYouthSeries_ctl00');
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
		var mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;

		// start time
		var timeRe = this.timeRe;
		var parent = mainBody.getElementsByClassName('byline')[0];
		this.replaceInNode(doc, parent, timeRe);
	},
	addDateForFeed: function(doc) {
		var feeds = doc.getElementsByClassName('feed');
		Foxtrick.forEach(function(feed) {
			Foxtrick.addClass(feed, 'date');
		}, feeds);
	},
	// add date class for bookmark
	addDateForBookmarks: function(doc) {
		var mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;

		var timeRe = this.timeRe;
		var cells = mainBody.getElementsByTagName('td');
		Foxtrick.map(function(cell) {
			Foxtrick.modules.AddClass.replaceInNode(doc, cell, timeRe);
		}, cells);
	},

	// add date class for youth league search
	addDateForTable: function(doc, table) {
		if (!table)
			return;

		var timeReFull = this.timeRe;
		var timeReShort = this.timeReNoTime;

		// start time
		var cells = table.getElementsByTagName('td');
		Foxtrick.map(function(cell) {
			if (!cell.getElementsByClassName('date').length) {
				if (timeReFull.test(cell.textContent))
					Foxtrick.modules.AddClass.replaceInNode(doc, cell, timeReFull);
				else
					Foxtrick.modules.AddClass.replaceInNode(doc, cell, timeReShort);
			}
		}, cells);
	},

	// add date class for transfer-list
	addDateForTl: function(doc) {
		var transferList = doc.getElementById('ctl00_ctl00_CPContent_CPMain_updBid');
		if (!transferList)
			return;

		var timeRe = this.timeRe;

		// deadline time
		var dlPar = transferList.getElementsByTagName('p')[0];
		if (!dlPar)
			return;
		if (!dlPar.getElementsByClassName('date').length)
			this.replaceInNode(doc, dlPar, timeRe);

		// reload time
		var firstLine = transferList.getElementsByClassName('float_left')[0];
		if (firstLine)
			this.replaceInNode(doc, firstLine, timeRe);
	}
};
