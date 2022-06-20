/**
 * match-weather.js
 * add ht and irl weather for today and tomorrow on match page
 * @author teles
 */

'use strict';

Foxtrick.modules['MatchWeather'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['match'],
	OPTIONS: ['Irl'],
	CSS: Foxtrick.InternalPath + 'resources/css/match-weather.css',

	run: function(doc) {
		var module = this;
		if (!Foxtrick.Pages.Match.isPrematch(doc))
			return;

		if (Foxtrick.Pages.Match.isNewLive(doc))
			return;

		var arenaLink = doc.querySelector('#mainBody a[href*="ArenaID="]');
		if (!arenaLink) {
			// tournaments have no arena
			return;
		}

		var arenaId = Foxtrick.getUrlParam(arenaLink.href, 'arenaId');

		/** @type {CHPPParams} */
		var parameters = [
			['file', 'arenadetails'],
			['version', '1.5'],
			['arenaId', parseInt(arenaId, 10)],
		];
		Foxtrick.util.api.retrieve(doc, parameters, { cache: 'session' }, (xml, errorText) => {
			if (!xml || errorText) {
				Foxtrick.log(errorText);
				return;
			}

			var regionID = xml.num('RegionID');
			module.fetchRegion(doc, regionID);
		});
	},

	showWeather: function(doc, data) {
		var expectedText = Foxtrick.L10n.getString('matchWeather.expected');
		var todayText = Foxtrick.L10n.getString('matchWeather.today');
		var tomorrowText = Foxtrick.L10n.getString('matchWeather.tomorrow');
		var irlNowText = Foxtrick.L10n.getString('matchWeather.irltoday');
		var irlTomorrowText = Foxtrick.L10n.getString('matchWeather.irltomorrow');

		var preMatchPanel = Foxtrick.Pages.Match.getPreMatchPanel(doc);

		// .arenaInfo for supporters, div[class=""] otherwise
		var [info] = [...preMatchPanel.children].filter(c => c.matches('div'));

		var table = Foxtrick.createFeaturedElement(doc, this, 'table');
		table.id = 'ft-matchWeather';
		// inserting after the separator so that full width would be available
		var separator = preMatchPanel.querySelector('.separator');
		Foxtrick.insertAfter(table, separator);

		var trExpected = table.insertRow(-1);
		var tdExpected = trExpected.insertCell(-1);

		// image might be missing in NT but the paragraph is still there
		var weatherP = info.querySelector('p:last-child');
		var img = weatherP.querySelector('img');
		Foxtrick.appendChildren(tdExpected, weatherP.childNodes);
		if (img) {
			// add text only if image exists
			tdExpected.appendChild(doc.createTextNode(' ' + expectedText));
		}

		var trNow = table.insertRow(-1);
		var tdNow = trNow.insertCell(-1);
		Foxtrick.addImage(doc, tdNow, {
			src: 'Img.axd?res=Weather&img=weather' + data.weatherNow + '.png',
		}, false, function() {
			tdNow.appendChild(doc.createTextNode(' ' + todayText));
		});

		var trTomorrow = table.insertRow(-1);
		var tdTomorrow = trTomorrow.insertCell(-1);
		Foxtrick.addImage(doc, tdTomorrow, {
			src: 'Img.axd?res=Weather&img=weather' + data.weatherTomorrow + '.png',
		}, false, function() {
			tdTomorrow.appendChild(doc.createTextNode(' ' + tomorrowText));
		});

		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchWeather', 'Irl')) {
			var ccAttr = trExpected.insertCell(-1);
			ccAttr.className = 'ft-irlWeather';

			var bold = doc.createElement('strong');
			bold.textContent = Foxtrick.L10n.getString('matchWeather.opw');
			ccAttr.appendChild(bold);

			if (typeof data.irlNow !== 'undefined') {
				var tdIrlNow = trNow.insertCell(-1);
				tdIrlNow.className = 'ft-irlWeather';
				Foxtrick.addImage(doc, tdIrlNow, {
					src: 'Img.axd?res=Weather&img=weather' + data.irlNow + '.png',
				}, false, function() {
					tdIrlNow.appendChild(doc.createTextNode(' ' + irlNowText));
				});
			}
			if (typeof data.irlTomorrow !== 'undefined') {
				var tdIrlTomorrow = trTomorrow.insertCell(-1);
				tdIrlTomorrow.className = 'ft-irlWeather';
				Foxtrick.addImage(doc, tdIrlTomorrow, {
					src: 'Img.axd?res=Weather&img=weather' + data.irlTomorrow + '.png',
				}, false, function() {
					tdIrlTomorrow.appendChild(doc.createTextNode(' ' + irlTomorrowText));
				});
			}
		}
	},

	fetchRegion: function(doc, regionId) {
		var module = this;

		// 6 hours seems to be the minimum interval between HT updates
		// using a smaller value to ensure frequent updates
		var CACHE_HOURS = 4;
		var CACHE_MSECS = CACHE_HOURS * Foxtrick.util.time.MSECS_IN_HOUR;

		var now = Foxtrick.util.time.getHTTimeStamp(doc);
		if (!now)
			return;

		var until = now + CACHE_MSECS;

		/** @type {CHPPParams} */
		var parameters = [
			['file', 'regiondetails'],
			['version', '1.2'],
			['regionId', regionId],
		];

		Foxtrick.util.api.retrieve(doc, parameters, { cache: until }, (xml, errorText) => {
			if (!xml || errorText) {
				Foxtrick.log(errorText);
				return;
			}

			var data = {};
			data.weatherNow = xml.num('WeatherID');
			data.weatherTomorrow = xml.num('TomorrowWeatherID');
			data.regionName = xml.text('RegionName').replace(/'/g, '').replace(/ ,/g, '-');

			var leagueId = xml.num('LeagueID');
			data.country = Foxtrick.L10n.getCountryNameEnglish(leagueId);

			if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Irl')) {
				var weather = { 1: 3, 2: 2, 3: 2, 4: 1, 9: 0, 10: 1, 11: 0, 13: 0, 50: 1 };

				var url = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' +
					encodeURIComponent(data.regionName) + ',' + data.country +
					'&mode=json&units=metric&cnt=2&APPID=904808f94702b520590a4cfd0aff8f85';

				Foxtrick.log('Fetching JSON data from', url);

				var now = Foxtrick.modules.Core.HT_TIME;
				var until = now + CACHE_MSECS;

				Foxtrick.load(url, null, until).then(Foxtrick.parseJSON)
					.then(function(json) {
						if (json) {
							if (json.cod == 200 && json.list.length == 2) {
								var now = json.list[0].weather[0].icon;
								var tomorrow = json.list[1].weather[0].icon;
								data.irlNow = weather[Foxtrick.trimnum(now)];
								data.irlTomorrow = weather[Foxtrick.trimnum(tomorrow)];
							}
						}

						module.showWeather(doc, data);
					}, function(resp) {
						Foxtrick.log('Fail loading weather:', resp);
						module.showWeather(doc, data);
					}).catch(Foxtrick.catch(module));
			}
			else {
				module.showWeather(doc, data);
			}

		});
	},
};
