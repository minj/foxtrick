'use strict';
/**
 * dashboard-calendar.js
 * Export dashboard calendar to iCal format
 * @author LA-MJ
 */

Foxtrick.modules['DashboardCalendar'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['dashboard'],
	run: function(doc) {
		// this is mostly for strings/iCal handling
		var EVENTS = {
			// jscs:disable disallowMultipleSpaces
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
			// jscs:enable disallowMultipleSpaces
		};

		var L10N_PREFIX = 'dashBoardCalendar.events.';

		var midWeekGames = {};
		var weekendGames = {};

		var parseEvent = function(div, userMidnight) {
			var image = div.querySelector('.largeMasterIcon');
			if (!image)
				return null;

			var ret = {};

			var desc = div.querySelector('.eventItemText');
			ret.text = desc.textContent.trim();

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
			userDate.setHours(eTime[0], eTime[1]);
			ret.date = Foxtrick.util.time.toHT(doc, userDate);

			var URL = desc.querySelector('a');
			ret.URL = URL ? URL.href : null;

			var links = div.querySelectorAll('.eventItemLink a');

			var youthRe = /SourceSystem=Youth/i;
			var imageClass = image.className.replace(/largeMasterIcon /, '');
			switch (imageClass) {
				case 'matchLeague':
				case 'matchQualification':
					var leagueLiveLink = links[links.length - 1];
					if (youthRe.test(leagueLiveLink.href)) {
						ret.type = EVENTS.YOUTHGAME;
						return ret;
					}
					else if (imageClass === 'matchLeague')
						ret.type = EVENTS.LEAGUE;
					else
						ret.type = EVENTS.QUALIFICATION;

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
					var liveLink = links[links.length - 1];
					if (youthRe.test(liveLink.href)) {
						ret.type = EVENTS.YOUTHFRIENDLY;
						return ret;
					}

					if (/Cup/.test(imageClass)) {
						ret.type = EVENTS.CUP;
					}
					else {
						ret.type = EVENTS.FRIENDLY;
					}

					// test if not a weekend friendly
					if (ret.date.getDay() > 1 && ret.date.getDay() < 5) {
						midWeekGames[ret.team] = true;
					}
				break;
				case 'matchMasters': ret.type = EVENTS.MASTERS; break;
				case 'matchTournament': ret.type = EVENTS.TOURNAMENT; break;
				case 'matchSingleMatch': ret.type = EVENTS.SINGLEMATCH; break;
				case 'matchTournamentLadder': ret.type = EVENTS.LADDER; break;
				case 'matchNewbie': ret.type = EVENTS.PREPARATION; break;
				case 'upcomingNationalIcon': ret.type = EVENTS.NT; break;
				case 'upcomingTrainingIcon': ret.type = EVENTS.TRAINING; break;
				case 'upcomingEconomyIcon': ret.type = EVENTS.ECONOMY; break;
				case 'upcomingYouthTrainingIcon': ret.type = EVENTS.YOUTHCOACH; break;
				case 'upcomingYouthCallScoutIcon': ret.type = EVENTS.YOUTHSCOUT; break;
				default: ret.type = EVENTS.UNKNOWN; break;
			}
			return ret;
		};

		var eventNodes = doc.querySelectorAll('#eventList > div');
		if (!eventNodes || !eventNodes.length)
			return;

		var MSECS_IN_MIN = Foxtrick.util.time.MSECS_IN_MIN;
		var DAYS_IN_WEEK = Foxtrick.util.time.DAYS_IN_WEEK;

		var htNow = Foxtrick.util.time.getHTDate(doc);
		var htWeekDay = htNow.getDay(); // sometimes dashboard calendar lags
		var htToday = new Date(htNow);
		Foxtrick.util.time.setMidnight(htToday);
		htNow = Foxtrick.util.time.toBareISOString(htNow);

		var userToday = Foxtrick.util.time.getDate(doc);
		Foxtrick.util.time.setMidnight(userToday);

		var htDays = [], userDates = [];

		for (var i = 0; i < DAYS_IN_WEEK; ++i) {
			var dayHeader = doc.querySelector('.eventCalendarWeekday' + i);
			var dayNumberSpan = dayHeader.querySelector('.eventCalendarDay');
			var dayNumber = dayNumberSpan.textContent.trim();

			var userDate = new Date(userToday);
			var userDayNumber = userDate.getDate();

			var dayDiff = dayNumber - userDayNumber;
			if (Math.abs(dayDiff) > 19) {
				// different month
				userDate.setMonth(userDate.getMonth() + (dayDiff > 0 ? -1 : 1));
			}
			userDate.setDate(dayNumber);

			// sanity check
			if (userDate.getDay() !== i) {
				Foxtrick.error('Failed to detect calendar day');
				return;
			}

			userDates.push(userDate);
			htDays.push([]);
		}

		Foxtrick.forEach(function(node) {
			var day = node.className.match(/eventDay(\d+)/)[1];
			var userDate = userDates[day];
			var evnt = parseEvent(node, userDate);
			if (!evnt)
				return;

			var htDay = evnt.date.getDay();
			htDays[htDay].push(evnt);
		}, eventNodes);

		var addFake = function(evnt) {
			if (!evnt.date) {
				var date = Foxtrick.util.time.addDaysToDate(htToday, evnt.offset);
				date.setHours(18);
				evnt.date = date;
			}
			var userTime = Foxtrick.util.time.toUser(doc, evnt.date);
			var userClock = Foxtrick.util.time.buildDate(userTime, { format: 'HH:MM' });
			var description = Foxtrick.L10n.getString(L10N_PREFIX + evnt.type + '.alarm');
			evnt.text = userClock + ' » ' + description;

			var htDay = evnt.date.getDay();
			htDays[htDay].push(evnt);
		};

		var events = [];
		var processEvent = function(evnt) {
			if (!evnt)
				return;

			if (evnt.team) {
				evnt.text += ' (' + evnt.team + ')';
			}

			evnt.time = Foxtrick.util.time.toBareISOString(evnt.date);
			evnt.alarmMinutes = 30;

			var endTime = 0;
			switch (evnt.type) {
				case EVENTS.LEAGUE:
				case EVENTS.NT:
				case EVENTS.YOUTHGAME:
				case EVENTS.TOURNAMENT:
					endTime = new Date(evnt.date.valueOf() + 105 * MSECS_IN_MIN);
				break;
				case EVENTS.CUP:
				case EVENTS.SINGLEMATCH:
				case EVENTS.LADDER:
					endTime = new Date(evnt.date.valueOf() + 180 * MSECS_IN_MIN);
				break;
				case EVENTS.TRAINING:
				case EVENTS.ECONOMY:
					endTime = new Date(evnt.date.valueOf() + 30 * MSECS_IN_MIN);
				break;
				case EVENTS.INTFRREMINDER:
				break;
				case EVENTS.WKNDFRREMINDER:
					endTime = new Date(evnt.date.valueOf() + 6 * MSECS_IN_HOUR);
					evnt.alarmMinutes = 60;
				break;
			}
			if (endTime)
				evnt.end = Foxtrick.util.time.toBareISOString(endTime);

			var UID = evnt.time + '@foxtrick.org';
			var hasId = false;
			if (evnt.URL) {
				var ID = /ID=(\d+)/i.exec(evnt.URL);
				if (ID && ID[1]) {
					UID = ID[1] + '-' + UID;
					hasId = true;
				}
				evnt.URL = Foxtrick.goToUrl(evnt.URL);
			}

			if (!hasId && evnt.team)
				UID = encodeURIComponent(evnt.team) + '-' + UID;

			evnt.UID = evnt.type + '-' + UID;
			events.push(evnt);
		};

		var CHALLENGE_URL = 'https://www.hattrick.org/goto.ashx?path=/Club/Challenges/';
		for (var i = 0, day; i < DAYS_IN_WEEK; ++i) {
			day = (htWeekDay + i) % DAYS_IN_WEEK;

			// fake events
			if (day == 2) {
				for (var team in midWeekGames) {
					if (midWeekGames[team])
						continue;

					addFake({
						offset: i,
						team: team,
						type: EVENTS.INTFRREMINDER,
						URL: CHALLENGE_URL,
					});
				}
			}
			else if (day == 5) {
				for (var wkndTeam in weekendGames) {
					if (weekendGames[wkndTeam])
						continue;

					addFake({
						offset: i,
						team: wkndTeam,
						type: EVENTS.WKNDFRREMINDER,
						URL: CHALLENGE_URL,
					});
				}
			}

			Foxtrick.forEach(processEvent, htDays[day]);
		}

		var header = 'BEGIN:VCALENDAR\r\n' +
			'VERSION:2.0\r\n' +
			'PRODID:-//foxtrick//v' + Foxtrick.version() + '//EN\r\n';

		var cal = Foxtrick.map(function(evnt) {
			var desc = 'DESCRIPTION:' + evnt.text;
			if (evnt.URL)
				desc += '\\n' + evnt.URL;
			var descEntry = Foxtrick.foldLines(desc, 75, '\r\n', '\t', true);

			var sum = Foxtrick.L10n.getString(L10N_PREFIX + evnt.type + '.summary');
			var summary = 'SUMMARY:' + sum.replace(/\n/mg, '');
			var sumEntry = Foxtrick.foldLines(summary, 75, '\r\n', '\t', true);

			var urlEntry = '';
			if (evnt.URL)
				urlEntry = Foxtrick.foldLines('URL:' + evnt.URL, 75, '\r\n', '\t', true);

			var alarm = Foxtrick.L10n.getString(L10N_PREFIX + evnt.type + '.alarm');
			var alarmDesc = 'DESCRIPTION:' + alarm.replace(/\n/mg, '\\n');
			var alarmEntry = Foxtrick.foldLines(alarmDesc, 75, '\r\n', '\t', true);

			return 'BEGIN:VEVENT\r\n' +
				'ORGANIZER;CN="Foxtrick":https://www.foxtrick.org\r\n' +
				'DTSTAMP:' + htNow + '\r\n' +
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
		Foxtrick.addClass(newLink, 'pmArchiveLink float_right');
		newLink.href = '#';

		var textContainer = newLink.appendChild(doc.createElement('div'));
		Foxtrick.addClass(textContainer, 'float_left');
		textContainer.style.margin = '0 10px';
		textContainer.textContent = Foxtrick.L10n.getString('button.export');

		var parent = newLink.appendChild(doc.createElement('div'));
		Foxtrick.addClass(parent, 'float_right');
		var title = Foxtrick.L10n.getString('dashBoardCalendar.export');
		Foxtrick.addImage(doc, parent, {
			src: Foxtrick.InternalPath + 'resources/img/calendar-day.png',
			alt: title,
			title: title,
		});
		Foxtrick.onClick(newLink, function(ev) {
			var doc = this.ownerDocument;
			var name = 'ht-cal-' + htToday.toJSON().slice(0, 10) + '.ics';
			var mime = 'text/calendar;charset=utf-8';
			Foxtrick.saveAs(doc, cal, name, mime);
		});
		var MAIN = Foxtrick.getMainIDPrefix();
		var br = doc.querySelector('#' + MAIN + 'lnkArchive + br');
		br.parentNode.insertBefore(newLink, br);
	},
};
