'use strict';
/**
 * match-weather.js
 * add ht and irl weather for today and tomorrow on match page
 * @author teles
 */

Foxtrick.modules['MatchWeather'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['match'],
	OPTIONS: ['Irl'],
	CSS: Foxtrick.InternalPath + 'resources/css/match-weather.css',

	run: function(doc) {
		var module = this;
		if (!Foxtrick.Pages.Match.isPrematch(doc))
			return;

		var arenaLink = doc.querySelector('#mainBody a[href*="ArenaID="]');
		var arenaId = Foxtrick.getParameterFromUrl(arenaLink.href, 'arenaId');
		var parameters = [
			['file', 'arenadetails'],
			['version', '1.5'],
			['arenaId', parseInt(arenaId, 10)],
		];
		Foxtrick.util.api.retrieve(doc, parameters, { cache_lifetime: 'session' },
		  function(xml, errorText) {
			if (!xml || errorText) {
				Foxtrick.log(errorText);
				return;
			}

			var regionID = xml.num('RegionID');
			Foxtrick.sessionGet('weather.region.' + regionID,
			  function(data) {
				if (!data) {
					module.fetchRegion(doc, regionID);
				}
				else {
					module.showWeather(doc, data);
				}
			});
		});
	},

	showWeather: function(doc, data) {
		var expectedText = Foxtrick.L10n.getString('matchWeather.expected');
		var todayText = Foxtrick.L10n.getString('matchWeather.today');
		var tomorrowText = Foxtrick.L10n.getString('matchWeather.tomorrow');
		var irlNowText = Foxtrick.L10n.getString('matchWeather.irltoday');
		var irlTomorrowText = Foxtrick.L10n.getString('matchWeather.irltomorrow');

		var preMatchPanel = Foxtrick.Pages.Match.getPreMatchPanel(doc);
		var div = preMatchPanel.querySelector('div');
		var img = div.querySelector('p:last-child img');
		if (img)
			img.parentNode.appendChild(doc.createTextNode(' ' + expectedText));

		var pN = Foxtrick.createFeaturedElement(doc, this, 'p');
		Foxtrick.addImage(doc, pN, {
			src: 'Img.axd?res=Weather&img=weather' + data.weatherNow + '.png'
		}, false, function() {
			pN.appendChild(doc.createTextNode(' ' + todayText));
		});
		div.appendChild(pN);

		var pT = Foxtrick.createFeaturedElement(doc, this, 'p');
		Foxtrick.addImage(doc, pT, {
			src: 'Img.axd?res=Weather&img=weather' + data.weatherTomorrow + '.png'
		}, false, function() {
			pT.appendChild(doc.createTextNode(' ' + tomorrowText));
		});
		div.appendChild(pT);

		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchWeather', 'Irl')) {
			if (typeof data.irlNow !== 'undefined') {
				Foxtrick.addClass(pN, 'ft-match-weather');
				var iN = Foxtrick.createFeaturedElement(doc, this, 'p');
				Foxtrick.addImage(doc, iN, {
					src: 'Img.axd?res=Weather&img=weather' + data.irlNow + '.png'
				}, false, function() {
					iN.appendChild(doc.createTextNode(' ' + irlNowText));
				});

				div.insertBefore(iN, pT);
			}
			if (typeof data.irlTomorrow !== 'undefined') {
				Foxtrick.addClass(pT, 'ft-match-weather');
				var iT = Foxtrick.createFeaturedElement(doc, this, 'p');
				Foxtrick.addImage(doc, iT, {
					src: 'Img.axd?res=Weather&img=weather' + data.irlTomorrow + '.png'
				}, false, function() {
					iT.appendChild(doc.createTextNode(' ' + irlTomorrowText));
				});
				div.appendChild(iT);
			}
		}
	},

	fetchRegion: function(doc, regionId) {
		var module = this;
		var parameters = [
			['file', 'regiondetails'],
			['version', '1.2'],
			['regionId', regionId]
		];
		Foxtrick.util.api.retrieve(doc, parameters, { cache_lifetime: 'session' },
		  function(xml, errorText) {
			if (!xml || errorText) {
				Foxtrick.log(errorText);
				return;
			}
			var data = {};
			data.weatherNow = xml.num('WeatherID');
			data.weatherTomorrow = xml.num('TomorrowWeatherID');
			data.regionName = xml.text('RegionName').replace('\'', '').replace(/ ,/g, '-');
			var leagueId = xml.text('LeagueID');
			data.country = Foxtrick.L10n.getCountryNameEnglish(leagueId);

			if (Foxtrick.Prefs.isModuleOptionEnabled('MatchWeather', 'Irl')) {
				var uri = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' +
					encodeURIComponent(data.regionName) + ',' + data.country +
					'&mode=json&units=metric&cnt=2';
				var weather = { 1: 3, 2: 2, 3: 2, 4: 1, 9: 0, 10: 1, 11: 0, 13: 0, 50: 1 };

				Foxtrick.log('Fetching JSON data from', uri);
				Foxtrick.util.load.get(uri)('success', function(response) {
					if (response !== '') {
						var json;
						try {
							json = JSON.parse(response);
						}
						catch (e) {
							Foxtrick.error(e);
							return;
						}

						if (json.cod == 200 && json.list.length == 2) {
							var now = json.list[0].weather[0].icon;
							var tomorrow = json.list[1].weather[0].icon;
							data.irlNow = weather[Foxtrick.trimnum(now)];
							data.irlTomorrow = weather[Foxtrick.trimnum(tomorrow)];
						}
					}
					Foxtrick.sessionSet('weather.region.' + regionId, data);
					module.showWeather(doc, data);
				})('failure', function(code) {
					Foxtrick.log('Fail loading weather:' + code);
					Foxtrick.sessionSet('weather.region.' + regionId, data);
					module.showWeather(doc, data);
				});
			}
			else {
				Foxtrick.sessionSet('weather.region.' + regionId, data);
				module.showWeather(doc, data);
			}
		});
	}
};
