'use strict';
/*
 * add-class.js
 * Add classes for HTML nodes
 * @author ryanli
 */

Foxtrick.modules.AddClass = {
	CORE_MODULE: true,
	PAGES: ['playerDetails', 'search', 'bookmarks', 'match', 'matchOld', 'transferCompare', 'playerHistory'],
	NICE: -20, // place before all date-related modules

	run: function(doc) {
		if (Foxtrick.isPage(doc, 'playerDetails'))
			this.addDateForTl(doc);
		else if (Foxtrick.isPage(doc, 'playerHistory'))
			this.addDateForFeed(doc);
		else if (Foxtrick.isPage(doc, 'search'))
			this.addDateForTable(doc, doc.getElementById('ctl00_ctl00_CPContent_CPMain' +
			                     '_grdYouthSeries_ctl00'));
		else if (Foxtrick.isPage(doc, 'transferCompare'))
			this.addDateForTable(doc, doc.getElementsByTagName('table')[0]);
		else if (Foxtrick.isPage(doc, 'bookmarks'))
			this.addDateForBookmarks(doc);
		else if (Foxtrick.isPage(doc, 'match') || Foxtrick.isPage(doc, 'matchOld'))
			this.addDateForMatch(doc);
	},

	change: function(doc) {
		this.run(doc);
	},

	replaceInNode: function(doc, parent, timeRe) {
		var node = parent.firstChild;
		while (node) {
			if (node.parentNode.getElementsByClassName('date').length == 0
				&& node.nodeType == Foxtrick.NodeTypes.TEXT_NODE) {

				var texts = node.textContent.match(timeRe);
				if (texts) {
					node.textContent = texts[1];
					var span = doc.createElement('span');
					span.textContent = texts[2];
					span.className = 'date';
					node.parentNode.insertBefore(span, node.nextSibling);
					node.parentNode.insertBefore(doc.createTextNode(texts[3]), span.nextSibling);
					break;
				}
			}
			node = node.nextSibling;
		}
	},

	// add date class for match
	addDateForMatch: function(doc) {
		var mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;

		// start time
		var timeRe = /(.*?)(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+\d{1,2}\D\d{1,2})(.*?)/;
		var parent = mainBody.getElementsByClassName('byline')[0];
		this.replaceInNode(doc, parent, timeRe);
	},
	addDateForFeed: function(doc) {
		var feeds = doc.getElementsByClassName('feed');
		for (var i = 0, feed; i < feeds.length && (feed = feeds[i]); i++) {
			Foxtrick.addClass(feed, 'date');
		}
	},
	// add date class for bookmark
	addDateForBookmarks: function(doc) {
		var mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;

		var timeRe = /(.+?\D+?)(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+\d{1,2}\D\d{1,2})(\D+?.+?)/;
		var cells = mainBody.getElementsByTagName('td');
		Foxtrick.map(function(cell) {
			Foxtrick.modules.AddClass.replaceInNode(doc, cell, timeRe);
		}, cells);
	},

	// add date class for youth league search
	addDateForTable: function(doc, table) {
		if (!table)
			return;

		var timeReFull = /(.+?\D+?)(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+\d{1,2}\D\d{1,2})(\D+?.+?)/;
		var timeReShort = /(.+?\D+?)(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+)(\D+?.+?)/;

		// start time
		var cells = table.getElementsByTagName('td');
		Foxtrick.map(function(cell) {
			if (cell.getElementsByClassName('date').length == 0) {
				if (cell.textContent.search(timeReFull) != -1)
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

		var timeRe = /(.+?\D+?)(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+\d{1,2}\D\d{1,2})(\D+?.+?)/;

		// deadline time
		var dlPar = transferList.getElementsByTagName('p')[0];
		if (!dlPar) return;
		if (dlPar.getElementsByClassName('date').length == 0)
			this.replaceInNode(doc, dlPar, timeRe);

		// reload time
		var firstLine = transferList.getElementsByClassName('float_left')[0];
		if (firstLine.getElementsByClassName('date').length == 0) {
			var timeNode = firstLine.lastChild;
			if (timeNode.textContent.search(timeRe) >= 0) {
				var time = timeNode.textContent.match(timeRe)[1];
				var timePos = timeNode.textContent.search(timeRe);
				var before = timeNode.textContent.substr(0, timePos);
				var after = timeNode.textContent.substr(timePos + time.length);

				var span = doc.createElement('span');
				span.className = 'date';
				span.textContent = time;
				timeNode.parentNode.appendChild(doc.createTextNode(before));
				timeNode.parentNode.appendChild(span);
				timeNode.parentNode.appendChild(doc.createTextNode(after));
				timeNode.parentNode.removeChild(timeNode);
			}
		}
	}
};
