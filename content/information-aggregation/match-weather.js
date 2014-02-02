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
		var me = this;
		var imgW = doc.querySelector('#ctl00_ctl00_CPContent_CPMain_pnlPreMatch > ' +
									 'div:not(.float_left) a[href*="ArenaID="]');
		if (!imgW)
			return; // no arena id, match played or ongoing, no need to have tomorrow weather

		var reg = /ArenaID=(\d+)/i;
		var arenaID = imgW.href.match(reg);

		var parameters = [
			['file', 'arenadetails'],
			['version', '1.5'],
			['arenaID', arenaID[1]]
		];
		Foxtrick.util.api.retrieve(doc, parameters, { cache_lifetime: 'session' },
		  function(xml, errorText) {
			if (!xml || errorText) {
				Foxtrick.log(errorText);
				return;
			}

			var regionID = xml.getElementsByTagName('RegionID')[0].textContent;
			Foxtrick.sessionGet('weather.region.' + regionID,
			  function(data) {
				if(!data) {
					me.fetchRegion(doc, regionID);
				} else {
					me.showWeather(doc, data);
				}
			});
		});
	},

	showWeather: function(doc, data) {
		var div =
			doc.querySelector('#ctl00_ctl00_CPContent_CPMain_pnlPreMatch > div:not(.float_left)' +
							  ':not(#ctl00_ctl00_CPContent_CPMain_pnlTeamInfo)');
		if (!div)
			return;

		var expectedText = Foxtrick.L10n.getString('matchWeather.expected');
		var todayText = Foxtrick.L10n.getString('matchWeather.today');
		var tomorrowText = Foxtrick.L10n.getString('matchWeather.tomorrow');
		var irlNowText = Foxtrick.L10n.getString('matchWeather.irltoday');
		var irlTomorrowText = Foxtrick.L10n.getString('matchWeather.irltomorrow');

		var img = div.querySelector('p:last-child img');
		if (img)
			img.parentNode.appendChild(doc.createTextNode(' ' + expectedText));
		var pN = doc.createElement('p');
		Foxtrick.addImage(doc, pN, {
			src: 'Img.axd?res=Weather&img=weather' + data.weatherNow + '.png'
		}, false, function() {
			pN.appendChild(doc.createTextNode(' ' + todayText));
		});
		div.appendChild(pN);
		var pT = doc.createElement('p');
		Foxtrick.addImage(doc, pT, {
			src: 'Img.axd?res=Weather&img=weather' + data.weatherTomorrow + '.png'
		}, false, function() {
			pT.appendChild(doc.createTextNode(' ' + tomorrowText));
		});
		div.appendChild(pT);
		Foxtrick.makeFeaturedElement(pT, 'MatchWeather');

		if (Foxtrick.Prefs.isModuleOptionEnabled('MatchWeather', 'Irl')) {
			if (typeof data.irlNow !== 'undefined') {
				Foxtrick.addClass(pN, 'ft-match-weather');
				var iN = doc.createElement('p');
				Foxtrick.addImage(doc, iN, {
					src: 'Img.axd?res=Weather&img=weather' + data.irlNow + '.png'
				}, false, function() {
					iN.appendChild(doc.createTextNode(' ' + irlNowText));
				});

				div.insertBefore(iN, pT);
				Foxtrick.makeFeaturedElement(iN, 'MatchWeather');
			}
			if (typeof data.irlTomorrow !== 'undefined') {
				Foxtrick.addClass(pT, 'ft-match-weather');
				var iT = doc.createElement('p');
				Foxtrick.addImage(doc, iT, {
					src: 'Img.axd?res=Weather&img=weather' + data.irlTomorrow + '.png'
				}, false, function() {
					iT.appendChild(doc.createTextNode(' ' + irlTomorrowText));
				});
				div.appendChild(iT);
				Foxtrick.makeFeaturedElement(iT, 'MatchWeather');
			}
		}
	},

	fetchRegion: function(doc, regionID) {
		var me = this;
		var parameters = [
			['file', 'regiondetails'],
			['version', '1.2'],
			['regionID', regionID]
		];
		Foxtrick.util.api.retrieve(doc, parameters, { cache_lifetime: 'session' },
		  function(xml, errorText) {
			if (!xml || errorText) {
				Foxtrick.log(errorText);
				return;
			}
			var data = {};
			data.weatherNow = xml.getElementsByTagName('WeatherID')[0].textContent;
			data.weatherTomorrow = xml.getElementsByTagName('TomorrowWeatherID')[0].textContent;
			data.regionName = xml.getElementsByTagName('RegionName')[0].textContent
				.replace("'", '').replace(' ', '-').replace(',', '-');
			data.country = xml.getElementsByTagName('LeagueName')[0].textContent;

			if (Foxtrick.Prefs.isModuleOptionEnabled('MatchWeather', 'Irl')) {
				var uri = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' +
					encodeURIComponent(data.regionName) + ',' + data.country +
					'&mode=json&units=metric&cnt=2';
				Foxtrick.log('Fetching JSON data from', uri);
				Foxtrick.util.load.get(uri)('success', function(response) {
					if (response !== '') {
						var json = JSON.parse(response);
						if (json.cod == 200 && json.list.length == 2) {
							var matching = {1:3, 2:2, 3:2, 4:1, 9:0, 10:1, 11:0, 13:0, 50:1};
							data.irlNow = matching[Foxtrick.trimnum(json.list[0].weather[0].icon)];
							data.irlTomorrow = matching[Foxtrick.trimnum(json.list[1].weather[0].icon)];
						}
					}
					Foxtrick.sessionSet('weather.region.' + regionID, data);
					me.showWeather(doc, data);
				})('failure', function(code) {
					Foxtrick.log('Fail loading weather:' + code);
					Foxtrick.sessionSet('weather.region.' + regionID, data);
					me.showWeather(doc, data);
				});
			} else {
				Foxtrick.sessionSet('weather.region.' + regionID, data);
				me.showWeather(doc, data);
			}
		});
	}
};
