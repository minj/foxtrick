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

	ATTRIB_NAME: 'estimated',
	run: function(doc) {
		var table = Foxtrick.getMBElement(doc, 'grdYouthSeries_ctl00');
		if (!table || table.hasAttribute(this.ATTRIB_NAME)) {
			return;
		}

		var nowTime = Foxtrick.util.time.getTimeStamp(doc);
		if (nowTime == null) {
			Foxtrick.log('User time missing');
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
			if (cells.length < 3)
				continue;

			var sizeCell = cells[2];
			var size = sizeCell.textContent;
			if (parseInt(size.split('/')[0], 10) === parseInt(size.split('/')[1], 10)) {
				// league is full, check next
				continue;
			}

			var startsCell = cells[3];
			var startsSpan = startsCell.getElementsByClassName('date')[0];
			var date;
			if (startsSpan.dataset.userDate) {
				// node displays local time instead of user time as modified
				// in LocalTime, user time is saved in attribute data-user-date
				date = new Date();
				date.setTime(startsSpan.dataset.userDate);
			}
			else {
				date = Foxtrick.util.time.getDateFromText(startsSpan.textContent);
			}
			var time = date.getTime();

			var MSECS_IN_HOUR = Foxtrick.util.time.MSECS_IN_HOUR;
			var MSECS_IN_DAY = Foxtrick.util.time.MSECS_IN_DAY;
			var MSECS_IN_WEEK = Foxtrick.util.time.DAYS_IN_WEEK * MSECS_IN_DAY;

			var estimationTime;
			if (nowTime < time)
				estimationTime = time; // first season of the series
			else
				estimationTime = time + Math.ceil((nowTime - time) / MSECS_IN_WEEK) * MSECS_IN_WEEK;

			var timeDiff = estimationTime - nowTime;
			var days = Math.floor(timeDiff / MSECS_IN_DAY);
			var daysStr = Foxtrick.L10n.getString('datetimestrings.days', days);
			var hours = Math.floor((timeDiff - days * MSECS_IN_DAY) / MSECS_IN_HOUR);
			var hoursStr = Foxtrick.L10n.getString('datetimestrings.hours', hours);

			var str = '(' + days + ' ' + daysStr + ' ' + hours + ' ' + hoursStr + ')';
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
	},
};
