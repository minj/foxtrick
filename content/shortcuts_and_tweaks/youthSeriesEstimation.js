/*
 * youthSeriesEstimation.js
 * Estimation of start time of youth series
 * @author ryanli
 */

var FoxtrickYouthSeriesEstimation = {
	MODULE_NAME : "YouthSeriesEstimation",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["search"],
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.3",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	LATEST_CHANGE : "Repaired prediction when series start in the future.",

	TABLE_ID : "ctl00_CPMain_grdYouthSeries_ctl00",
	ATTRIB_NAME : "estimated",

	run : function(page, doc) {
		var table = doc.getElementById(this.TABLE_ID);
		if (!table || table.hasAttribute(this.ATTRIB_NAME)) {
			return;
		}
		var tbody;
		for (var i = 0; i < table.childNodes.length; ++i) {
			if (table.childNodes[i].nodeName.toLowerCase() === "tbody") {
				tbody = table.childNodes[i];
				break;
			}
		}
		var rows = tbody.getElementsByTagName("tr");
		for (var i = 0; i < rows.length; ++i) {
			var row = rows[i];
			var cells = row.getElementsByTagName("td");

			var sizeCell = cells[2];
			var size = sizeCell.textContent;
			if (parseInt(size.split("/")[0]) === parseInt(size.split("/")[1])) {
				// league is full, check next
				continue;
			}

			var firstMatchCell = cells[3];
			var date = Foxtrick.getDateFromText(firstMatchCell.textContent);
			var time = date.getTime();
			var nowTimeText = doc.getElementById("time").textContent;
			var nowTime = Foxtrick.getDateFromText(nowTimeText).getTime();

			const timeHour = 60 * 60 * 1000;
			const timeDay = 24 * timeHour;
			const timeWeek = 7 * timeDay;

			var estimationTime;
			if (nowTime < time)
				estimationTime = time; // first season of the series
			else
				estimationTime = time + Math.ceil((nowTime - time) / (timeWeek)) * timeWeek;

			var timeDiff = estimationTime - nowTime;
			var days = Math.floor(timeDiff / timeDay);
			var hours = Math.floor((timeDiff - days * timeDay) / timeHour);

			var str = "(" + days + " " + Foxtrickl10n.getString("foxtrick.datetimestrings.days") + " " + hours + " " + Foxtrickl10n.getString("foxtrick.datetimestrings.hours") + ")";
			var info = doc.createElement("span");
			info.className = "ft-youth-series-estimation";
			info.textContent = str;
			if (days < 1) {
				Foxtrick.addClass(info, "near-start");
			}
			firstMatchCell.appendChild(info);
		}
		table.setAttribute(this.ATTRIB_NAME, this.ATTRIB_NAME);
	},

	change : function(page, doc) {
		this.run(page, doc);
	}
};
