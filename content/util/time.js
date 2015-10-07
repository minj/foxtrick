'use strict';
/*
 * time.js
 * Utilities for date and time
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};

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

	getDateFromText: function(text, dateFormat, noTime) {
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
			if (text.match(reLong) && !noTime)
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
			if (country == Foxtrick.L10n.getCountryNameEnglish(i)) {
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
	/**
	 * Adjust the clock to the previous midnight
	 * @param {Date} date
	 */
	setMidnight: function(date) {
		Foxtrick.forEach(function(part) {
			date['set' + part](0);
		}, ['Hours', 'Minutes', 'Seconds', 'Milliseconds']);
	},

	fill: function(str, length) {
		var s = String(str);
		var i = 0;
		if (s.length < length)
			while (i++ < length - s.length)
				s = '0' + s;
		return s;
	},

	/**
	 * Convert a date object into string.
	 * options: { format: string, showTime, showSecs: boolean }
	 * By default uses localized format, no secs.
	 * @param  {Date}   date   	?Date
	 * @param  {object} options { format: string, showTime, showSecs: boolean }
	 * @return {string}
	 */
	buildDate: function(date, options) {
		var opts = {
			format: this.getPrintDateFormat(),
			showTime: true,
			showSecs: false,
		};
		Foxtrick.mergeValid(opts, options);

		if (!date)
			date = new Date();

		var string;
		if (!opts.showTime) {
			// presume date is before time in format
			string = opts.format.replace(/\s+.+$/, '');
		}
		else if (!opts.showSecs) {
			// presume seconds are in final position with only one separator
			string = opts.format.replace(/.S+$/, '');
		}
		else
			string = opts.format;

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

	/**
	 * Build a season/week/day/hour/minute span from time difference in seconds.
	 * options is { useDHM, useSWD, forceSWD, forceDHM: Boolean }.
	 * where useDHM means display time in whole days (may be >6), hours and minutes
	 * (defaults to true), false implies useSWD=true;
	 * where useSWD means display time in whole seasons, weeks and days (mod);
	 * forcing options display respective parts even if they are equal to 0,
	 * displays only last zero when false (default).
	 * @param  {document}        doc
	 * @param  {number}          secDiff {Integer}
	 * @param  {object}          options {{ useDHM, useSWD, forceDHM, forceSWD: Boolean }}
	 * @return {HTMLSpanElement}
	 */
	timeDiffToSpan: function(doc, secDiff, options) {
		// Returns the time difference as non-zero days/hours and minutes
		// if !useDHM or useSWD shows non-zero seasons/weeks and days
		// if forceDHM shows days/hours/minutes always
		// if forceSWD shows seasons/weeks/days always

		var dateSpan = doc.createElement('span');
		dateSpan.className = 'nowrap';

		if (Math.floor(secDiff) < 0) {
			dateSpan.textContent = 'NaN';
			return dateSpan;
		}

		var opts = {
			useDHM: true,
			useSWD: false,
			forceDHM: false,
			forceSWD: false,
		};
		Foxtrick.mergeValid(opts, options);
		var useDHM = opts.useDHM || opts.forceDHM;
		var useSWD = opts.useSWD || opts.forceSWD || !opts.useDHM;

		var WEEKS_IN_SEASON = 16;

		var SECS_IN_MIN = 60;
		var MINS_IN_HOUR = 60;
		var HOURS_IN_DAY = 24;
		var DAYS_IN_WEEK = 7;

		var SECS_IN_HOUR = SECS_IN_MIN * MINS_IN_HOUR;
		var SECS_IN_DAY = SECS_IN_HOUR * HOURS_IN_DAY;
		var DAYS_IN_SEASON = WEEKS_IN_SEASON * DAYS_IN_WEEK;

		// totals
		var minDiff = Math.floor(secDiff / SECS_IN_MIN);
		var hourDiff = Math.floor(secDiff / SECS_IN_HOUR);
		var dayDiff = Math.floor(secDiff / SECS_IN_DAY);
		var weekDiff = Math.floor(dayDiff / DAYS_IN_WEEK);
		var seasDiff = Math.floor(dayDiff / DAYS_IN_SEASON);

		// mods
		var minMod = minDiff % MINS_IN_HOUR;
		var hourMod = hourDiff % HOURS_IN_DAY;
		var dayMod = dayDiff % DAYS_IN_WEEK;
		var weekMod = weekDiff % WEEKS_IN_SEASON;
		var seasMod = seasDiff;

		var displayOption = Foxtrick.Prefs.getInt('module.ExtendedPlayerDetails.value') || 0;

		if (useSWD) {
			var swd;

			switch (displayOption) { // ('SWD', 'SW', 'SD', 'WD', 'D')
				case 0: // SWD
					swd = [
						[seasMod, 'short_seasons'],
						[weekMod, 'short_weeks'],
						[dayMod, 'short_days'],
					];
				break;

				case 1: // SW
					swd = [
						[seasMod, 'short_seasons'],
						[weekMod, 'short_weeks'],
					];
				break;

				case 2: // SD
					swd = [
						[seasMod, 'short_seasons'],
						[dayDiff - seasMod * DAYS_IN_SEASON, 'short_days'],
					];
				break;

				case 3: // WD
					swd = [
						[weekDiff, 'short_weeks'],
						[dayMod, 'short_days'],
					];
				break;

				case 4: // D
					swd = [
						[dayDiff, 'short_days'],
					];
				break;
			}

			if (!opts.forceSWD) {
				// remove zeros
				swd = Foxtrick.filter(function(def, i, arr) {
					return def[0] || i == arr.length - 1; // always use last
				}, swd);
			}

			var children = [];
			Foxtrick.forEach(function(def) {
				var b = doc.createElement('b');
				b.textContent = def[0];
				children.push(b);

				var str = Foxtrick.L10n.getString('datetimestrings.' + def[1], def[0]);
				children.push(doc.createTextNode(str));
				children.push(doc.createTextNode(' '));
			}, swd);

			if (!useDHM) {
				// remove last space
				children.pop();
			}

			Foxtrick.appendChildren(dateSpan, children);
		}

		if (useDHM) {
			var dhm = [
				[dayDiff, 'days'],
				[hourMod, 'hours'],
				[minMod, 'minutes'],
			];
			if (useSWD) {
				if (displayOption === 1) {
					// weeks + no days, use dayMod instead
					dhm[0][0] = dayMod;
				}
				else {
					// remove day duplicate
					dhm.shift();
				}
			}

			if (!opts.forceDHM) {
				// remove zeros
				dhm = Foxtrick.filter(function(def, i, arr) {
					return def[0] || i == arr.length - 1; // always use last
				}, dhm);
			}

			var result = Foxtrick.map(function(def) {
				var str = Foxtrick.L10n.getString('datetimestrings.' + def[1], def[0]);
				return def[0] + str;
			}, dhm).join(' ');

			dateSpan.appendChild(doc.createTextNode(result));
		}

		return dateSpan;
	},
};
