'use strict';
/*
 * time.js
 * Utilities for date and time
 */

if (!Foxtrick) var Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};

Foxtrick.util.time = {
	/* Returns the date format of Hattrick, with 'd', 'm', and 'y'
	 * indicating day, month, and year respectively
	 */
	getDateFormat: function() {
		return Foxtrick.Prefs.getString('htDateFormat');
	},

	/* Sets the date format of Hattrick */
	setDateFormat: function(format) {
		Foxtrick.Prefs.setString('htDateFormat', format);
	},

	/* Returns date format for printing, like 'dd-mm-YYYY HH:MM:SS'
	 * dd: date
	 * mm: month
	 * YYYY: year
	 * HH: hour
	 * MM: minute
	 * SS: second
	 */
	getPrintDateFormat: function() {
		return Foxtrick.util.time.getDateFormat().replace(RegExp('y', 'g'), 'Y') + ' HH:MM:SS';
	},

	/*
		Returns HT week and season like { season: 37, week: 15 }
		date is a JavaScript Date object
	*/
	gregorianToHT: function(date, weekdayOffset, useLocal) {
		// 22th Aug 1997 should be the first day of first season by calculation
		var origin = new Date(1997, 8, 22);
		weekdayOffset = parseInt(weekdayOffset, 10) || 0;
		var msDiff = date.getTime() - origin.getTime();
		var dayDiff = msDiff / 1000 / 60 / 60 / 24 - weekdayOffset;
		var season = Math.floor(dayDiff / (16 * 7)) + 1;
		if (useLocal)
			season -= this.getSeasonOffset();
		var week = Math.floor((dayDiff % (16 * 7)) / 7) + 1;

		return { season: season, week: week };
	},

	getDateFromText: function(text, dateFormat) {
		/*
			Returns Date object for given text.
			Text could be like dd-mm-yyyy, mm-dd-yyyy or yyyy-mm-dd
			according to date format setting,
			trailing minute:second is optional,
			while separator and leading zero are irrelevant.
		*/
		try {
			var DATEFORMAT = dateFormat || this.getDateFormat();
			if (DATEFORMAT.indexOf('y') != 0) {
				// day or month first
				var reLong = /(\d{1,2})\D(\d{1,2})\D(\d{4})\D?\s+(\d{2})\D(\d{2})/;
				var reShort = /(\d{1,2})\D(\d{1,2})\D(\d{4})/;
			}
			else {
				// four-digit year first
				var reLong = /(\d{4})\D(\d{1,2})\D(\d{1,2})\D?\s+(\d{2})\D(\d{2})/;
				var reShort = /(\d{4})\D(\d{1,2})\D(\d{1,2})/;
			}
			var matches;
			if (text.match(reLong))
				matches = text.match(reLong);
			else if (text.match(reShort))
				matches = text.match(reShort);
			else
				return null;

			for (var i = 1; i < matches.length; ++i)
				matches[i] = parseInt(matches[i], 10); // leading zero -> octal

			if (DATEFORMAT.indexOf('d') == 0) {
				// like dd-mm-yyyy
				var day = matches[1];
				var month = matches[2];
				var year = matches[3];
			}
			else if (DATEFORMAT.indexOf('m') == 0) {
				// like mm-dd-yyyy
				var day = matches[2];
				var month = matches[1];
				var year = matches[3];
			}
			else if (DATEFORMAT.indexOf('y') == 0) {
				// like yyyy-mm-dd
				var day = matches[3];
				var month = matches[2];
				var year = matches[1];
			}
			var hour = (matches.length == 6) ? matches[4] : 0;
			var minute = (matches.length == 6) ? matches[5] : 0;

			if ((0 <= minute < 60) && (0 <= hour < 24) && (0 <= day <= 31)
				&& (1 <= month <= 12) && (1970 < year)) {
				// check validity of values
				var date = new Date(year, month - 1, day, hour, minute);
				return date;
			}
		}
		catch (e) {
			// don't throw errors, just return null
			return null;
		}
	},

	/* returns whether text has date and time (hours and minutes) in it */
	hasTime: function(text, dateFormat) {
		dateFormat = dateFormat || this.getDateFormat();
		if (dateFormat.indexOf('y') != 0) {
			// day or month first
			var re = /(\d{1,2})\D(\d{1,2})\D(\d{4})\D?\s+(\d{2})\D(\d{2})/;
		}
		else {
			// four-digit year first
			var re = /(\d{4})\D(\d{1,2})\D(\d{1,2})\D?\s+(\d{2})\D(\d{2})/;
		}
		return (text.match(re) != null);
	},

	getHtTimeStamp: function(doc) {
		try {
			return Date.parse(Foxtrick.util.time.getHtDate(doc));
		}
		catch (e) {
			return null;
		}
	},

	getHtDate: function(doc) {
		try {
			var time = doc.getElementById('time').textContent;
			var date = Foxtrick.util.time.getDateFromText(time);
			return date;
		}
		catch (e) {
			return null;
		}
	},

	// Return timezone difference from HT time to local time in hours
	// For example, if HT time is GMT+1 while local time is GMT+8,
	// this function would return 7.
	timezoneDiff: function(doc) {
		var htDate = Foxtrick.util.time.getHtDate(doc);
		if (!htDate)
			return null;
		var date = new Date();
		// time zone difference is a multiple of 15 minutes
		var diff = Math.round(((date - htDate) / 1000 / 60 / 60) * 4) / 4;
		return diff;
	},

	getSeasonOffset: function() {
		var country = Foxtrick.Prefs.getString('htCountry'), i;
		for (i in Foxtrick.XMLData.League) {
			if (country == Foxtrick.XMLData.League[i].EnglishName) {
				var offset = Foxtrick.XMLData.League[i].SeasonOffset;
				return -offset;
			}
		}
	},

	addDaysToDate: function(date, days) {
		var timestamp = date.getTime();
		timestamp += days * 24 * 60 * 60 * 1000;
		var ret = new Date();
		ret.setTime(timestamp);
		return ret;
	},

	fill: function(str, length) {
		var s = String(str);
		var i = 0;
		if (s.length < length)
			while (i++ < length - s.length)
				s = '0' + s;
		return s;
	},

	/* returns a string representing date given as argument
	 * if date is not set, return current date
	 * showTime specifies whether to show time
	 * showSecs specifies whether to show seconds
	 */
	buildDate: function(date, showTime, showSecs) {
		var format = this.getPrintDateFormat();
		if (!date)
			date = new Date();
		if (!showTime) {
			// presume date is before time in format
			var string = format.replace(/\s+.+$/, '');
		}
		else if (!showSecs) {
			// presume seconds are in final position with only one separator
			var string = format.replace(/.S+$/, '');
		}
		else
			var string = format;

		string = string.replace(/YYYY/g, date.getFullYear());
		string = string.replace(/mm/g, this.fill(date.getMonth() + 1, 2));
		string = string.replace(/m/g, date.getMonth() + 1);
		string = string.replace(/dd/g, this.fill(date.getDate(), 2));
		string = string.replace(/d/g, date.getDate(), 2);
		string = string.replace(/HH/g, this.fill(date.getHours(), 2));
		string = string.replace(/H/g, date.getHours(), 2);
		string = string.replace(/MM/g, this.fill(date.getMinutes(), 2));
		string = string.replace(/M/g, date.getMinutes());
		string = string.replace(/SS/g, this.fill(date.getSeconds(), 2));
		string = string.replace(/S/g, date.getSeconds());

		return string;
	},

	/*
	 * e.g. 20120727T000900, not adjusted to UTC
	 */
	toBareISOString: function(date) {
		var ret = '';
		ret +=
			date.getFullYear() +
			this.fill((date.getMonth() + 1), 2) +
			this.fill(date.getDate(), 2) + 'T' +
			this.fill(date.getHours(), 2) +
			this.fill(date.getMinutes(), 2) +
			this.fill(date.getSeconds(), 2);
		return ret;
	},

	timeDifferenceToElement: function(doc, time_sec, useShort, useFull) {
		var org_time = time_sec;
		// Returns the time differnce as DDD days, HHh MMm
		// if useShort, only DDD day(s) will be returned
		// if useFull && useShort, show S W D always

		var datespan = doc.createElement('span');
		datespan.className = 'nowrap';
		var Days = 0; var Minutes = 0; var Hours = 0;

		if (Math.floor(time_sec) < 0)
			return 'NaN';

		//days
		if (time_sec >= 86400) {
			Days = Math.floor(time_sec / 86400);
			time_sec = time_sec - Days * 86400;
			datespan.textContent += Days + '' + Foxtrick.L10n.getString('datetimestrings.days', Days);
		}
		// only days returned
		if (useShort) {
			var display_option = Foxtrick.Prefs.getInt('module.ExtendedPlayerDetails.value');
			if (display_option == null) var display_option = 0;
			var PJD_D = Math.floor(org_time / 86400);
			var PJD_W = Math.floor(PJD_D / 7);
			var PJD_S = Math.floor(PJD_D / (16 * 7));
			var print_S = ''; var print_W = ''; var print_D = '';
			try {
				switch (display_option) { //('SWD', 'SW', 'SD', 'WD', 'D')
					case 0: //SWD
						print_S = PJD_S;
						print_W = PJD_W - (print_S * 16);
						print_D = PJD_D - (print_S * 16 * 7) - (print_W * 7);
					break;

					case 1: //SW
						print_S = PJD_S;
						print_W = PJD_W - (print_S * 16);
						break;

					case 2: //SD
						print_S = PJD_S;
						print_D = PJD_D - (print_S * 16 * 7);
					break;

					case 3: //WD
						print_W = PJD_W;
						print_D = PJD_D - (print_W * 7);
					break;

					case 4: //D
						print_D = PJD_D;
					break;
				} // switch
			} // try
			catch (e) { }

			datespan.textContent = '';
			if (print_S != 0 || useFull) {
				var b = doc.createElement('b');
				b.textContent = print_S;
				datespan.appendChild(b);
				datespan.appendChild(doc.createTextNode(Foxtrick.L10n
				                     .getString('datetimestrings.short_seasons', print_S)));
			}
			if ((print_W != 0 && print_S != '') || useFull)
				datespan.appendChild(doc.createTextNode(' '));
			if (print_W != 0 || useFull) {
				var b = doc.createElement('b');
				b.textContent = print_W;
				datespan.appendChild(b);
				datespan.appendChild(doc.createTextNode(Foxtrick.L10n
				                     .getString('datetimestrings.short_weeks', print_W)));
			}
			if (print_D != 0 || useFull)
				datespan.appendChild(doc.createTextNode(' '));
			if (print_D != 0 || useFull || (print_S == 0 && print_W == 0)) {
				var b = doc.createElement('b');
				b.textContent = print_D;
				datespan.appendChild(b);
				datespan.appendChild(doc.createTextNode(Foxtrick.L10n
				                     .getString('datetimestrings.short_days', print_D)));
			}

			return datespan;
		}

		//insert white space between days and hours
		if (datespan.textContent != '') datespan.textContent += ' ';

		//hours
		if ((time_sec >= 3600) || (Days > 0))
		{
			Hours = Math.floor(time_sec / 3600);
			time_sec = time_sec - Hours * 3600;
			datespan.textContent += Hours + Foxtrick.L10n.getString('datetimestrings.hours', Hours) +
				' ';
		}

		//minutes
		Minutes = Math.floor(time_sec / 60);
		time_sec = time_sec - Minutes * 60;
		datespan.textContent += Minutes + Foxtrick.L10n.getString('datetimestrings.minutes', Minutes);

		return datespan;
	}
};
