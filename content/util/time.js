/**
 * time.js
 * Utilities for date and time.
 * @author ryan, convincedd, LA-MJ
 *
 * Basically there are 4 time zones in FT:
 * 1) UTC: useful for interacting with external world
 * 2) Local/browser time: local machine time of JavaScript engine, for internal use
 * 3) HT time: useful for CHPP and general game world calculations
 * 4) User time: new user setting, used for displaying/parsing dates on the site
 *
 * All time zones except UTC and browser time have timestamp values
 * that are meaningless to the outside world.
 * However, incorrectly set machine time is always a problem so we can only rely on
 * UTC which was generated directly from the HT timestamp and nothing else.
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	// @ts-ignore
	var Foxtrick = {};
/* eslint-enable */

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.time = {
	/**
	 * The first day of the first HT season ever.
	 *
	 * Calculated to be 1997-08-22
	 */
	// eslint-disable-next-line no-magic-numbers
	ORIGIN: new Date(1997, 8, 22),
	MSECS_IN_SEC: 1000,
	SECS_IN_MIN: 60,
	MINS_IN_HOUR: 60,
	HOURS_IN_DAY: 24,
	DAYS_IN_WEEK: 7,
	MAX_DAY: 31,
	MONTHS_IN_YEAR: 12,
	UNIX_YEAR: 1970,

	WEEKS_IN_SEASON: 16,
	HT_GMT_OFFSET: 1,

	get DAYS_IN_SEASON() {
		return this.WEEKS_IN_SEASON * this.DAYS_IN_WEEK;
	},
	get SECS_IN_HOUR() {
		return this.SECS_IN_MIN * this.MINS_IN_HOUR;
	},
	get SECS_IN_DAY() {
		return this.SECS_IN_MIN * this.MINS_IN_HOUR * this.HOURS_IN_DAY;
	},
	get MSECS_IN_MIN() {
		return this.MSECS_IN_SEC * this.SECS_IN_MIN;
	},
	get MSECS_IN_HOUR() {
		return this.MSECS_IN_SEC * this.SECS_IN_HOUR;
	},
	get MSECS_IN_DAY() {
		return this.MSECS_IN_SEC * this.SECS_IN_DAY;
	},
};

/**
 * Get the date format of Hattrick, with 'd', 'm', and 'y'
 * indicating day, month, and year respectively
 * @return {string}
 */
Foxtrick.util.time.getDateFormat = function() {
	return Foxtrick.Prefs.getString('htDateFormat');
};

/**
 * Set the date format of Hattrick, with 'd', 'm', and 'y'
 * indicating day, month, and year respectively
 * @param {string} format
 */
Foxtrick.util.time.setDateFormat = function(format) {
	Foxtrick.Prefs.setString('htDateFormat', format);
};

/**
 * Get a date format for printing, like 'dd-mm-YYYY HH:MM:SS'
 * @return {string}
 */
Foxtrick.util.time.getPrintDateFormat = function() {
	return this.getDateFormat().replace(/y/g, 'Y') + ' HH:MM:SS';
};

/**
 * Convert Date object into {season, week: number}.
 *
 * weekdayOffset adjusts the first day of the week:
 * -2 for Saturday (economic update), 0 for Monday (default)
 * useLocal returns local season number
 * @param  {Date}    date
 * @param  {number}  [weekdayOffset]
 * @param  {boolean} [useLocal]
 * @return {{season: number, week: number}}
 */
Foxtrick.util.time.gregorianToHT = function(date, weekdayOffset = 0, useLocal = false) {
	let msDiff = date.getTime() - this.ORIGIN.getTime();
	let dayDiff = Math.floor(msDiff / this.MSECS_IN_DAY) - weekdayOffset;
	let season = Math.floor(dayDiff / this.DAYS_IN_SEASON) + 1;
	let week = Math.floor(dayDiff % this.DAYS_IN_SEASON / this.DAYS_IN_WEEK) + 1;

	if (useLocal)
		season -= this.getSeasonOffset();

	return { season, week };
};

/**
 * Convert {season, week: number} into Date object.
 *
 * weekdayOffset adjusts the first day of the week:
 * -2 for Saturday (economic update), 0 for Monday (default)
 * useLocal assumes local season number
 *
 * @param  {{season: number, week: number}} htDate
 * @param  {number}  [weekdayOffset]
 * @param  {boolean} [useLocal]
 * @return {Date}
 */
Foxtrick.util.time.HTToGregorian = function(htDate, weekdayOffset = 0, useLocal = false) {
	let { season, week } = htDate;

	if (useLocal)
		season += this.getSeasonOffset();

	let dayDiff = (season - 1) * this.DAYS_IN_SEASON;
	dayDiff += (week - 1) * this.DAYS_IN_WEEK + weekdayOffset;
	let msDiff = dayDiff * this.MSECS_IN_DAY;
	let msVal = this.ORIGIN.getTime() + msDiff;

	return new Date(msVal);
};

/**
 * Parse datetime text into {day, month, year, hour, minute: number}
 *
 * May optionally use a custom dateFormat.
 * @param  {string}  text
 * @param  {string}  dateFormat {?string}
 * @param  {Boolean} dateOnly   {?Boolean}
 * @return {object}             {day, month, year, hour, minute: number}
 */
Foxtrick.util.time.parse = function(text, dateFormat, dateOnly) {
	// four-digit year first
	var reLong = /(\d{4})\D(\d{1,2})\D(\d{1,2})\D?\s+(\d{2})\D(\d{2})/;
	var reShort = /(\d{4})\D(\d{1,2})\D(\d{1,2})/;

	var DATEFORMAT = dateFormat || this.getDateFormat();
	if (DATEFORMAT.indexOf('y') !== 0) {
		// day or month first
		reLong = /(\d{1,2})\D(\d{1,2})\D(\d{4})\D?\s+(\d{2})\D(\d{2})/;
		reShort = /(\d{1,2})\D(\d{1,2})\D(\d{4})/;
	}

	var matches;
	if (reLong.test(text) && !dateOnly)
		matches = text.match(reLong);
	else if (reShort.test(text))
		matches = text.match(reShort);
	else
		return null;

	for (var i = 1; i < matches.length; ++i)
		matches[i] = parseInt(matches[i], 10);

	var day, month, year;
	if (DATEFORMAT.indexOf('d') === 0) {
		// like dd-mm-yyyy
		day = matches[1];
		month = matches[2];
		year = matches[3];
	}
	else if (DATEFORMAT.indexOf('m') === 0) {
		// like mm-dd-yyyy
		day = matches[2];
		month = matches[1];
		year = matches[3];
	}
	else if (DATEFORMAT.indexOf('y') === 0) {
		// like yyyy-mm-dd
		day = matches[3];
		month = matches[2];
		year = matches[1];
	}
	else {
		Foxtrick.error('Unknown DATEFORMAT');
		return null;
	}

	var hour = matches.length == 6 ? matches[4] : 0;
	var minute = matches.length == 6 ? matches[5] : 0;

	return { day: day, month: month, year: year, hour: hour, minute: minute };
};

/**
 * Convert datetime text into a ?Date
 *
 * May optionally use a custom dateFormat.
 * @param  {string}  text
 * @param  {string}  dateFormat {?string}
 * @param  {Boolean} dateOnly   {?Boolean}
 * @return {Date}               {?Date}
 */
Foxtrick.util.time.getDateFromText = function(text, dateFormat, dateOnly) {
	var d = this.parse(text, dateFormat, dateOnly);
	if (!d)
		return null;

	// check validity of values
	if (0 <= d.minute && d.minute < this.MINS_IN_HOUR &&
	    0 <= d.hour && d.hour < this.HOURS_IN_DAY &&
	    1 <= d.day && d.day <= this.MAX_DAY &&
	    1 <= d.month && d.month <= this.MONTHS_IN_YEAR &&
	    this.UNIX_YEAR <= d.year) {
		var date = new Date(d.year, d.month - 1, d.day, d.hour, d.minute);
		return date;
	}
	return null;
};

/**
 * Test whether text has date and time (hours and minutes) in it.
 *
 * May optionally use a custom dateFormat.
 * @param  {string}  text
 * @param  {string}  dateFormat {?string}
 * @return {Boolean}
 */
Foxtrick.util.time.hasTime = function(text, dateFormat) {
	// four-digit year first
	var re = /(\d{4})\D(\d{1,2})\D(\d{1,2})\D?\s+(\d{2})\D(\d{2})/;

	dateFormat = dateFormat || this.getDateFormat();
	if (dateFormat.indexOf('y') !== 0) {
		// day or month first
		re = /(\d{1,2})\D(\d{1,2})\D(\d{4})\D?\s+(\d{2})\D(\d{2})/;
	}
	return re.test(text);
};

/**
 * Check if a HT Date in UTC falls during DST
 * @param  {Date}    utcHTDate
 * @return {Boolean}
 */
Foxtrick.util.time.isDST = function(utcHTDate) {
	var year = utcHTDate.getUTCFullYear();
	// European DST starts on last March Sunday and ends on last October Sunday at 01:00 UTC
	var utcDSTEnd = new Date(Date.UTC(year, 9, 31, 1)); // 9 = October, got to love 0-index
	utcDSTEnd.setUTCDate(31 - utcDSTEnd.getUTCDay()); // 0 = Sunday

	var utcDSTStart = new Date(Date.UTC(year, 2, 31, 1)); // 2 = March, got to love 0-index
	utcDSTStart.setUTCDate(31 - utcDSTStart.getUTCDay()); // 0 = Sunday

	if (utcHTDate.getTime() > utcDSTStart.getTime() &&
	    utcHTDate.getTime() < utcDSTEnd.getTime()) // this fails during 00:00-01:00 UTC on DSTEnd
		return true;

	return false;
};

/**
 * Get a ?Date representing HT time in real UTC
 * @param  {document} doc
 * @return {Date}         {?Date}
 */
Foxtrick.util.time.getUTCDate = function(doc) {
	var dateEl = doc.getElementById('hattrickTime');
	if (!dateEl)
		dateEl = doc.getElementById('time');

	if (!dateEl)
		return null;

	var d = this.parse(dateEl.textContent);
	if (!d)
		return null;

	var hour = d.hour - this.HT_GMT_OFFSET;
	var utcHTDate = new Date(Date.UTC(d.year, d.month - 1, d.day, hour, d.minute));
	if (this.isDST(utcHTDate))
		utcHTDate.setUTCHours(hour - 1);

	return utcHTDate;
};

/**
 * Get a number representing HT time in real UTC.
 *
 * Throws if HT time was not found.
 * @param  {document}  doc
 * @throw  {TypeError}     HT time not found
 * @return {number}
 */
Foxtrick.util.time.getUTCTimeStamp = function(doc) {
	return this.getUTCDate(doc).getTime();
};

/**
 * Get a ?Date representing HT time
 * @param  {document} doc
 * @return {Date}         {?Date}
 */
Foxtrick.util.time.getHTDate = function(doc) {
	var dateEl = doc.getElementById('hattrickTime');
	if (!dateEl)
		dateEl = doc.getElementById('time');

	if (!dateEl)
		return null;

	return this.getDateFromText(dateEl.textContent);
};

/**
 * Get a number representing HT time.
 *
 * Throws if HT time was not found.
 * @param  {document}  doc
 * @throw  {TypeError}     HT time not found
 * @return {number}
 */
Foxtrick.util.time.getHTTimeStamp = function(doc) {
	return this.getHTDate(doc).getTime();
};

/**
 * Get a ?Date representing user time
 * @param  {document} doc
 * @return {Date}         {?Date}
 */
Foxtrick.util.time.getDate = function(doc) {
	var dateEl = doc.getElementById('time');
	if (!dateEl)
		return null;

	var date = this.getDateFromText(dateEl.textContent);
	return date;
};

/**
 * Get a number representing user time.
 *
 * Throws if HT time was not found.
 * @param  {document}  doc
 * @throw  {TypeError}     HT time not found
 * @return {number}
 */
Foxtrick.util.time.getTimeStamp = function(doc) {
	return this.getDate(doc).getTime();
};

/**
 * Get timezone difference between HT time and browser time in hours (Float).
 *
 * E.g. 7.0 when browser time is GMT+8.
 * Throws if HT time was not found.
 * @param  {document} doc
 * @throw  {TypeError}    HT time not found
 * @return {number}       {Float}
 */
Foxtrick.util.time.getBrowserOffset = function(doc) {
	var htDate = this.getHTDate(doc);

	var now = new Date();
	// time zone difference is typically a multiple of 15 minutes
	var diff = Math.round((now.getTime() - htDate.getTime()) / this.MSECS_IN_HOUR * 4) / 4;
	return diff;
};

/**
 * Get timezone difference between HT time and user time in hours (Float).
 *
 * E.g. 7.0 when user time is GMT+8.
 * Throws if HT time was not found.
 * @param  {document} doc
 * @throw  {TypeError}    HT time not found
 * @return {number}       {Float}
 */
Foxtrick.util.time.getUserOffset = function(doc) {
	var htDate = this.getHTDate(doc);
	var userDate = this.getDate(doc);

	// time zone difference is typically a multiple of 15 minutes
	var diff = Math.round((userDate.getTime() - htDate.getTime()) / this.MSECS_IN_HOUR * 4) / 4;
	return diff;
};

/**
 * Get timezone difference between user time and browser time in hours (Float).
 *
 * E.g. 1.0 when user time is GMT+2 and browser time is GMT+3.
 * Throws if HT time was not found.
 * @param  {document} doc
 * @throw  {TypeError}    HT time not found
 * @return {number}       {Float}
 */
Foxtrick.util.time.getLocalOffset = function(doc) {
	return this.getBrowserOffset(doc) - this.getUserOffset(doc);
};

/**
 * Convert user date or timestamp into HT time
 * @param  {document} doc
 * @param  {number}   userDate
 * @return {Date}
 */
Foxtrick.util.time.toHT = function(doc, userDate) {
	var offset = this.getUserOffset(doc);
	var ret = new Date(userDate);
	ret.setMinutes(ret.getMinutes() - this.MINS_IN_HOUR * offset);
	return ret;
};

/**
 * Convert HT date or timestamp into user time
 * @param  {document} doc
 * @param  {number}   htDate
 * @return {Date}
 */
Foxtrick.util.time.toUser = function(doc, htDate) {
	var offset = this.getUserOffset(doc);
	var ret = new Date(htDate);
	ret.setMinutes(ret.getMinutes() + this.MINS_IN_HOUR * offset);
	return ret;
};

/**
 * Convert user date or timestamp into browser time
 * @param  {document} doc
 * @param  {number}   userDate
 * @return {Date}
 */
Foxtrick.util.time.toLocal = function(doc, userDate) {
	var offset = this.getLocalOffset(doc);
	var ret = new Date(userDate);
	ret.setMinutes(ret.getMinutes() + this.MINS_IN_HOUR * offset);
	return ret;
};

/**
 * Get the user league season offset (>0)
 *
 * @return {number}                       {Integer>0}
 */
Foxtrick.util.time.getSeasonOffset = function() {
	var country = Foxtrick.Prefs.getString('htCountry');
	for (var i in Foxtrick.XMLData.League) {
		if (country === Foxtrick.L10n.getCountryNameEnglish(i)) {
			var data = Foxtrick.XMLData.League[i];
			var offset = parseInt(data.SeasonOffset, 10);
			return -offset;
		}
	}

	Foxtrick.log('WARNING: no league found');
	return 0;
};

/**
 * Get a new Date with an integer of days added
 * @param  {Date}   date
 * @param  {number} days {Integer}
 * @return {Date}
 */
Foxtrick.util.time.addDaysToDate = function(date, days) {
	days = parseInt(days, 10);
	var ret = new Date(date);
	ret.setDate(ret.getDate() + days);
	return ret;
};

/**
 * Adjust a Date object to the previous midnight
 * @param {Date} date
 */
Foxtrick.util.time.setMidnight = function(date) {
	Foxtrick.forEach(function(part) {
		date['set' + part](0);
	}, ['Hours', 'Minutes', 'Seconds', 'Milliseconds']);
};

/**
 * Pad a string with zeros if shorter than length
 * @param  {string} str
 * @param  {number} length
 * @return {string}
 */
Foxtrick.util.time.fill = function(str, length) {
	var s = String(str);
	var i = 0;
	while (i++ < length - s.length)
		s = '0' + s;
	return s;
};

/**
 * Convert a ?Date object into string.
 *
 * options: {format: string, showTime, showSecs: Boolean}
 * By default uses localized format, no secs.
 * @param  {Date}   date   	?Date
 * @param  {object} options {format: string, showTime, showSecs: Boolean}
 * @return {string}
 */
Foxtrick.util.time.buildDate = function(date, options) {
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
		// presume date is before time in format and separated with first whitespace
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
};

/**
 * Get an ISO string without milisecs or timezone
 *
 * e.g. 20120727T000900, not adjusted to UTC
 * @param  {Date}   date
 * @return {string}
 */
Foxtrick.util.time.toBareISOString = function(date) {
	var format = 'YYYYmmddTHHMMSS';
	return this.buildDate(date, { format: format, showSecs: true });
};

/**
 * Build a season/week/day/hour/minute span from time difference in seconds.
 *
 * options is {useDHM, useSWD, forceSWD, forceDHM: Boolean}.
 * where useDHM means display time in whole days (may be >6), hours and minutes,
 * defaults to true, (false implies useSWD=true);
 * where useSWD means display time in whole seasons, weeks and days (mod),
 * defaults to false.
 * Forcing options display respective parts even if they are equal to 0,
 * displays starts only when first non-zero is encountered
 * or it's the last number when false (default).
 * @param  {document}        doc
 * @param  {number}          secDiff {Integer}
 * @param  {object}          options {{useDHM, useSWD, forceDHM, forceSWD: Boolean}}
 * @return {HTMLSpanElement}
 */
Foxtrick.util.time.timeDiffToSpan = function(doc, secDiff, options) {
	// Returns the time difference as non-zero days/hours and minutes
	// if !useDHM or useSWD shows non-zero seasons/weeks and days
	// if forceDHM shows days/hours/minutes always
	// if forceSWD shows seasons/weeks/days always

	// should be positive
	secDiff = Math.abs(secDiff);

	var dateSpan = doc.createElement('span');
	dateSpan.className = 'nowrap';

	var opts = {
		useDHM: true,
		useSWD: false,
		forceDHM: false,
		forceSWD: false,
	};
	Foxtrick.mergeValid(opts, options);
	var useDHM = opts.useDHM || opts.forceDHM;
	var useSWD = opts.useSWD || opts.forceSWD || !opts.useDHM;

	// totals
	var minDiff = Math.floor(secDiff / this.SECS_IN_MIN);
	var hourDiff = Math.floor(secDiff / this.SECS_IN_HOUR);
	var dayDiff = Math.floor(secDiff / this.SECS_IN_DAY);
	var weekDiff = Math.floor(dayDiff / this.DAYS_IN_WEEK);
	var seasDiff = Math.floor(dayDiff / this.DAYS_IN_SEASON);

	// mods
	var minMod = minDiff % this.MINS_IN_HOUR;
	var hourMod = hourDiff % this.HOURS_IN_DAY;
	var dayMod = dayDiff % this.DAYS_IN_WEEK;
	var weekMod = weekDiff % this.WEEKS_IN_SEASON;
	var seasMod = seasDiff;

	var displayOption = Foxtrick.Prefs.getInt('module.ExtendedPlayerDetails.value') || 0;

	var swdExists = false;
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
					[dayDiff - seasMod * this.DAYS_IN_SEASON, 'short_days'],
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
				if (def[0]) {
					// when non-zero is found, use all the rest
					swdExists = true;
				}
				return swdExists || !useDHM && i == arr.length - 1; // always use last if no DHM
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
			// remove zeros if swd is missing
			var dhmExists = swdExists;
			dhm = Foxtrick.filter(function(def, i, arr) {
				if (def[0]) {
					// when non-zero is found, use all the rest
					dhmExists = true;
				}
				return dhmExists || i == arr.length - 1; // always use last
			}, dhm);
		}

		var result = Foxtrick.map(function(def) {
			var str = Foxtrick.L10n.getString('datetimestrings.' + def[1], def[0]);
			return def[0] + str;
		}, dhm).join(' ');

		dateSpan.appendChild(doc.createTextNode(result));
	}

	return dateSpan;
};
