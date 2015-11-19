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
			TRAINING: 'training',           // upcomingTrainingIcon
			ECONOMY: 'economy',             // upcomingEconomyIcon
			FRREMINDER: 'frReminder',       // matchFriendly
			INTFRREMINDER: 'intFrReminder', // fake event
			LEAGUE: 'game',                 // matchLeague
			FRIENDLY: 'game',               // matchFriendly
			CUP: 'cup',                     // matchCup
			QUALIFICATION: 'cup',           // matchQualification
			MASTERS: 'cup',                 // matchMasters
			TOURNAMENT: 'gameHTO',          // matchTournament
			SINGLEMATCH: 'gameHTO',         // matchSingleMatch
			LADDER: 'gameHTO',              // matchTournamentLadder
			PREPARATION: 'gameHTO',         // matchNewbie
			NT: 'nt',                       // upcomingNationalIcon
			YOUTHCOACH: 'youthTraining',    // upcomingYouthTrainingIcon
			YOUTHSCOUT: 'scoutCall',        // upcomingYouthCallScoutIcon
			YOUTHGAME: 'youth',             // matchLeague
			YOUTHFRIENDLY: 'youth',         // matchFriendly
			UNKNOWN: 'unknown',
			// jscs:enable disallowMultipleSpaces
		};

		var hasMidWeekGame = false;

		var parseEvent = function(div) {
			var image = div.querySelector('.largeMasterIcon');
			if (!image)
				return null;

			var ret = {};
			ret.alarmMinutes = 30;

			var desc = div.querySelector('.eventItemText');
			ret.text = desc.textContent.trim();

			var logo = div.querySelector('.eventItemClubLogo img');
			if (logo) {
				ret.team = logo.title;
				ret.text += ' (' + ret.team + ')';
			}

			ret.time = ret.text.match(/^\d{2}\D\d{2}/) + '';
			var URL = desc.querySelector('a');
			ret.URL = URL ? Foxtrick.goToUrl(URL.href) : null;

			var links = div.querySelectorAll('.eventItemLink a');

			var youthRe = /SourceSystem=Youth/i;
			var imageClass = image.className.replace(/largeMasterIcon /, '');
			switch (imageClass) {
				case 'upcomingTrainingIcon': ret.type = EVENTS.TRAINING; break;
				case 'upcomingEconomyIcon': ret.type = EVENTS.ECONOMY; break;
				case 'matchLeague':
					var leagueLiveLink = links[links.length - 1];
					if (youthRe.test(leagueLiveLink.href))
						ret.type = EVENTS.YOUTHGAME;
					else
						ret.type = EVENTS.LEAGUE;
				break;
				case 'matchFriendly':
					if (!links.length) {
						ret.type = EVENTS.FRREMINDER;
						return ret;
					}

					var friendlyLiveLink = links[links.length - 1];
					if (youthRe.test(friendlyLiveLink.href))
						ret.type = EVENTS.YOUTHFRIENDLY;
					else {
						// FIXME: weekend friendlies
						hasMidWeekGame = true;
						ret.type = EVENTS.FRIENDLY;
					}
				break;
				case 'matchCupA':
				case 'matchCupB1':
				case 'matchCupB2':
				case 'matchCupB3':
				case 'matchCupC':
					ret.type = EVENTS.CUP;
					hasMidWeekGame = true;
				break;
				case 'matchQualification': ret.type = EVENTS.QUALIFICATION; break;
				case 'matchMasters': ret.type = EVENTS.MASTERS; break;
				case 'matchTournament': ret.type = EVENTS.TOURNAMENT; break;
				case 'matchSingleMatch': ret.type = EVENTS.SINGLEMATCH; break;
				case 'matchTournamentLadder': ret.type = EVENTS.LADDER; break;
				case 'matchNewbie': ret.type = EVENTS.PREPARATION; break;
				case 'upcomingNationalIcon': ret.type = EVENTS.NT; break;
				case 'upcomingYouthTrainingIcon': ret.type = EVENTS.YOUTHCOACH; break;
				case 'upcomingYouthCallScoutIcon':
					ret.alarmMinutes = 120;
					ret.type = EVENTS.YOUTHSCOUT;
				break;
				default: ret.type = EVENTS.UNKNOWN; break;
			}
			return ret;
		};

		var eventNodes = doc.querySelectorAll('#eventList > div');
		if (!eventNodes || !eventNodes.length)
			return;

		// FIXME date detection
		var calWeekDay, eventDays = [[], [], [], [], [], [], []];
		for (var j = 0, z = eventNodes.length; j < z; j++) {
			for (var i = 0; i < 7; ++i) {
				if (Foxtrick.hasClass(eventNodes[j], 'eventDay' + i)) {
					eventDays[i].push(parseEvent(eventNodes[j]));
					// FIXME
					if (j === 0)
						calWeekDay = i;
				}
			}
		}
		if (typeof calWeekDay == 'undefined')
			return;

		var MSEC_IN_MIN = Foxtrick.util.time.MSECS_IN_MIN;

		var now = Foxtrick.util.time.getHTDate(doc);
		// FIXME
		var currentWeekDay = now.getDay(); // sometimes dashboard calendar lags
		var today = new Date(now);
		Foxtrick.util.time.setMidnight(today);
		now = Foxtrick.util.time.toBareISOString(now);

		var events = [];

		for (var i = 0, day; i < 7; ++i) {
			// FIXME
			day = (currentWeekDay + i) % 7;
			if (day == 2 && !hasMidWeekGame) {
				var friendlyTime = Foxtrick.util.time.addDaysToDate(today, i);
				friendlyTime.setHours(18);
				friendlyTime = Foxtrick.util.time.toBareISOString(friendlyTime);
				events.push({
					time: friendlyTime,
					type: EVENTS.INTFRREMINDER,
					UID: EVENTS.INTFRREMINDER + '-' + friendlyTime + '@foxtrick.org',
					// FIXME
					text: '18:00 » ' +
						Foxtrick.L10n.getString('dashBoardCalendar.events.' + EVENTS.INTFRREMINDER +
						                       '.alarm'),
					URL: 'https://www.hattrick.org/goto.ashx?path=/Club/Challenges/',
				});
			}
			for (var j = 0, z = eventDays[day].length; j < z; j++) {
				var evnt = eventDays[day][j];
				if (!evnt)
					continue;

				// FIXME
				var eTime = evnt.time.split(/\D/);
				var eventTime = Foxtrick.util.time.addDaysToDate(today, i);
				eventTime.setHours(eTime[0]);
				eventTime.setMinutes(eTime[1]);
				evnt.time = Foxtrick.util.time.toBareISOString(eventTime);

				var endTime = 0;
				switch (evnt.type) {
					case EVENTS.LEAGUE:
					case EVENTS.NT:
					case EVENTS.YOUTHGAME:
					case EVENTS.TOURNAMENT:
						endTime = new Date(eventTime.valueOf() + 105 * MSEC_IN_MIN);
					break;
					case EVENTS.CUP:
					case EVENTS.SINGLEMATCH:
					case EVENTS.LADDER:
						endTime = new Date(eventTime.valueOf() + 180 * MSEC_IN_MIN);
					break;
					case EVENTS.TRAINING:
					case EVENTS.ECONOMY:
						endTime = new Date(eventTime.valueOf() + 300 * MSEC_IN_MIN);
					break;
				}
				if (endTime)
					evnt.end = Foxtrick.util.time.toBareISOString(endTime);

				var UID = evnt.time + '@foxtrick.org';
				if (evnt.URL) {
					var ID = /ID=(\d+)/i.exec(evnt.URL);
					if (ID && ID[1])
						UID = ID[1] + '-' + UID;
				}
				if (evnt.team)
					UID = encodeURIComponent(evnt.team) + '-' + UID;

				evnt.UID = evnt.type + '-' + UID;
				events.push(evnt);
			}
		}

		var header = 'BEGIN:VCALENDAR\r\n' +
			'VERSION:2.0\r\n' +
			'PRODID:-//foxtrick//v' + Foxtrick.version() + '//EN\r\n';

		var cal = Foxtrick.map(function(evnt) {
			var desc = 'DESCRIPTION:' + evnt.text;
			if (evnt.URL)
				desc += '\\n' + evnt.URL;
			var descEntry = Foxtrick.foldLines(desc, 75, '\r\n', '\t', true);

			var sum = Foxtrick.L10n.getString('dashBoardCalendar.events.' + evnt.type + '.summary');
			var summary = 'SUMMARY:' + sum.replace(/\n/mg, '');
			var sumEntry = Foxtrick.foldLines(summary, 75, '\r\n', '\t', true);

			var urlEntry = '';
			if (evnt.URL)
				urlEntry = Foxtrick.foldLines('URL:' + evnt.URL, 75, '\r\n', '\t', true);

			var alarm = Foxtrick.L10n.getString('dashBoardCalendar.events.' + evnt.type + '.alarm');
			var alarmDesc = 'DESCRIPTION:' + alarm.replace(/\n/mg, '\\n');
			var alarmEntry = Foxtrick.foldLines(alarmDesc, 75, '\r\n', '\t', true);

			return 'BEGIN:VEVENT\r\n' +
				'ORGANIZER;CN="Foxtrick":http://www.foxtrick.org\r\n' +
				'DTSTAMP:' + now + '\r\n' +
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
			// using view.Blob here otherwise it's undefined in Android
			var blob = new ev.view.Blob(cal, { type: 'text/calendar;charset=utf-8' });
			Foxtrick.saveAs(blob, 'ht-cal-' + today.toJSON().slice(0, 10) + '.ics');
		});
		var MAIN = Foxtrick.getMainIDPrefix();
		var br = doc.querySelector('#' + MAIN + 'lnkArchive + br');
		br.parentNode.insertBefore(newLink, br);
	},
};
