"use strict";
/*
 * add-class.js
 * Add classes for HTML nodes
 * @author ryanli
 */

Foxtrick.util.module.register({
	MODULE_NAME : "AddClass",
	CORE_MODULE : true,
	PAGES : ["playerdetail", "search", "bookmarks", "match", "transferCompare"],
	NICE : -20, // place before all date-related modules

	run : function(doc) {
		if (Foxtrick.isPage("playerdetail", doc))
			this.addDateForTl(doc);
		else if (Foxtrick.isPage("search", doc))
			this.addDateForTable(doc.getElementById("ctl00_ctl00_CPContent_CPMain_grdYouthSeries_ctl00"));
		else if (Foxtrick.isPage("transferCompare", doc))
			this.addDateForTable(doc.getElementsByTagName("table")[0]);
		else if (Foxtrick.isPage("bookmarks", doc))
			this.addDateForBookmarks(doc);
		else if (Foxtrick.isPage("match", doc))
			this.addDateForMatch(doc);
	},

	change : function(doc) {
		this.run(doc);
	},

	// add date class for match
	addDateForMatch : function(doc) {
		var mainBody = doc.getElementById("mainBody");
		if (!mainBody)
			return;

		var timeRe = /(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+\d{1,2}\D\d{1,2})/;

		// start time
		var cells = mainBody.getElementsByClassName("byline");
		Foxtrick.map(function(cell) { //Foxtrick.log(cell.innerHTML, cell.innerHTML.search(timeRe));
			if (cell.getElementsByClassName("date").length == 0)
				cell.innerHTML = cell.innerHTML.replace(timeRe, "<span class=\"date\">$1</span>");
		}, cells);
	},

	// add date class for bookmark
	addDateForBookmarks : function(doc) {
		var mainBody = doc.getElementById("mainBody");
		if (!mainBody)
			return;

		var timeRe = /(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+\d{1,2}\D\d{1,2})/;

		// start time
		var cells = mainBody.getElementsByTagName("td");
		Foxtrick.map(function(cell) { //Foxtrick.log(cell.innerHTML, cell.search(timeRe));
			if (cell.getElementsByClassName("date").length == 0)
				cell.innerHTML = cell.innerHTML.replace(timeRe, "<span class=\"date\">$1</span>");
		}, cells);
	},

	// add date class for youth league search
	addDateForTable : function(table) {
		if (!table)
			return;

		var timeReFull = /(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+\d{1,2}\D\d{1,2})/;
		var timeReShort = /(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+)/;

		// start time
		var cells = table.getElementsByTagName("td");
		Foxtrick.map(function(cell) {
			if (cell.getElementsByClassName("date").length == 0) {
				if (cell.innerHTML.search(timeReFull) != -1)
					cell.innerHTML = cell.innerHTML.replace(timeReFull, "<span class=\"date\">$1</span>");
				else
					cell.innerHTML = cell.innerHTML.replace(timeReShort, "<span class=\"date\">$1</span>");
			}
		}, cells);
	},

	// add date class for transfer-list
	addDateForTl : function(doc) {
		var transferList = doc.getElementById("ctl00_ctl00_CPContent_CPMain_updBid");
		if (!transferList)
			return;

		var timeRe = /(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+\d{1,2}\D\d{1,2})/;

		// deadline time
		var dlPar = transferList.getElementsByTagName("p")[0];
		if (!dlPar) return;
		if (dlPar.getElementsByClassName("date").length == 0)
			dlPar.innerHTML = dlPar.innerHTML.replace(timeRe, "<span class=\"date\">$1</span>");
		// reload time
		var firstLine = transferList.getElementsByClassName("float_left")[0];
		if (firstLine.getElementsByClassName("date").length == 0) {
			var timeNode = firstLine.lastChild;
			if (timeNode.textContent.search(timeRe) >= 0) {
				var time = timeNode.textContent.match(timeRe)[1];
				var timePos = timeNode.textContent.search(timeRe);
				var before = timeNode.textContent.substr(0, timePos);
				var after = timeNode.textContent.substr(timePos + time.length);

				var span = doc.createElement("span");
				span.className = "date";
				span.textContent = time;
				timeNode.parentNode.appendChild(doc.createTextNode(before));
				timeNode.parentNode.appendChild(span);
				timeNode.parentNode.appendChild(doc.createTextNode(after));
				timeNode.parentNode.removeChild(timeNode);
			}
		}
	}
});
