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
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.time = (() => ({
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
}))();

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
 * * -2 for Saturday (economic update)
 * * 0 for Monday (default)
 *
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
 * * -2 for Saturday (economic update)
 * * 0 for Monday (default)
 *
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
 * @typedef DateInfo
 * @prop {number} day
 * @prop {number} month
 * @prop {number} year
 * @prop {number} hour
 * @prop {number} minute
 */

/**
 * Parse datetime text into {day, month, year, hour, minute: number}
 *
 * May optionally use a custom dateFormat.
 * @param  {string}  text
 * @param  {string}  [dateFormat] {?string}
 * @param  {boolean} [dateOnly]   {?boolean}
 * @return {DateInfo}             {day, month, year, hour, minute: number}
 */
Foxtrick.util.time.parse = function(text, dateFormat, dateOnly = false) {
	const RE_SHORT_GROUP_CT = 3;
	const RE_LONG_GROUP_CT = 5;

	// four-digit year first
	let reLong = /(\d{4})\D(\d{1,2})\D(\d{1,2})\D?\s+(\d{2})\D(\d{2})/;
	let reShort = /(\d{4})\D(\d{1,2})\D(\d{1,2})/;

	const DATEFORMAT = dateFormat || this.getDateFormat();
	if (DATEFORMAT.indexOf('y') !== 0) {
		// day or month first
		reLong = /(\d{1,2})\D(\d{1,2})\D(\d{4})\D?\s+(\d{2})\D(\d{2})/;
		reShort = /(\d{1,2})\D(\d{1,2})\D(\d{4})/;
	}

	let matches;
	if (reLong.test(text) && !dateOnly)
		matches = text.match(reLong);
	else if (reShort.test(text))
		matches = text.match(reShort);
	else
		return null;

	let matchNums = [...matches].slice(1).map(s => parseInt(s, 10));

	let day, month, year;
	if (DATEFORMAT.indexOf('d') === 0) {
		// like dd-mm-yyyy
		[day, month, year] = matchNums;
	}
	else if (DATEFORMAT.indexOf('m') === 0) {
		// like mm-dd-yyyy
		[month, day, year] = matchNums;
	}
	else if (DATEFORMAT.indexOf('y') === 0) {
		// like yyyy-mm-dd
		[year, month, day] = matchNums;
	}
	else {
		Foxtrick.log(new Error('Unknown DATEFORMAT'));
		return null;
	}

	let hour = 0;
	let minute = 0;

	if (matchNums.length == RE_LONG_GROUP_CT)
		[hour, minute] = matchNums.slice(RE_SHORT_GROUP_CT);

	return { day, month, year, hour, minute };
};

/**
 * Convert datetime text into a ?Date
 *
 * May optionally use a custom dateFormat.
 * @param  {string}  text
 * @param  {string}  [dateFormat] {?string}
 * @param  {boolean} [dateOnly]   {?boolean}
 * @return {Date}                 {?Date}
 */
Foxtrick.util.time.getDateFromText = function(text, dateFormat, dateOnly = false) {
	let d = this.parse(text, dateFormat, dateOnly);
	if (!d)
		return null;

	// check validity of values
	if (d.minute >= 0 && d.minute < this.MINS_IN_HOUR &&
	    d.hour >= 0 && d.hour < this.HOURS_IN_DAY &&
	    d.day >= 1 && d.day <= this.MAX_DAY &&
	    d.month >= 1 && d.month <= this.MONTHS_IN_YEAR &&
	    this.UNIX_YEAR <= d.year) {

		let date = new Date(d.year, d.month - 1, d.day, d.hour, d.minute);
		return date;
	}
	return null;
};

/**
 * Test whether text has date and time (hours and minutes) in it.
 *
 * May optionally use a custom dateFormat.
 * @param  {string}  text
 * @param  {string}  [dateFormat] {?string}
 * @return {boolean}
 */
Foxtrick.util.time.hasTime = function(text, dateFormat) {
	// four-digit year first
	var re = /(\d{4})\D(\d{1,2})\D(\d{1,2})\D?\s+(\d{2})\D(\d{2})/;

	const DATEFORMAT = dateFormat || this.getDateFormat();
	if (DATEFORMAT.indexOf('y') !== 0) {
		// day or month first
		re = /(\d{1,2})\D(\d{1,2})\D(\d{4})\D?\s+(\d{2})\D(\d{2})/;
	}

	return re.test(text);
};

/**
 * Check if a HT Date in UTC falls during DST
 * @param  {Date}    utcHTDate
 * @return {boolean}
 */
Foxtrick.util.time.isDST = function(utcHTDate) {
	let year = utcHTDate.getUTCFullYear();

	// European DST starts on last March Sunday and ends on last October Sunday at 01:00 UTC
	/* eslint-disable no-magic-numbers */
	let utcDSTEnd = new Date(Date.UTC(year, 9, 31, 1)); // 9 = October, got to love 0-index
	utcDSTEnd.setUTCDate(31 - utcDSTEnd.getUTCDay()); // 0 = Sunday

	let utcDSTStart = new Date(Date.UTC(year, 2, 31, 1)); // 2 = March, got to love 0-index
	utcDSTStart.setUTCDate(31 - utcDSTStart.getUTCDay()); // 0 = Sunday
	/* eslint-enable no-magic-numbers */

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
	let dateEl = doc.getElementById('hattrickTime');
	if (!dateEl)
		dateEl = doc.getElementById('time');

	if (!dateEl)
		return null;

	let d = this.parse(dateEl.textContent);
	if (!d)
		return null;

	let utcHTDate = new Date(Date.UTC(d.year, d.month - 1, d.day, d.hour, d.minute));
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
	let dateEl = doc.getElementById('hattrickTime');
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
	let date = this.getHTDate(doc);
	return date ? date.getTime() : null;
};

/**
 * Get a ?Date representing user time
 * @param  {document} doc
 * @return {Date}         {?Date}
 */
Foxtrick.util.time.getDate = function(doc) {
	let dateEl = doc.getElementById('time');
	if (!dateEl)
		return null;

	let date = this.getDateFromText(dateEl.textContent);
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
	var date = this.getDate(doc);
	if (!date)
		return null;

	return date.getTime();
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
	let htDate = this.getHTDate(doc);
	if (htDate == null)
		return null;

	let now = new Date();
	let hourDiff = (now.getTime() - htDate.getTime()) / this.MSECS_IN_HOUR;

	// time zone difference is typically a multiple of 15 minutes
	const GRANULARITY = 15;
	const DIV = this.MINS_IN_HOUR / GRANULARITY;

	return Math.round(hourDiff * DIV) / DIV;
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
	let htDate = this.getHTDate(doc);
	if (htDate == null)
		return null;

	let userDate = this.getDate(doc);
	if (userDate == null)
		return null;

	let hourDiff = (userDate.getTime() - htDate.getTime()) / this.MSECS_IN_HOUR;

	// time zone difference is typically a multiple of 15 minutes
	const GRANULARITY = 15;
	const DIV = this.MINS_IN_HOUR / GRANULARITY;

	return Math.round(hourDiff * DIV) / DIV;
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
	let browser = this.getBrowserOffset(doc);
	let user = this.getUserOffset(doc);
	if (browser == null || user == null)
		return null;

	return browser - user;
};

/**
 * Convert user date or timestamp into HT time
 * @param  {document}    doc
 * @param  {number|Date} userDate
 * @return {Date}
 */
Foxtrick.util.time.toHT = function(doc, userDate) {
	let offset = this.getUserOffset(doc);
	if (offset == null)
		return null;

	let ret = new Date(userDate);
	ret.setMinutes(ret.getMinutes() - this.MINS_IN_HOUR * offset);
	return ret;
};

/**
 * Convert HT date or timestamp into user time
 * @param  {document}    doc
 * @param  {number|Date} htDate
 * @return {Date}
 */
Foxtrick.util.time.toUser = function(doc, htDate) {
	let offset = this.getUserOffset(doc);
	if (offset == null)
		return null;

	let ret = new Date(htDate);
	ret.setMinutes(ret.getMinutes() + this.MINS_IN_HOUR * offset);
	return ret;
};

/**
 * Convert user date or timestamp into browser time
 * @param  {document}    doc
 * @param  {number|Date} userDate
 * @return {Date}
 */
Foxtrick.util.time.toLocal = function(doc, userDate) {
	let offset = this.getLocalOffset(doc);
	if (offset == null)
		return null;

	let ret = new Date(userDate);
	ret.setMinutes(ret.getMinutes() + this.MINS_IN_HOUR * offset);
	return ret;
};

/**
 * Get the user league season offset (>0)
 *
 * @return {number} {Integer>0}
 */
Foxtrick.util.time.getSeasonOffset = function() {
	let country = Foxtrick.Prefs.getString('htCountry');
	for (let i in Foxtrick.XMLData.League) {
		let id = parseInt(i, 10);
		if (country === Foxtrick.L10n.getCountryNameEnglish(id)) {
			let data = Foxtrick.XMLData.League[i];
			let offset = parseInt(data.SeasonOffset, 10);
			return -offset;
		}
	}

	Foxtrick.log(new Error(`No League for '${country}' found!`));
	return 0;
};

/**
 * Get a new Date with an integer of days added
 * @param  {number|Date} date
 * @param  {number}      days {Integer}
 * @return {Date}
 */
Foxtrick.util.time.addDaysToDate = function(date, days) {
	let dayCt = parseInt(String(days), 10);

	let ret = new Date(date);
	ret.setDate(ret.getDate() + dayCt);
	return ret;
};

/**
 * Adjust a Date object to the previous midnight
 * @param {Date} date
 */
Foxtrick.util.time.setMidnight = function(date) {
	Foxtrick.forEach(function(part) {
		// @ts-ignore
		date['set' + part](0);
	}, ['Hours', 'Minutes', 'Seconds', 'Milliseconds']);
};

/**
 * Pad a number string with zeros if shorter than length
 * @param  {string|number} str
 * @param  {number} length
 * @return {string}
 */
Foxtrick.util.time.fill = function(str, length) {
	let s = String(str);
	if (s.length < length)
		s = '0'.repeat(length - s.length) + s;

	return s;
};

/**
 * @typedef DateBuildOpts
 * @prop {string} format
 * @prop {boolean} showTime defaults to true
 * @prop {boolean} showSecs
 */

/**
 * Convert a ?Date object into string.
 *
 * options: {format: string, showTime, showSecs: boolean}
 *
 * By default uses localized format, no secs.
 * @param  {Date}                   [date]    ?Date
 * @param  {Partial<DateBuildOpts>} [options] {format: string, showTime, showSecs: boolean}
 * @return {string}
 */
Foxtrick.util.time.buildDate = function(date = new Date(), options) {
	/** @type {DateBuildOpts} */
	let opts = {
		format: this.getPrintDateFormat(),
		showTime: true,
		showSecs: false,
	};
	Foxtrick.mergeValid(opts, options);

	let string;
	if (!opts.showTime) {
		// presume date is before time in format and separated with first whitespace
		string = opts.format.replace(/\s+.+$/, '');
	}
	else if (opts.showSecs) {
		string = opts.format;
	}
	else {
		// presume seconds are in final position with only one separator
		string = opts.format.replace(/.S+$/, '');
	}

	string = string.replace(/YYYY/g, date.getFullYear().toString());
	string = string.replace(/mm/g, this.fill(date.getMonth() + 1, 2));
	string = string.replace(/m/g, (date.getMonth() + 1).toString());
	string = string.replace(/dd/g, this.fill(date.getDate(), 2));
	string = string.replace(/d/g, date.getDate().toString());
	string = string.replace(/HH/g, this.fill(date.getHours(), 2));
	string = string.replace(/H/g, date.getHours().toString());
	string = string.replace(/MM/g, this.fill(date.getMinutes(), 2));
	string = string.replace(/M/g, date.getMinutes().toString());
	string = string.replace(/SS/g, this.fill(date.getSeconds(), 2));
	string = string.replace(/S/g, date.getSeconds().toString());

	return string;
};

/**
 * Get an ISO string without milisecs or timezone
 *
 * e.g. 20120727T000900, not adjusted to UTC
 * @param  {number|Date}   date
 * @return {string}
 */
Foxtrick.util.time.toBareISOString = function(date) {
	const format = 'YYYYmmddTHHMMSS';
	return this.buildDate(new Date(date), { format, showSecs: true });
};

/**
 * @typedef DateDeltaOpts
 * @prop {boolean} useDHM display time in whole days (may be >6), hours and minutes
 * @prop {boolean} forceDHM useDHM even if everything is 0
 * @prop {boolean} useSWD display time in whole seasons, weeks and days (mod)
 * @prop {boolean} forceSWD useSWD even if everything is 0
 */

/**
 * Build a season/week/day/hour/minute span from time difference in seconds.
 *
 * options is {useDHM, useSWD, forceSWD, forceDHM: boolean}:
 * * where useDHM means display time in whole days (may be >6), hours and minutes,
 *   defaults to true, (false implies useSWD=true);
 * * where useSWD means display time in whole seasons, weeks and days (mod),
 *   defaults to false.
 *
 * Forcing options display respective parts even if they are equal to 0.
 *
 * Displays starts only when first non-zero is encountered
 * or it's the last number when false (default).
 * @param  {document}               doc
 * @param  {number}                 secDiff   {Integer}
 * @param  {Partial<DateDeltaOpts>} [options] {{useDHM, useSWD, forceDHM, forceSWD: boolean}}
 * @return {HTMLSpanElement}
 */
// eslint-disable-next-line complexity
Foxtrick.util.time.timeDiffToSpan = function(doc, secDiff, options) {
	// Returns the time difference as non-zero days/hours and minutes
	// if !useDHM or useSWD shows non-zero seasons/weeks and days
	// if forceDHM shows days/hours/minutes always
	// if forceSWD shows seasons/weeks/days always

	// should be positive
	let secDelta = Math.abs(secDiff);

	let dateSpan = doc.createElement('span');
	dateSpan.className = 'nowrap';

	/** @type {DateDeltaOpts} */
	let opts = {
		useDHM: true,
		useSWD: false,
		forceDHM: false,
		forceSWD: false,
	};
	Foxtrick.mergeValid(opts, options);
	let useDHM = opts.useDHM || opts.forceDHM;
	let useSWD = opts.useSWD || opts.forceSWD || !opts.useDHM;

	// totals
	let minDiff = Math.floor(secDelta / this.SECS_IN_MIN);
	let hourDiff = Math.floor(secDelta / this.SECS_IN_HOUR);
	let dayDiff = Math.floor(secDelta / this.SECS_IN_DAY);
	let weekDiff = Math.floor(dayDiff / this.DAYS_IN_WEEK);
	let seasDiff = Math.floor(dayDiff / this.DAYS_IN_SEASON);

	// mods
	let minMod = minDiff % this.MINS_IN_HOUR;
	let hourMod = hourDiff % this.HOURS_IN_DAY;
	let dayMod = dayDiff % this.DAYS_IN_WEEK;
	let weekMod = weekDiff % this.WEEKS_IN_SEASON;
	let seasMod = seasDiff;

	let displayOption = Foxtrick.Prefs.getInt('module.ExtendedPlayerDetails.value') || 0;

	let swdExists = false;
	if (useSWD) {

		/** @type {[number, string][]} */
		let swd;

		switch (displayOption) { // ('SWD', 'SW', 'SD', 'WD', 'D')
			default:
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

			// eslint-disable-next-line no-magic-numbers
			case 3: // WD
				swd = [
					[weekDiff, 'short_weeks'],
					[dayMod, 'short_days'],
				];
				break;

			// eslint-disable-next-line no-magic-numbers
			case 4: // D
				swd = [
					[dayDiff, 'short_days'],
				];
				break;
		}

		if (!opts.forceSWD) {
			// remove zeros
			swd = Foxtrick.filter(([value], i, arr) => {
				if (value) {
					// when non-zero is found, use all the rest
					swdExists = true;
				}
				return swdExists || !useDHM && i == arr.length - 1; // always use last if no DHM
			}, swd);
		}

		/** @type {Node[]} */
		let children = [];
		Foxtrick.forEach(([value, key]) => {
			let b = doc.createElement('b');
			b.textContent = String(value);
			children.push(b);

			let str = Foxtrick.L10n.getString('datetimestrings.' + key, value);
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
		/** @type {[number, string][]} */
		let dhm = [
			[dayDiff, 'days'],
			[hourMod, 'hours'],
			[minMod, 'minutes'],
		];

		let [dayDef] = dhm;
		if (useSWD) {
			if (displayOption === 1) {
				// weeks + no days, use dayMod instead
				dayDef[0] = dayMod;
			}
			else {
				// remove dayDef duplicate
				dhm.shift();
			}
		}

		if (!opts.forceDHM) {
			// remove zeros if swd is missing
			let dhmExists = swdExists;
			dhm = Foxtrick.filter(([value], i, arr) => {
				if (value) {
					// when non-zero is found, use all the rest
					dhmExists = true;
				}
				return dhmExists || i == arr.length - 1; // always use last
			}, dhm);
		}

		let result = Foxtrick.map(([value, key]) => {
			let str = Foxtrick.L10n.getString('datetimestrings.' + key, value);
			return value + str;
		}, dhm).join(' ');

		dateSpan.appendChild(doc.createTextNode(result));
	}

	return dateSpan;
};
