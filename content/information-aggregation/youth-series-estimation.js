'use strict';
/*
 * youth-series-estimation.js
 * Estimation of start time of youth series
 * @author ryanli
 */

Foxtrick.modules['YouthSeriesEstimation'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['search'],
	CSS: Foxtrick.InternalPath + 'resources/css/youth-series-estimation.css',

	TABLE_ID: 'ctl00_ctl00_CPContent_CPMain_grdYouthSeries_ctl00',
	ATTRIB_NAME: 'estimated',

	run: function(doc) {
		var table = doc.getElementById(this.TABLE_ID);
		if (!table || table.hasAttribute(this.ATTRIB_NAME)) {
			return;
		}
		var tbody;
		for (var i = 0; i < table.childNodes.length; ++i) {
			if (table.childNodes[i].nodeName.toLowerCase() === 'tbody') {
				tbody = table.childNodes[i];
				break;
			}
		}
		var rows = tbody.getElementsByTagName('tr');
		for (var i = 0; i < rows.length; ++i) {
			var row = rows[i];
			var cells = row.getElementsByTagName('td');

			var sizeCell = cells[2];
			var size = sizeCell.textContent;
			if (parseInt(size.split('/')[0], 10) === parseInt(size.split('/')[1], 10)) {
				// league is full, check next
				continue;
			}

			var startsCell = cells[3];
			var startsSpan = startsCell.getElementsByClassName('date')[0];
			if (startsSpan.hasAttribute('x-ht-date')) {
				// node displays local time instead of HT time as modified
				// in LocalTime, HT time is saved in attribute x-ht-date
				var date = new Date();
				date.setTime(startsSpan.getAttribute('x-ht-date'));
			}
			else {
				var date = Foxtrick.util.time.getDateFromText(startsSpan.textContent);
			}
			var time = date.getTime();
			var nowTimeText = doc.getElementById('time').textContent;
			var nowTime = Foxtrick.util.time.getDateFromText(nowTimeText).getTime();

			var timeHour = 60 * 60 * 1000;
			var timeDay = 24 * timeHour;
			var timeWeek = 7 * timeDay;

			var estimationTime;
			if (nowTime < time)
				estimationTime = time; // first season of the series
			else
				estimationTime = time + Math.ceil((nowTime - time) / (timeWeek)) * timeWeek;

			var timeDiff = estimationTime - nowTime;
			var days = Math.floor(timeDiff / timeDay);
			var hours = Math.floor((timeDiff - days * timeDay) / timeHour);

			var str = '(' + days + ' ' + Foxtrickl10n.getString('datetimestrings.days', days) + ' '
			            + hours + ' ' + Foxtrickl10n.getString('datetimestrings.hours', hours) + ')';
			var info = Foxtrick.createFeaturedElement(doc, this, 'span');
			info.className = 'ft-youth-series-estimation';
			info.textContent = str;
			if (days < 2) { // minimum 1 day
				Foxtrick.addClass(info, 'near-start');
			}
			startsCell.appendChild(info);
		}
		table.setAttribute(this.ATTRIB_NAME, this.ATTRIB_NAME);
	},

	change: function(doc) {
		this.run(doc);
	}
};
