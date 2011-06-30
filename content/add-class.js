/*
 * add-class.js
 * Add classes for HTML nodes
 * @author ryanli
 */

if (!Foxtrick) var Foxtrick = {};
Foxtrick.AddClass = {
	MODULE_NAME : "AddClass",
	CORE_MODULE : true,
	PAGES : ["playerdetail", "search"],

	run : function(page, doc) {
		if (page == "playerdetail")
			this.addDateForTl(doc);
		else if (page == "search")
			this.addDateForYouthLeagueSearch(doc);
	},

	change : function(page, doc) {
		this.run(page, doc);
	},

	// add date class for youth league search
	addDateForYouthLeagueSearch : function(doc) {
		var table = doc.getElementById("ctl00_ctl00_CPContent_CPMain_grdYouthSeries_ctl00");
		if (!table)
			return;

		const timeRe = /(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+\d{1,2}\D\d{1,2})/;

		// start time
		var cells = table.getElementsByTagName("td");
		Foxtrick.map(cells, function(cell) {
			if (cell.getElementsByClassName("date").length == 0)
			cell.innerHTML = cell.innerHTML.replace(timeRe, "<span class=\"date\">$1</span>");
		});
	},

	// add date class for transfer-list
	addDateForTl : function(doc) {
		var transferList = doc.getElementById("ctl00_ctl00_CPContent_CPMain_updBid");
		if (!transferList)
			return;

		const timeRe = /(\d{1,4}\D\d{1,2}\D\d{1,4}\D?\s+\d{1,2}\D\d{1,2})/;

		// deadline time
		var dlPar = transferList.getElementsByTagName("p")[0];
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
};
