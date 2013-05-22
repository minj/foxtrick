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
			TRAINING: 'training',					//upcomingTrainingIcon
			ECONOMY: 'economy',						//upcomingEconomyIcon
			FRREMINDER: 'frReminder',				//matchFriendly
			INTFRREMINDER: 'intFrReminder',			//fake event
			LEAGUE: 'game',							//matchLeague
			FRIENDLY: 'game',						//matchFriendly
			CUP: 'cup',								//matchCup
			QUALIFICATION: 'cup',					//matchQualification
			MASTERS: 'cup',							//matchMasters
			TOURNAMENT: 'gameHTO',					//matchTournament
			SINGLEMATCH: 'gameHTO',					//matchSingleMatch
			PREPARATION: 'gameHTO',					//matchNewbie
			NT: 'nt',								//upcomingNationalIcon
			YOUTHCOACH: 'youthTraining',			//upcomingYouthTrainingIcon
			YOUTHSCOUT: 'scoutCall',				//upcomingYouthCallScoutIcon
			YOUTHGAME: 'youth',						//matchLeague
			YOUTHFRIENDLY: 'youth',					//matchFriendly?
			UNKNOWN: 'unknown',
		};

		var hasMidWeekGame = false;

		var parseEvent = function(div) {
			var ret = {};
			var desc = div.getElementsByClassName('eventItemText')[0];
			ret.text = desc.textContent;
			ret.text = ret.text.replace(/^\s\s*/, '');
			ret.time = ret.text.match(/^\d{2}:\d{2}/) + '';
			var URL = desc.getElementsByTagName('a')[0];
			ret.URL = (URL) ? URL.href : null;

			var links = div.getElementsByClassName('eventItemLink')[0].getElementsByTagName('a');

			var image = div.getElementsByClassName('largeMasterIcon')[0];
			if (image) {
				var imageClass = image.className.replace(/largeMasterIcon /, '');
				switch (imageClass) {
					case 'upcomingTrainingIcon': ret.type = EVENTS.TRAINING; break;
					case 'upcomingEconomyIcon': ret.type = EVENTS.ECONOMY; break;
					case 'matchLeague':
						var liveLink = links[links.length - 1];
						if (liveLink.href.match(/SourceSystem=Youth/i))
							ret.type = EVENTS.YOUTHGAME;
						else
							ret.type = EVENTS.LEAGUE;
					break;
					case 'matchFriendly':
						if (!links.length) {
							ret.type = EVENTS.FRREMINDER;
							return ret;
						}
						var liveLink = links[links.length - 1];
						if (liveLink.href.match(/SourceSystem=Youth/i))
							ret.type = EVENTS.YOUTHFRIENDLY;
						else	{
							hasMidWeekGame = true;
							ret.type = EVENTS.FRIENDLY;
						}
					break;
					case 'matchCup': ret.type = EVENTS.CUP; hasMidWeekGame = true; break;
					case 'matchQualification': ret.type = EVENTS.QUALIFICATION; break;
					case 'matchMasters': ret.type = EVENTS.MASTERS; break;
					case 'matchTournament': ret.type = EVENTS.TOURNAMENT; break;
					case 'matchSingleMatch': ret.type = EVENTS.SINGLEMATCH; break;
					case 'matchNewbie': ret.type = EVENTS.PREPARATION; break;
					case 'upcomingNationalIcon': ret.type = EVENTS.NT; break;
					case 'upcomingYouthTrainingIcon': ret.type = EVENTS.YOUTHCOACH; break;
					case 'upcomingYouthCallScoutIcon': ret.type = EVENTS.YOUTHSCOUT; break;
					default: ret.type = EVENTS.UNKNOWN; break;
				}
				return ret;
			}
			else
				return null;
		};

		var eventNodes = doc.querySelectorAll('#eventList > div');
		if (!eventNodes || !eventNodes.length) return;

		var calWeekDay, eventDays = [[], [], [], [], [], [], []];
		for (var j = 0, z = eventNodes.length; j < z; j++) {
			for (var i = 0; i < 7; ++i) {
				if (Foxtrick.hasClass(eventNodes[j], 'eventDay' + i)) {
					eventDays[i].push(parseEvent(eventNodes[j]));
					if (j == 0)	calWeekDay = i;
				}
			}
		}
		if (typeof calWeekDay == 'undefined') return;

		var now = Foxtrick.util.time.getHtDate(doc);
		var currentWeekDay = now.getDay(); // sometimes dashboard calendar lags
		var month = now.getMonth() + 1;
		month = month > 9 ? month : '0' + new String(month);
		var day = now.getDate();
		day = day > 9 ? day : '0' + new String(day);
		var todayString = now.getFullYear() + '-' + month + '-' + day;
		var today = new Date(todayString);
		now = Foxtrick.util.time.toBareISOString(now);

		var events = [];

		for (var i = 0, day; i < 7; ++i) {
			day = (currentWeekDay + i) % 7;
			if (day == 2 && !hasMidWeekGame) {
				var eventTime = Foxtrick.util.time.addDaysToDate(today, i);
				eventTime.setHours(18);
				eventTime = Foxtrick.util.time.toBareISOString(eventTime);
				events.push({
					time: eventTime,
					type: EVENTS.INTFRREMINDER,
					UID: EVENTS.INTFRREMINDER + '-' + eventTime + '@foxtrick.org',
					text: '18:00 » ' +
						Foxtrickl10n.getString('dashBoardCalendar.events.' + EVENTS.INTFRREMINDER +
						                       '.alarm'),
					URL: 'http://www.hattrick.org/Club/Challenges/Default.aspx'
				});
			}
			for (var j = 0, z = eventDays[day].length; j < z; j++) {
				var event = eventDays[day][j];
				if (event) {
					var eTime = event.time.split(':');
					var eventTime = Foxtrick.util.time.addDaysToDate(today, i);
					eventTime.setHours(eTime[0]);
					eventTime.setMinutes(eTime[1]);
					event.time = Foxtrick.util.time.toBareISOString(eventTime);

					switch (event.type) {
						case EVENTS.LEAGUE:
						case EVENTS.NT:
						case EVENTS.YOUTHGAME:
						case EVENTS.TOURNAMENT:
							event.end = Foxtrick.util.time
								.toBareISOString(new Date(eventTime.valueOf() + 105 * 60 * 1000));
						break;
						case EVENTS.CUP:
						case EVENTS.SINGLEMATCH:
							event.end = Foxtrick.util.time
								.toBareISOString(new Date(eventTime.valueOf() + 180 * 60 * 1000));
						break;
						case EVENTS.TRAINING:
						case EVENTS.ECONOMY:
							event.end = Foxtrick.util.time
								.toBareISOString(new Date(eventTime.valueOf() + 30 * 60 * 1000));
						break;
					}

					var UID = event.time + '@foxtrick.org';
					if (event.URL) {
						var ID = /ID=(\d+)/i.exec(event.URL);
						if (ID && ID[1]) UID = ID[1] + '-' + UID;
					}
					UID = event.type + '-' + UID;
					event.UID = UID;
					events.push(event);
				}
			}
		}

		var cal = [];
		cal.push(
			'BEGIN:VCALENDAR\r\n' +
			'VERSION:2.0\r\n' +
			'PRODID:-//foxtrick//v' + Foxtrick.version() + '//EN\r\n'
		);

		for (var i = 0, z = events.length; i < z; ++i)
			cal.push(
				'BEGIN:VEVENT\r\n' +
				'ORGANIZER;CN="Foxtrick":http://www.foxtrick.org\r\n' +
				'DTSTAMP:' + now + '\r\n' +
				'UID:' + events[i].UID + '\r\n' +
				Foxtrick.foldLines('DESCRIPTION:' + events[i].text +
				                   ((events[i].URL) ? '\\n' + events[i].URL : ''),
				                   75, '\r\n', '\t', true) + '' +
				'SUMMARY:' + Foxtrick.foldLines(Foxtrickl10n.getString('dashBoardCalendar.events.' +
				                                events[i].type + '.summary').replace(/\n/mg, ''), 75,
												'\r\n', '\t', true) + '' +
				'LOCATION:http://www.hattrick.org\r\n' +
				'CATEGORIES:Personal\r\n' +
				'DTSTART;TZID=Europe/Zurich:' + events[i].time + '\r\n' +
				'DTEND;TZID=Europe/Zurich:' + (events[i].end || events[i].time) + '\r\n' +
				((events[i].URL) ?
					Foxtrick.foldLines('URL:' + events[i].URL, 75, '\r\n', '\t', true) : '') + '' +
				'TRANSP:TRANSPARENT\r\n' +
				'CLASS:PRIVATE\r\n' +
				'STATUS:CONFIRMED\r\n' +
				'BEGIN:VALARM\r\n' +
				Foxtrick.foldLines('DESCRIPTION:' +
				                   Foxtrickl10n.getString('dashBoardCalendar.events.' +
				                                          events[i].type + '.alarm')
				                   .replace(/\n/mg, '\\n'), 75, '\r\n', '\t', true) + '' +
				'ACTION:DISPLAY\r\n' +
				'TRIGGER;VALUE=DURATION:-PT' + (events[i].type == EVENTS.YOUTHSCOUT ? 120 : 30) +
					'M\r\n' +
				'X-KDE-KCALCORE-ENABLED:TRUE\r\n' +
				'END:VALARM\r\n' +
				'END:VEVENT\r\n'
			);
		cal.push('END:VCALENDAR\r\n');

		var newLink = Foxtrick.createFeaturedElement(doc, this, 'a');
		Foxtrick.addClass(newLink, 'pmArchiveLink float_right');
		newLink.href = '#';
		var textContainer = newLink.appendChild(doc.createElement('div'));
		Foxtrick.addClass(textContainer, 'float_left');
		textContainer.style.margin = '0 10px';
		textContainer.textContent = Foxtrickl10n.getString('button.export');
		var parent = newLink.appendChild(doc.createElement('div'));
		Foxtrick.addClass(parent, 'float_right');
		var title = Foxtrickl10n.getString('dashBoardCalendar.export');
		Foxtrick.addImage(doc, parent,
		                  { src: Foxtrick.InternalPath + 'resources/img/calendar-day.png',
		                  alt: title, title: title });
		Foxtrick.onClick(newLink, function() {
			saveAs(new Blob(cal, {type: 'text/calendar;charset=utf-8'}), 'ht-cal-' + todayString + '.ics');
		});
		var br = doc.querySelector('#ctl00_ctl00_CPContent_CPMain_lnkArchive + br');
		br.parentNode.insertBefore(newLink,	br);
	},
};
