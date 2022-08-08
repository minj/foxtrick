/**
 * dashboard-calendar.js
 * Export dashboard calendar to iCal format
 * @author LA-MJ
 */

'use strict';

Foxtrick.modules.DashboardCalendar = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['dashboard'],

	/**
	 * @param {document} doc
	 */
	run: function(doc) {
		const module = this;
		module.exec(doc);
		let list = doc.querySelector('#eventList');
		if (!list)
			return;

		let panel = list.closest('[id*="UpdatePanel"]');
		Foxtrick.onChange(panel, doc => module.exec(doc));
	},

	/**
	 * @param {document} doc
	 */
	// eslint-disable-next-line complexity
	exec: function(doc) {
		// this is mostly for strings/iCal handling
		var EVENTS = {
			/* eslint-disable no-multi-spaces */
			TRAINING: 'training',             // upcomingTrainingIcon
			ECONOMY: 'economy',               // upcomingEconomyIcon
			FRREMINDER: 'frReminder',         // matchFriendly
			INTFRREMINDER: 'intFrReminder',   // fake event
			WKNDFRREMINDER: 'wkndFrReminder', // fake event
			LEAGUE: 'game',                   // matchLeague
			FRIENDLY: 'game',                 // matchFriendly
			CUP: 'cup',                       // matchCup
			QUALIFICATION: 'cup',             // matchQualification
			MASTERS: 'cup',                   // matchMasters
			TOURNAMENT: 'gameHTO',            // matchTournament
			SINGLEMATCH: 'gameHTO',           // matchSingleMatch
			LADDER: 'gameHTO',                // matchTournamentLadder
			PREPARATION: 'gameHTO',           // matchNewbie
			NT: 'nt',                         // upcomingNationalIcon
			YOUTHCOACH: 'youthTraining',      // upcomingYouthTrainingIcon
			YOUTHSCOUT: 'scoutCall',          // upcomingYouthCallScoutIcon
			YOUTHGAME: 'youth',               // matchLeague
			YOUTHFRIENDLY: 'youth',           // matchFriendly
			UNKNOWN: 'unknown',
			/* eslint-enable no-multi-spaces */
		};

		var L10N_PREFIX = 'dashBoardCalendar.events.';

		/** @type {Record<string, boolean>} */
		var midWeekGames = {};

		/** @type {Record<string, boolean>} */
		var weekendGames = {};

		const TUESDAY = 1, WEDNESDAY = 2, SATURDAY = 5;

		/**
		 * @typedef DashboardEvent
		 * @prop {string} type
		 * @prop {string} text
		 * @prop {Date}   date
		 * @prop {string} [team]
		 * @prop {string} [URL]
		 */
		/** @typedef FakedEvent
		 * @prop {string} type
		 * @prop {number} offset
		 * @prop {string} team
		 * @prop {string} URL
		 */

		/**
		 * @typedef ProcessedEvent
		 * @prop {number} alarmMinutes
		 * @prop {string} time
		 * @prop {string} UID
		 * @prop {string} [end]
		 */
		/** @typedef {DashboardEvent & ProcessedEvent} CalendarEvent */

		/**
		 * @param  {HTMLElement} div
		 * @param  {Date}        userMidnight
		 * @return {DashboardEvent}
		 */
		// eslint-disable-next-line complexity
		var parseEvent = function(div, userMidnight) {

			var image = div.querySelector('.largeMasterIcon');
			if (!image)
				return null;

			/** @type {DashboardEvent} */
			var ret = {};

			var desc = div.querySelector('.eventItemText');
			ret.text = desc.textContent.trim();

			/** @type {HTMLImageElement} */
			var logo = div.querySelector('.eventItemClubLogo img');
			if (logo) {
				ret.team = logo.title;
				if (typeof midWeekGames[ret.team] === 'undefined')
					midWeekGames[ret.team] = false;
				if (typeof weekendGames[ret.team] === 'undefined')
					weekendGames[ret.team] = false;
			}

			var time = ret.text.match(/^\d{2}\D\d{2}/) + '';
			var eTime = time.split(/\D/);

			var userDate = new Date(userMidnight);
			userDate.setHours(parseInt(eTime[0], 10), parseInt(eTime[1], 10));
			ret.date = Foxtrick.util.time.toHT(doc, userDate);

			var URL = desc.querySelector('a');
			ret.URL = URL ? URL.href : null;

			/** @type {NodeListOf<HTMLAnchorElement>} */
			var links = div.querySelectorAll('.eventItemLink a');

			var youthRe = /SourceSystem=Youth/i;
			var imageClass = image.className.replace(/largeMasterIcon /, '');
			switch (imageClass) {
				case 'matchLeague':
				case 'matchQualification':
					{
						let leagueLiveLink = links[links.length - 1];
						if (youthRe.test(leagueLiveLink.href)) {
							ret.type = EVENTS.YOUTHGAME;
							return ret;
						}
						else if (imageClass === 'matchLeague') {
							ret.type = EVENTS.LEAGUE;
						}
						else {
							ret.type = EVENTS.QUALIFICATION;
						}
					}

					weekendGames[ret.team] = true;

					break;
				case 'matchCupA':
				case 'matchCupB1':
				case 'matchCupB2':
				case 'matchCupB3':
				case 'matchCupC':
				case 'matchFriendly':
					if (!links.length) {
						ret.type = EVENTS.FRREMINDER;
						return ret;
					}

					{
						let liveLink = links[links.length - 1];
						if (youthRe.test(liveLink.href)) {
							ret.type = EVENTS.YOUTHFRIENDLY;
							return ret;
						}
					}

					ret.type = /Cup/.test(imageClass) ? EVENTS.CUP : EVENTS.FRIENDLY;

					// test if not a weekend friendly
					if (ret.date.getDay() > TUESDAY && ret.date.getDay() < SATURDAY)
						midWeekGames[ret.team] = true;

					break;
				case 'matchMasters':
					ret.type = EVENTS.MASTERS;
					break;
				case 'matchTournament':
					ret.type = EVENTS.TOURNAMENT;
					break;
				case 'matchSingleMatch':
					ret.type = EVENTS.SINGLEMATCH;
					break;
				case 'matchTournamentLadder':
					ret.type = EVENTS.LADDER;
					break;
				case 'matchNewbie':
					ret.type = EVENTS.PREPARATION;
					break;
				case 'upcomingNationalIcon':
					ret.type = EVENTS.NT;
					break;
				case 'upcomingTrainingIcon':
					ret.type = EVENTS.TRAINING;
					break;
				case 'upcomingEconomyIcon':
					ret.type = EVENTS.ECONOMY;
					break;
				case 'upcomingYouthTrainingIcon':
					ret.type = EVENTS.YOUTHCOACH;
					break;
				case 'upcomingYouthCallScoutIcon':
					ret.type = EVENTS.YOUTHSCOUT;
					break;
				default:
					ret.type = EVENTS.UNKNOWN;
					break;
			}
			return ret;
		};

		/** @type {NodeListOf<HTMLElement>} */
		var eventNodes = doc.querySelectorAll('#eventList > .eventItem');
		if (!eventNodes || !eventNodes.length)
			return;

		var MSECS_IN_MIN = Foxtrick.util.time.MSECS_IN_MIN;
		var MSECS_IN_HOUR = Foxtrick.util.time.MSECS_IN_HOUR;
		var DAYS_IN_WEEK = Foxtrick.util.time.DAYS_IN_WEEK;

		var htNow = Foxtrick.util.time.getHTDate(doc);
		if (!htNow) {
			Foxtrick.log('HT time missing');
			return;
		}

		var htWeekDay = htNow.getDay(); // sometimes dashboard calendar lags
		var htToday = new Date(htNow);
		Foxtrick.util.time.setMidnight(htToday);
		var HT_NOW_STRING = Foxtrick.util.time.toBareISOString(htNow);

		var userToday = Foxtrick.util.time.getDate(doc);
		if (!userToday) {
			Foxtrick.log('User time missing');
			return;
		}

		Foxtrick.util.time.setMidnight(userToday);

		const { season } = Foxtrick.util.time.gregorianToHT(userToday);

		var weekText = doc.querySelector('.calendarWeekText').textContent.trim();
		var week = Number(weekText.match(/\d+/).toString());

		// eslint-disable-next-line new-cap
		var monday = Foxtrick.util.time.HTToGregorian({ season, week });
		if (monday.getDay() == 0) {
			// DST problems
			monday.setHours(Foxtrick.util.time.HOURS_IN_DAY);
		}

		/** @type {DashboardEvent[][]} */
		var htDays = [];

		/** @type {Date[]} */
		var userDates = [];

		for (var i = 0; i < DAYS_IN_WEEK; ++i) {
			var dayHeader = doc.querySelector(`.eventCalendarWeekday${i}`);
			var dayNumberSpan = dayHeader.querySelector('.eventCalendarDay');
			var dayNumber = parseInt(dayNumberSpan.textContent.trim(), 10);

			var userDate = new Date(monday);
			var userDayNo = userDate.getDate();

			var dayDiff = dayNumber - userDayNo;
			if (Math.abs(dayDiff) > 10) {
				// different month
				// setting month first is only safe when userDayNo is smaller
				// and vice versa
				// otherwise we might overflow to yet another month
				if (dayNumber > userDayNo) {
					userDate.setMonth(userDate.getMonth() - 1);
					userDate.setDate(dayNumber);
				}
				else {
					userDate.setDate(dayNumber);
					userDate.setMonth(userDate.getMonth() + 1);
				}
			}
			else {
				userDate.setDate(dayNumber);
			}


			// sanity check
			if (userDate.getDay() !== i) {
				// eslint-disable-next-line no-magic-numbers
				let bug = userDate.toISOString().slice(2, 13).replace(/\D/g, '');
				let err =
					new Error(`Calendar fail: ${userDayNo} (${season}/${week}) => ${bug} != ${i}`);
				Foxtrick.log(err);
				return;
			}

			userDates.push(userDate);
			htDays.push([]);
		}

		Foxtrick.forEach(function(node) {
			let match = /eventDay(\d+)/.exec(node.className);
			if (match == null)
				return;

			let [_, dayStr] = match;
			let userDate = userDates[Number(dayStr)];
			let evnt = parseEvent(node, userDate);
			if (!evnt)
				return;

			let htDay = evnt.date.getDay();
			htDays[htDay].push(evnt);
		}, eventNodes);

		/**
		 * @param {FakedEvent} evnt
		 */
		var addFake = function(evnt) {
			let { offset, type } = evnt;

			let date = Foxtrick.util.time.addDaysToDate(htToday, offset);
			// eslint-disable-next-line no-magic-numbers
			date.setHours(18);
			let userTime = Foxtrick.util.time.toUser(doc, date);
			let userClock = Foxtrick.util.time.buildDate(userTime, { format: 'HH:MM' });
			let description = Foxtrick.L10n.getString(`${L10N_PREFIX}${type}.alarm`);

			/** @type {unknown} */
			let e = evnt;
			let evt = /** @type {DashboardEvent} */ (e);

			evt.date = date;
			evt.text = `${userClock} » ${description}`;

			let htDay = date.getDay();
			htDays[htDay].push(evt);
		};

		/** @type {CalendarEvent[]} */
		var events = [];

		/**
		 * @param {DashboardEvent} e
		 */
		// eslint-disable-next-line complexity
		var processEvent = function(e) {
			if (!e)
				return;

			var evnt = /** @type {CalendarEvent} */ (e);

			if (evnt.team)
				evnt.text += ` (${evnt.team})`;

			evnt.time = Foxtrick.util.time.toBareISOString(evnt.date);
			evnt.alarmMinutes = 30;

			const MATCH_LEN = 105, MATCH_LEN_CUP = 180, FINANCE_LEN = 30;
			const FRIENDLY_ALARM_HOURS = 6;

			var endTime;
			switch (evnt.type) {
				case EVENTS.LEAGUE:
				case EVENTS.NT:
				case EVENTS.YOUTHGAME:
				case EVENTS.TOURNAMENT:
					endTime = new Date(evnt.date.valueOf() + MATCH_LEN * MSECS_IN_MIN);
					break;
				case EVENTS.CUP:
				case EVENTS.SINGLEMATCH:
				case EVENTS.LADDER:
					endTime = new Date(evnt.date.valueOf() + MATCH_LEN_CUP * MSECS_IN_MIN);
					break;
				case EVENTS.TRAINING:
				case EVENTS.ECONOMY:
					endTime = new Date(evnt.date.valueOf() + FINANCE_LEN * MSECS_IN_MIN);
					break;
				case EVENTS.INTFRREMINDER:
					break;
				case EVENTS.WKNDFRREMINDER:
					endTime = new Date(evnt.date.valueOf() + FRIENDLY_ALARM_HOURS * MSECS_IN_HOUR);
					evnt.alarmMinutes = 60;
					break;
				default:
					break;
			}
			if (endTime)
				evnt.end = Foxtrick.util.time.toBareISOString(endTime);

			var UID = `${evnt.time}@foxtrick.org`;
			var hasId = false;
			if (evnt.URL) {
				var ID = /ID=(\d+)/i.exec(evnt.URL);
				if (ID) {
					let [_, id] = ID;
					UID = `${id}-${UID}`;
					hasId = true;
				}
				evnt.URL = Foxtrick.goToUrl(evnt.URL);
			}

			if (!hasId && evnt.team)
				UID = `${encodeURIComponent(evnt.team)}-${UID}`;

			evnt.UID = `${evnt.type}-${UID}`;
			events.push(evnt);
		};

		var CHALLENGE_URL = 'https://www.hattrick.org/goto.ashx?path=/Club/Challenges/';
		for (var d = 0, day; d < DAYS_IN_WEEK; ++d) {
			day = (htWeekDay + d) % DAYS_IN_WEEK;

			// fake events
			if (day == WEDNESDAY) {
				for (var team in midWeekGames) {
					if (midWeekGames[team])
						continue;

					addFake({
						offset: d,
						team: team,
						type: EVENTS.INTFRREMINDER,
						URL: CHALLENGE_URL,
					});
				}
			}
			else if (day == SATURDAY) {
				for (var wkndTeam in weekendGames) {
					if (weekendGames[wkndTeam])
						continue;

					addFake({
						offset: d,
						team: wkndTeam,
						type: EVENTS.WKNDFRREMINDER,
						URL: CHALLENGE_URL,
					});
				}
			}

			Foxtrick.forEach(processEvent, htDays[day]);
		}

		const WRAP = 75;

		var header = 'BEGIN:VCALENDAR\r\n' +
			'VERSION:2.0\r\n' +
			'PRODID:-//foxtrick//v' + Foxtrick.version + '//EN\r\n';

		var cal = Foxtrick.map(function(evnt) {
			var desc = 'DESCRIPTION:' + evnt.text;
			if (evnt.URL)
				desc += '\\n' + evnt.URL;

			var descEntry = Foxtrick.foldLines(desc, WRAP, '\r\n', '\t', true);

			var sum = Foxtrick.L10n.getString(L10N_PREFIX + evnt.type + '.summary');
			var summary = 'SUMMARY:' + sum.replace(/\n/mg, '');
			var sumEntry = Foxtrick.foldLines(summary, WRAP, '\r\n', '\t', true);

			var urlEntry = '';
			if (evnt.URL)
				urlEntry = Foxtrick.foldLines('URL:' + evnt.URL, WRAP, '\r\n', '\t', true);

			var alarm = Foxtrick.L10n.getString(L10N_PREFIX + evnt.type + '.alarm');
			var alarmDesc = 'DESCRIPTION:' + alarm.replace(/\n/mg, '\\n');
			var alarmEntry = Foxtrick.foldLines(alarmDesc, WRAP, '\r\n', '\t', true);

			return 'BEGIN:VEVENT\r\n' +
				'ORGANIZER;CN="Foxtrick":https://www.foxtrick.org\r\n' +
				'DTSTAMP:' + HT_NOW_STRING + '\r\n' +
				'UID:' + evnt.UID + '\r\n' +
				descEntry +
				sumEntry +
				'LOCATION:https://www.hattrick.org/goto.ashx?path=/\r\n' +
				'CATEGORIES:Personal\r\n' +
				'DTSTART;TZID=Europe/Zurich:' + evnt.time + '\r\n' +
				'DTEND;TZID=Europe/Zurich:' + (evnt.end || evnt.time) + '\r\n' +
				urlEntry +
				'TRANSP:TRANSPARENT\r\n' +
				'CLASS:PRIVATE\r\n' +
				'STATUS:CONFIRMED\r\n' +
				'BEGIN:VALARM\r\n' +
				alarmEntry +
				'ACTION:DISPLAY\r\n' +
				'TRIGGER;VALUE=DURATION:-PT' + evnt.alarmMinutes + 'M\r\n' +
				'X-KDE-KCALCORE-ENABLED:TRUE\r\n' +
				'END:VALARM\r\n' +
				'END:VEVENT\r\n';
		}, events);
		cal.unshift(header);
		cal.push('END:VCALENDAR\r\n');

		var newLink = Foxtrick.createFeaturedElement(doc, this, 'a');
		newLink.href = '#';
		newLink.style.display = 'flex';
		newLink.style.alignItems = 'center';

		var parent = newLink.appendChild(doc.createElement('div'));
		var title = Foxtrick.L10n.getString('dashBoardCalendar.export');
		Foxtrick.addImage(doc, parent, {
			src: Foxtrick.InternalPath + 'resources/img/calendar-day.png',
			alt: title,
			title: title,
		});
		parent.style.margin = '0.5em';

		var textContainer = newLink.appendChild(doc.createElement('div'));
		textContainer.textContent = Foxtrick.L10n.getString('button.export');

		Foxtrick.onClick(newLink, function(ev) {
			// eslint-disable-next-line no-invalid-this
			var doc = this.ownerDocument;
			var name = 'ht-cal-' + htToday.toJSON().slice(0, 10) + '.ics';
			var mime = 'text/calendar;charset=utf-8';
			Foxtrick.saveAs(doc, cal, name, mime);
		});
		doc.querySelector('#eventList').appendChild(newLink);
	},
};
